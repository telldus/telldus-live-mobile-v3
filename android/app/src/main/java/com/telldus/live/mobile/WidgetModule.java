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

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;

import java.lang.String;
import java.util.ArrayList;
import java.util.Iterator;

import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Model.SensorInfo;
import com.telldus.live.mobile.WidgetsUpdater;

import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Database.MyDBHandler;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

public class WidgetModule extends ReactContextBaseJavaModule {

  private PrefManager prefManager;

  private static String widgetDevice2By1 = "WIDGET_DEVICE_2_BY_1";
  private static String widgetDevice3By1 = "WIDGET_DEVICE_3_BY_1";
  private static String widgetSensor = "WIDGET_SENSOR";

  private static String ACTION_LOGIN = "ACTION_LOGIN";

  WidgetsUpdater wUpdater = new WidgetsUpdater();

  public WidgetModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "AndroidWidget";
  }

  @ReactMethod
  public void configureWidgetAuthData(String accessToken, String refreshToken, String expiresIn, String clientId, String clientSecret, String userId, Integer pro) {
    Context context = getReactApplicationContext();
    prefManager = new PrefManager(context);

    prefManager.setAccessDetails(accessToken, expiresIn, clientId, clientSecret, refreshToken);
    prefManager.setUserId(userId, pro);
    int widgetIdsSensor[] = AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, NewSensorWidget.class));
    for (int widgetId : widgetIdsSensor) {
      wUpdater.updateUIWidgetSensor(widgetId, context);
    }
    int widgetIdsDevice2By1[] = AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, NewOnOffWidget.class));
    for (int widgetId : widgetIdsDevice2By1) {
      wUpdater.updateUIWidgetDevice2By1(widgetId, context);
    }
    int widgetIdsDevice3By1[] = AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, NewAppWidget.class));
    for (int widgetId : widgetIdsDevice3By1) {
      wUpdater.updateUIWidgetDevice3By1(widgetId, context);
    }
  }

  @ReactMethod
  public void disableWidget(Integer id, String widgetType) {
    Context context = getReactApplicationContext();
    MyDBHandler db = new MyDBHandler(context);
    if (String.valueOf(widgetType).equals("SENSOR")) {
      ArrayList<SensorInfo> list = new ArrayList<SensorInfo>();
      list = db.getAllWidgetsWithSensorId(id);
      Iterator<SensorInfo> iterator = list.iterator();
      while (iterator.hasNext()) {
        SensorInfo item = iterator.next();
        Integer wId = item.getWidgetId();
        if (wId != null) {
          db.updateSensorIdSensorWidget(-1, wId);

          AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
          NewSensorWidget.updateAppWidget(context, widgetManager, wId);
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

          AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
          NewOnOffWidget.updateAppWidget(context, widgetManager, wId);
          NewAppWidget.updateAppWidget(context, widgetManager, wId);
        }
      }
    }
  }

  @ReactMethod
  public void disableAllWidgets() {
    Context context = getReactApplicationContext();
    prefManager = new PrefManager(context);
    prefManager.setUserId("null", -1);

    int widgetIdsS[] = wUpdater.getAllWidgetsSensor(context);
    disableWidgetsOnLogout(widgetIdsS, widgetSensor);
    int widgetIdsD2[] = wUpdater.getAllWidgetsDevice2By1(context);
    disableWidgetsOnLogout(widgetIdsD2, widgetDevice2By1);
    int widgetIdsD3[] = wUpdater.getAllWidgetsDevice3By1(context);
    disableWidgetsOnLogout(widgetIdsD3, widgetDevice3By1);

    // Clear token and other credentials from shared preference
    prefManager.clear();
  }

  public void disableWidgetsOnLogout (int[] widgetIds, String widgetType) {
    Context context = getReactApplicationContext();
    for (int widgetId : widgetIds) {

      if (widgetType.equals(widgetSensor)) {
        wUpdater.updateUIWidgetSensor(widgetId, context);
      }
      if (widgetType.equals(widgetDevice2By1)) {
        wUpdater.updateUIWidgetDevice2By1(widgetId, context);
      }
      if (widgetType.equals(widgetDevice3By1)) {
        wUpdater.updateUIWidgetDevice3By1(widgetId, context);
      }
    }
  }

  @ReactMethod
  public void refreshWidgetsDevices(ReadableArray deviceIds, ReadableMap devicesData) {
    refreshWidgetsDevices2By1(deviceIds, devicesData);
    refreshWidgetsDevices3By1(deviceIds, devicesData);
  }

  public void refreshWidgetsDevices2By1(ReadableArray deviceIds, ReadableMap devicesData) {
    Context context = getReactApplicationContext();
    int widgetIds[] = wUpdater.getAllWidgetsDevice2By1(context);
    refreshWidgetsDevicesCommon(widgetIds, deviceIds, devicesData, widgetDevice2By1);
  }

  public void refreshWidgetsDevices3By1(ReadableArray deviceIds, ReadableMap devicesData) {
    Context context = getReactApplicationContext();
    int widgetIds[] = wUpdater.getAllWidgetsDevice3By1(context);
    refreshWidgetsDevicesCommon(widgetIds, deviceIds, devicesData, widgetDevice3By1);
  }

  public void refreshWidgetsDevicesCommon(int[] widgetIds, ReadableArray deviceIds, ReadableMap devicesData, String widgetType) {
    Context context = getReactApplicationContext();
    MyDBHandler db = new MyDBHandler(context);
    prefManager = new PrefManager(context);
    String currentUserId = prefManager.getUserId();

    ReadableMap deviceData = null;
    String currentName = null;

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

        if (id.trim().equals(deviceIdCurrent.toString())) {
          isInList = true;
          deviceIdCurrent = deviceInfo.getDeviceId();
          userId = deviceInfo.getUserId();
          currentName = deviceInfo.getDeviceName();

          if (devicesData.hasKey(id)) {
            deviceData = devicesData.getMap(id);
          }
          break;
        }
      }

      Boolean isSameAccount = userId.trim().equals(currentUserId.trim());
      if (!isInList && isSameAccount) {
        if (deviceIdCurrent.intValue() != -1) {// If not already nullified
          db.setDeviceIdDeviceWidget(widgetId, -1);
          if (widgetType.equals(widgetDevice2By1)) {
            wUpdater.updateUIWidgetDevice2By1(widgetId, context);
          }
          if (widgetType.equals(widgetDevice3By1)) {
            wUpdater.updateUIWidgetDevice3By1(widgetId, context);
          }
        }
      }

      if (isInList && isSameAccount && deviceData != null && deviceData.hasKey("name")) {
        String newName = deviceData.getString("name");
        if (newName != null && !newName.equals(currentName) && deviceIdCurrent.intValue() != -1) {
          db.updateDeviceName(newName, deviceIdCurrent);
          if (widgetType.equals(widgetDevice2By1)) {
            wUpdater.updateUIWidgetDevice2By1(widgetId, context);
          }
          if (widgetType.equals(widgetDevice3By1)) {
            wUpdater.updateUIWidgetDevice3By1(widgetId, context);
          }
        }
      }
    }
  }

  @ReactMethod
  public void refreshWidgetsSensors(ReadableArray sensorIds, ReadableMap sensorsData) {
    Context context = getReactApplicationContext();
    MyDBHandler db = new MyDBHandler(context);
    prefManager = new PrefManager(context);
    String currentUserId = prefManager.getUserId();

    ReadableMap sensorData = null;
    String currentName = null;

    int widgetIds[] = wUpdater.getAllWidgetsSensor(context);
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

        if (id.trim().equals(sensorIdCurrent.toString())) {
          isInList = true;
          sensorIdCurrent = sensorInfo.getSensorId();
          userId = sensorInfo.getUserId();
          currentName = sensorInfo.getSensorName();

          if (sensorsData.hasKey(id)) {
            sensorData = sensorsData.getMap(id);
          }
          break;
        }
      }

      Boolean isSameAccount = userId.trim().equals(currentUserId.trim());
      if (!isInList && isSameAccount) {
        if (sensorIdCurrent.intValue() != -1) {// If not already nullified
          db.setSensorIdSensorWidget(widgetId, -1);
          wUpdater.updateUIWidgetSensor(widgetId, context);
        }
      }

      if (isInList && isSameAccount && sensorData != null && sensorData.hasKey("name")) {
        String newName = sensorData.getString("name");
        if (newName != null && !newName.equals(currentName) && sensorIdCurrent.intValue() != -1) {
          db.updateSensorName(newName, sensorIdCurrent);
          wUpdater.updateUIWidgetSensor(widgetId, context);
        }
      }
    }
  }
}