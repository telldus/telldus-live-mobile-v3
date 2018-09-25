package com.telldus.live.mobile;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;

import java.lang.System;
import java.lang.String;
import android.util.Log;

public class WidgetModule extends ReactContextBaseJavaModule {

  public WidgetModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "AndroidWidget";
  }

  @ReactMethod
  public void configureWidgetData(ReadableMap configData,ReadableMap sessionData) {
    ReadableMapKeySetIterator it = configData.keySetIterator();
    while (it.hasNextKey()) {
        String key = it.nextKey();
        switch (configData.getType(key)) {
            case String:
            System.out.println("---------------------");
            System.out.println(configData.getString(key));
            System.out.println("---------------------");
            break;
            default:
            break;
        }
    }
  }
}