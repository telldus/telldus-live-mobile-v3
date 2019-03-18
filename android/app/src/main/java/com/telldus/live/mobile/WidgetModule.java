/**
 * Copyright 2016-present Telldus Technologies AB.
 *
 * This file is part of the Telldus Live! app.
 *
 * Telldus Live! app is free : you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Telldus Live! app is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Telldus Live! app.  If not, see <http://www.gnu.org/licenses/>.
 */

package com.telldus.live.mobile;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.util.Log;
import android.widget.RemoteViews;
import android.view.View;
import android.content.Intent;
import android.database.Cursor;

import java.lang.System;
import java.lang.String;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Model.SensorInfo;
import com.telldus.live.mobile.NewAppWidget;
import com.telldus.live.mobile.NewOnOffWidget;
import com.telldus.live.mobile.NewSensorWidget;
import com.telldus.live.mobile.Utility.DevicesUtilities;

import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Database.MyDBHandler;
import com.facebook.react.bridge.ReadableArray;

public class WidgetModule extends ReactContextBaseJavaModule {

  private PrefManager prefManager;

  private static String widgetDevice2By1 = "WIDGET_DEVICE_2_BY_1";
  private static String widgetDevice3By1 = "WIDGET_DEVICE_3_BY_1";

  public WidgetModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "AndroidWidget";
  }

  @ReactMethod
  public void configureWidgetAuthData(String accessToken, String refreshToken, String expiresIn, String clientId, String clientSecret, String userId) {
    prefManager = new PrefManager(getReactApplicationContext());

    prefManager.setAccessDetails(accessToken, expiresIn, clientId, clientSecret, refreshToken);
    prefManager.setUserId(userId);
    int widgetIdsSensor[] = AppWidgetManager.getInstance(getReactApplicationContext()).getAppWidgetIds(new ComponentName(getReactApplicationContext(), NewSensorWidget.class));
    for (int widgetId : widgetIdsSensor) {
      updateUIWidgetSensor(widgetId);
    }
    int widgetIdsDevice2By1[] = AppWidgetManager.getInstance(getReactApplicationContext()).getAppWidgetIds(new ComponentName(getReactApplicationContext(), NewOnOffWidget.class));
    for (int widgetId : widgetIdsDevice2By1) {
      updateUIWidgetDevice2By1(widgetId);
    }
    int widgetIdsDevice3By1[] = AppWidgetManager.getInstance(getReactApplicationContext()).getAppWidgetIds(new ComponentName(getReactApplicationContext(), NewAppWidget.class));
    for (int widgetId : widgetIdsDevice3By1) {
      updateUIWidgetDevice3By1(widgetId);
    }
  }

  @ReactMethod
  public void disableWidget(Integer id, String widgetType) {

    MyDBHandler db = new MyDBHandler(getReactApplicationContext());
    if (String.valueOf(widgetType).equals("SENSOR")) {
      ArrayList<SensorInfo> list = new ArrayList<SensorInfo>();
      list = db.getAllWidgetsWithSensorId(id);
      Iterator<SensorInfo> iterator = list.iterator();
      while (iterator.hasNext()) {
        SensorInfo item = iterator.next();
        Integer wId = item.getWidgetId();
        if (wId != null) {
          db.updateSensorIdSensorWidget(-1, wId);

          AppWidgetManager widgetManager = AppWidgetManager.getInstance(getReactApplicationContext());
          NewSensorWidget.updateAppWidget(getReactApplicationContext(), widgetManager, wId);
        }
      }
    }
    if (String.valueOf(widgetType).equals("DEVICE")) {
      ArrayList<DeviceInfo> list = new ArrayList<DeviceInfo>();
      list = db.getAllWidgetsWithDeviceId(id);
      Iterator<DeviceInfo> iterator = list.iterator();
      while (iterator.hasNext()) {
        DeviceInfo item = iterator.next();
        Integer wId = item.getWidgetId();
        if (wId != null) {
          db.updateDeviceIdDeviceWidget(-1, wId);

          AppWidgetManager widgetManager = AppWidgetManager.getInstance(getReactApplicationContext());
          NewOnOffWidget.updateAppWidget(getReactApplicationContext(), widgetManager, wId);
          NewAppWidget.updateAppWidget(getReactApplicationContext(), widgetManager, wId);
        }
      }
    }
  }

  @ReactMethod
  public void disableAllWidgets(String message) {
    RemoteViews widgetView = new RemoteViews(getReactApplicationContext().getPackageName(), R.layout.logged_out);

    // Replace Widget UI with loggedout message
    widgetView.setTextViewText(R.id.textWidgetBodyText, getReactApplicationContext().getResources().getString(R.string.message_user_logged_out));

    // Clear token and other credentials from shared preference
    prefManager = new PrefManager(getReactApplicationContext());
    prefManager.clear();

    AppWidgetManager.getInstance(getReactApplicationContext()).updateAppWidget(new ComponentName(getReactApplicationContext(), NewAppWidget.class), widgetView);
    AppWidgetManager.getInstance(getReactApplicationContext()).updateAppWidget(new ComponentName(getReactApplicationContext(), NewOnOffWidget.class), widgetView);
    AppWidgetManager.getInstance(getReactApplicationContext()).updateAppWidget(new ComponentName(getReactApplicationContext(), NewSensorWidget.class), widgetView);
  }

  @ReactMethod
  public void refreshWidgetsDevices(ReadableArray deviceIds) {
    refreshWidgetsDevices2By1(deviceIds);
    refreshWidgetsDevices3By1(deviceIds);
  }

  public void refreshWidgetsDevices2By1(ReadableArray deviceIds) {
    int widgetIds[] = getAllWidgetsDevice2By1();
    refreshWidgetsDevicesCommon(widgetIds, deviceIds, widgetDevice2By1);
  }

  public void refreshWidgetsDevices3By1(ReadableArray deviceIds) {
    int widgetIds[] = getAllWidgetsDevice3By1();
    refreshWidgetsDevicesCommon(widgetIds, deviceIds, widgetDevice3By1);
  }

  public void refreshWidgetsDevicesCommon(int[] widgetIds, ReadableArray deviceIds, String widgetType) {
    MyDBHandler db = new MyDBHandler(getReactApplicationContext());
    prefManager = new PrefManager(getReactApplicationContext());
    String currentUserId = prefManager.getUserId();

    for (int widgetId : widgetIds) {
      Boolean isInList = false;
      String userId = "";
      Integer deviceIdCurrent = -1;
      for (int i = 0; i < deviceIds.size(); i++) {
        String id = deviceIds.getString(i);

        DeviceInfo deviceInfo = db.findWidgetInfoDevice(widgetId);
        if (deviceInfo == null) {
          return;
        }

        deviceIdCurrent = deviceInfo.getDeviceId();
        userId = deviceInfo.getUserId();

        if (id.trim().equals(deviceIdCurrent.toString())) {
          isInList = true;
          break;
        }
      }

      Boolean isSameAccount = userId.trim().equals(currentUserId.trim());
      if (!isInList && isSameAccount) {
        if (deviceIdCurrent.intValue() != -1) {// If not already nullified
          db.setDeviceIdDeviceWidget(widgetId, -1);
          if (widgetType.equals(widgetDevice2By1)) {
            updateUIWidgetDevice2By1(widgetId);
          }
          if (widgetType.equals(widgetDevice3By1)) {
            updateUIWidgetDevice3By1(widgetId);
          }
        }
      }
    }
  }

  @ReactMethod
  public void refreshWidgetsSensors(ReadableArray sensorIds) {
    MyDBHandler db = new MyDBHandler(getReactApplicationContext());
    prefManager = new PrefManager(getReactApplicationContext());
    String currentUserId = prefManager.getUserId();

    int widgetIds[] = getAllWidgetsSensor();
    for (int widgetId : widgetIds) {
      Boolean isInList = false;
      String userId = "";
      Integer sensorIdCurrent = -1;
      for (int i = 0; i < sensorIds.size(); i++) {
        String id = sensorIds.getString(i);

        SensorInfo sensorInfo = db.findWidgetInfoSensor(widgetId);
        if (sensorInfo == null) {
          return;
        }
        sensorIdCurrent = sensorInfo.getSensorId();
        userId = sensorInfo.getUserId();

        if (id.trim().equals(sensorIdCurrent.toString())) {
          isInList = true;
          break;
        }
      }

      Boolean isSameAccount = userId.trim().equals(currentUserId.trim());
      if (!isInList && isSameAccount) {
        if (sensorIdCurrent.intValue() != -1) {// If not already nullified
          db.setSensorIdSensorWidget(widgetId, -1);
          updateUIWidgetSensor(widgetId);
        }
      }
    }
  }

  public void updateUIWidgetSensor(int widgetId) {
    AppWidgetManager widgetManager = AppWidgetManager.getInstance(getReactApplicationContext());
    NewSensorWidget.updateAppWidget(getReactApplicationContext(), widgetManager, widgetId);
  }

  public void updateUIWidgetDevice2By1(int widgetId) {
    AppWidgetManager widgetManager = AppWidgetManager.getInstance(getReactApplicationContext());
    NewOnOffWidget.updateAppWidget(getReactApplicationContext(), widgetManager, widgetId);
  }

  public void updateUIWidgetDevice3By1(int widgetId) {
    AppWidgetManager widgetManager = AppWidgetManager.getInstance(getReactApplicationContext());
    NewAppWidget.updateAppWidget(getReactApplicationContext(), widgetManager, widgetId);
  }

  public int[] getAllWidgetsSensor() {
    return AppWidgetManager.getInstance(getReactApplicationContext()).getAppWidgetIds(new ComponentName(getReactApplicationContext(), NewSensorWidget.class));
  }

  public int[] getAllWidgetsDevice2By1() {
    return AppWidgetManager.getInstance(getReactApplicationContext()).getAppWidgetIds(new ComponentName(getReactApplicationContext(), NewOnOffWidget.class));
  }

  public int[] getAllWidgetsDevice3By1() {
    return AppWidgetManager.getInstance(getReactApplicationContext()).getAppWidgetIds(new ComponentName(getReactApplicationContext(), NewAppWidget.class));
  }
}