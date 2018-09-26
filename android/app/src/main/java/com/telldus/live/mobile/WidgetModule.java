package com.telldus.live.mobile;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.lang.System;
import java.lang.String;
import android.util.Log;

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
    prefManager=new PrefManager(getReactApplicationContext());

    prefManager.timeStampAccessToken(expiresIn);
    prefManager.AccessTokenDetails(accessToken, expiresIn);
    prefManager.infoAccessToken(clientId, clientSecret, refreshToken);
  }


  @ReactMethod
  public void configureWidgetSessionData(String sessionId) {
    prefManager=new PrefManager(getReactApplicationContext());

    prefManager.saveSessionID(sessionId);
  }
}