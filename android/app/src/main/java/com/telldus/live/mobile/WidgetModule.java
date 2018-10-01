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

import java.lang.System;
import java.lang.String;


import com.telldus.live.mobile.NewAppWidget;
import com.telldus.live.mobile.NewOnOffWidget;
import com.telldus.live.mobile.NewSensorWidget;

import com.telldus.live.mobile.Database.PrefManager;

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
  public void configureWidgetAuthData(String accessToken, String refreshToken, String expiresIn, String clientId, String clientSecret) {
    prefManager = new PrefManager(getReactApplicationContext());

    prefManager.timeStampAccessToken(expiresIn);
    prefManager.AccessTokenDetails(accessToken, expiresIn);
    prefManager.infoAccessToken(clientId, clientSecret, refreshToken);
  }

  @ReactMethod
  public void configureWidgetSessionData(String sessionId) {
    prefManager = new PrefManager(getReactApplicationContext());

    prefManager.saveSessionID(sessionId);
  }

  @ReactMethod
  public void disableAllWidgets(String message) {
    RemoteViews widgetView = new RemoteViews(getReactApplicationContext().getPackageName(), R.layout.new_app_widget);
    
    widgetView.removeAllViews(R.id.widget_content_cover);
    widgetView.setTextViewText(R.id.txtWidgetTitle, message);

    prefManager = new PrefManager(getReactApplicationContext());
    prefManager.clear();

    AppWidgetManager.getInstance(getReactApplicationContext()).updateAppWidget(new ComponentName(getReactApplicationContext(), NewAppWidget.class), widgetView);
    AppWidgetManager.getInstance(getReactApplicationContext()).updateAppWidget(new ComponentName(getReactApplicationContext(), NewOnOffWidget.class), widgetView);
    AppWidgetManager.getInstance(getReactApplicationContext()).updateAppWidget(new ComponentName(getReactApplicationContext(), NewSensorWidget.class), widgetView);
  }
}