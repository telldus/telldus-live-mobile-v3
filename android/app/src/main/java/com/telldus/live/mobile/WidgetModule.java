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

import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Model.SensorInfo;
import com.telldus.live.mobile.NewAppWidget;
import com.telldus.live.mobile.NewOnOffWidget;
import com.telldus.live.mobile.NewSensorWidget;

import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Database.MyDBHandler;
import com.facebook.react.bridge.ReadableArray;

public class WidgetModule extends ReactContextBaseJavaModule {

  private PrefManager prefManager;

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

    prefManager.timeStampAccessToken(expiresIn);
    prefManager.AccessTokenDetails(accessToken, expiresIn);
    prefManager.infoAccessToken(clientId, clientSecret, refreshToken);
    prefManager.setUserId(userId);
  }

  @ReactMethod
  public void configureWidgetSessionData(String sessionId) {
    prefManager = new PrefManager(getReactApplicationContext());

    prefManager.saveSessionID(sessionId);
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
        Integer wId = item.getWidgetID();
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
        Integer wId = item.getWidgetID();
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
    RemoteViews widgetView = new RemoteViews(getReactApplicationContext().getPackageName(), R.layout.new_app_widget);

    // Replace Widget UI with loggedout message
    widgetView.removeAllViews(R.id.widget_content_cover);
    widgetView.setTextViewText(R.id.txtWidgetTitle, message);

    // Stop socket service
    getReactApplicationContext().stopService(new Intent(getReactApplicationContext(), MyService.class));

    // Clear token and other credentials from shared preference
    prefManager = new PrefManager(getReactApplicationContext());
    prefManager.clear();

    AppWidgetManager.getInstance(getReactApplicationContext()).updateAppWidget(new ComponentName(getReactApplicationContext(), NewAppWidget.class), widgetView);
    AppWidgetManager.getInstance(getReactApplicationContext()).updateAppWidget(new ComponentName(getReactApplicationContext(), NewOnOffWidget.class), widgetView);
    AppWidgetManager.getInstance(getReactApplicationContext()).updateAppWidget(new ComponentName(getReactApplicationContext(), NewSensorWidget.class), widgetView);
  }

  @ReactMethod
  public void refreshWidgetsDevices(ReadableArray deviceIds) {
    MyDBHandler db = new MyDBHandler(getReactApplicationContext());
    ArrayList<Integer> devices = db.getAllWidgetDevices();

    Iterator<Integer> iterator = devices.iterator();
    while (iterator.hasNext()) {
      Integer item = iterator.next();
      Boolean isInList = false;
      for (int i = 0; i < deviceIds.size(); i++) {
        String id = deviceIds.getString(i);
        if (id.trim().equals(item.toString())) {
          isInList = true;
        }
      }
      if (!isInList) {
        if (item.intValue() != -1) {// If not already nullified
          db.nullifyDeviceIdDeviceWidget(item);
        }
        // ToDo: Trigger Update widget here
      }
    }
  }

  @ReactMethod
  public void refreshWidgetsSensors(ReadableArray sensorIds) {
    MyDBHandler db = new MyDBHandler(getReactApplicationContext());
    ArrayList<Integer> sensors = db.getAllWidgetSensors();

    Iterator<Integer> iterator = sensors.iterator();
    while (iterator.hasNext()) {
      Integer item = iterator.next();
      Boolean isInList = false;
      for (int i = 0; i < sensorIds.size(); i++) {
        String id = sensorIds.getString(i);
        if (id.trim().equals(item.toString())) {
          isInList = true;
        }
      }
      if (!isInList) {
        if (item.intValue() != -1) {// If not already nullified
          db.nullifySensorIdSensorWidget(item);
        }
        // ToDo: Trigger Update widget here
      }
    }
  }
}