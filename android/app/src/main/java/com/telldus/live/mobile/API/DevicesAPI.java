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

package com.telldus.live.mobile.API;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.widget.Toast;
import android.appwidget.AppWidgetManager;

import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;

import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.API.API;
import com.telldus.live.mobile.API.OnAPITaskComplete;
import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.NewOnOffWidget;
import com.telldus.live.mobile.Utility.HandlerRunnablePair;

import java.util.concurrent.Callable;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONObject;

public class DevicesAPI {
    private static Integer supportedMethodsAggreg = 1975;

    private static Map<String, Map> deviceInfoPendingCheckList = new HashMap<String, Map>();
    Runnable runnableDeviceInfoCheck;
    private int runnableDeviceInfoCheckCount = 0;
    private long runnableDeviceInfoCheckInterval = 2000;
    private long runnableDeviceInfoCheckMaxTimeout = 10000;

    public void setDeviceState(final Integer deviceId, final Integer method, final Integer stateValue, final int widgetId, final Context context, final OnAPITaskComplete callBack) {
        String params = "/device/command?id="+deviceId+"&method="+method+"&value="+stateValue;
        API endPoints = new API();
        endPoints.callEndPoint(context, params, new OnAPITaskComplete() {
            @Override
            public void onSuccess(final JSONObject response) {
                try {
                    String status = response.optString("status");
                    String error = response.optString("error");
                    if (!status.isEmpty() && status != null && status.equalsIgnoreCase("success")) {
                        if (method.intValue() != 32) {
                            removeHandlerRunnablePair(deviceId, widgetId);
                            final Handler handlerDeviceInfoCheck = new Handler(Looper.getMainLooper());
                            runnableDeviceInfoCheck = new Runnable(){
                                @Override
                                public void run() {
                                    // Check if socket has already updated.
                                    MyDBHandler db = new MyDBHandler(context);
                                    DeviceInfo info = db.findWidgetInfoDevice(widgetId);
                                    Boolean reset = runnableDeviceInfoCheckCount == ((int) (runnableDeviceInfoCheckMaxTimeout / runnableDeviceInfoCheckInterval)) - 1;

                                    if (info != null) {
                                        String currentState = info.getState();
                                        if (currentState == null) {
                                            currentState = "null";
                                        }
                                        String requestedState = String.valueOf(method);
                                        String currentStateValue = info.getDeviceStateValue();
                                        String requestedStateValue = String.valueOf(stateValue);
                                        getDeviceInfo(deviceId, method, widgetId, reset, context, callBack);
                                    }
                                    handlerDeviceInfoCheck.postDelayed(runnableDeviceInfoCheck, runnableDeviceInfoCheckInterval);
                                    runnableDeviceInfoCheckCount++;
                                }
                            };
                            String key = String.valueOf(deviceId)+String.valueOf(widgetId);
                            handlerDeviceInfoCheck.postDelayed(runnableDeviceInfoCheck, runnableDeviceInfoCheckInterval);
                            Map<String, HandlerRunnablePair> handlerRunnableHashMap = new HashMap<String, HandlerRunnablePair>();
                            HandlerRunnablePair handlerRunnablePair = new HandlerRunnablePair(handlerDeviceInfoCheck, runnableDeviceInfoCheck);
                            handlerRunnablePair.setRunnable(runnableDeviceInfoCheck);
                            handlerRunnablePair.setHandler(handlerDeviceInfoCheck);
                            handlerRunnableHashMap.put("HandlerRunnablePair", handlerRunnablePair);
                            deviceInfoPendingCheckList.put(key, handlerRunnableHashMap);
                        }
                    }
                    if (!error.isEmpty() && error != null) {
                        MyDBHandler db = new MyDBHandler(context);
                        Toast.makeText(context, "Action Currently Unavailable", Toast.LENGTH_LONG).show();
                        callBack.onSuccess(response);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    MyDBHandler db = new MyDBHandler(context);
                    Toast.makeText(context, "Action Currently Unavailable", Toast.LENGTH_LONG).show();
                    callBack.onSuccess(response);
                };
            }
            @Override
            public void onError(ANError error) {
                MyDBHandler db = new MyDBHandler(context);
                Toast.makeText(context, "Action Currently Unavailable", Toast.LENGTH_LONG).show();
                callBack.onError(error);
            }
        });
    }

    public void getDeviceInfo(final Integer deviceId, final Integer requestedState, final int widgetId, final Boolean reset, final Context context, final OnAPITaskComplete callBack) {
        String params =  "/device/info?id="+deviceId+"+&supportedMethods="+supportedMethodsAggreg;
        API endPoints = new API();
        endPoints.callEndPoint(context, params, new OnAPITaskComplete() {
            @Override
            public void onSuccess(JSONObject response) {
                try {
                    String key = String.valueOf(deviceId)+String.valueOf(widgetId);
                    Map<String, HandlerRunnablePair> finishedHandlerRunnableHash = deviceInfoPendingCheckList.get(key);

                    MyDBHandler db = new MyDBHandler(context);
                    DeviceInfo info = db.findWidgetInfoDevice(widgetId);

                    if (info != null && finishedHandlerRunnableHash != null) {
                        String reqState = String.valueOf(requestedState);
                        String newState = response.optString("state");
                        String stateValue = response.optString("statevalue");
                        if (newState.equals(reqState)) {
                            db.updateDeviceState(newState, widgetId, stateValue);
                            removeHandlerRunnablePair(deviceId, widgetId);
                            callBack.onSuccess(response);
                            return;
                        }
                        if (reset && !newState.equals(reqState)) {
                            Toast.makeText(context, "Action Currently Unavailable", Toast.LENGTH_LONG).show();
                            removeHandlerRunnablePair(deviceId, widgetId);
                            callBack.onSuccess(response);
                            return;
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    if (reset) {
                        MyDBHandler db = new MyDBHandler(context);
                        Toast.makeText(context, "Action Currently Unavailable", Toast.LENGTH_LONG).show();
                        removeHandlerRunnablePair(deviceId, widgetId);
                        callBack.onSuccess(response);
                    }
                };
            }
            @Override
            public void onError(ANError error) {
                if (reset) {
                    MyDBHandler db = new MyDBHandler(context);
                    Toast.makeText(context, "Action Currently Unavailable", Toast.LENGTH_LONG).show();
                    removeHandlerRunnablePair(deviceId, widgetId);
                    callBack.onError(error);
                }
            }
        });
    }

    public void removeHandlerRunnablePair(int deviceId, int widgetId) {
        String key = String.valueOf(deviceId)+String.valueOf(widgetId);
        Map<String, HandlerRunnablePair> finishedHandlerRunnableHash = deviceInfoPendingCheckList.get(key);
        if (finishedHandlerRunnableHash != null) {
            HandlerRunnablePair finishedHandlerRunnablePair = finishedHandlerRunnableHash.get("HandlerRunnablePair");
            if (finishedHandlerRunnablePair != null) {
                Runnable finishedRunnable = finishedHandlerRunnablePair.getRunnable();
                Handler finishedHandler =  finishedHandlerRunnablePair.getHandler();
                finishedHandler.removeCallbacks(finishedRunnable);
                finishedHandlerRunnableHash.remove("HandlerRunnablePair");
                deviceInfoPendingCheckList.remove(key);
                runnableDeviceInfoCheckCount = 0;
            }
        }
    }
}