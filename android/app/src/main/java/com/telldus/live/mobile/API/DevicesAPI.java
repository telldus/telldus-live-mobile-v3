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

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;

import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.API.API;
import com.telldus.live.mobile.API.OnAPITaskComplete;
import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.NewOnOffWidget;

import java.util.concurrent.Callable;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONObject;

public class DevicesAPI {
    private static Integer supportedMethodsAggreg = 1975;

    private static Handler handler;
    private static Runnable runnable;
    private static Map<Integer, Handler> deviceInfoPendingCheckList = new HashMap<Integer, Handler>();

    public void setDeviceState(final Integer deviceId, final Integer method, Integer stateValue, int widgetID, final Context context, final OnAPITaskComplete callBack) {
        String params = "device/command?id="+deviceId+"&method="+method+"&value=stateValue";
        API endPoints = new API();
        endPoints.callEndPoint(context, params, new OnAPITaskComplete() {
            @Override
            public void onSuccess(JSONObject response) {
                try {
                    String status = response.optString("status");
                    String error = response.optString("error");
                    if (!status.isEmpty() && status != null && status.equalsIgnoreCase("success")) {
                        if (method.intValue() != 32) {
                            Handler pendingHandler = deviceInfoPendingCheckList.get(deviceId);
                            if (pendingHandler != null) {
                                pendingHandler.removeCallbacks(runnable);
                                deviceInfoPendingCheckList.remove(deviceId);
                            }
                            handler = new Handler(Looper.getMainLooper());
                            runnable = new Runnable(){
                                @Override
                                public void run() {
                                    // Check if socket has already updated.
                                    MyDBHandler db = new MyDBHandler(context);
                                    DeviceInfo info = db.findUser(widgetID);
                                    if (info != null) {
                                        String currentState = info.getState();
                                        String requestedState = String.valueOf(method);
                                        if (!currentState.equals(requestedState)) {
                                            getDeviceInfo(deviceId, method, widgetID, context, callBack);
                                        }
                                    }

                                    Handler finishedHandler = deviceInfoPendingCheckList.get(deviceId);
                                    if (finishedHandler != null) {
                                        finishedHandler.removeCallbacks(runnable);
                                    }
                                    deviceInfoPendingCheckList.remove(deviceId);
                                }
                            };
                            deviceInfoPendingCheckList.put(deviceId, handler);
                            handler.postDelayed(runnable, 10000);
                        }
                    }
                    if (!error.isEmpty() && error != null) {
                        Toast.makeText(context, error, Toast.LENGTH_LONG).show();
                        callBack.onSuccess(response);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    callBack.onSuccess(response);
                };
            }
            @Override
            public void onError(ANError error) {
                callBack.onError(error);
            }
        });
    }

    public void getDeviceInfo(final Integer deviceId, final Integer requestedState, int widgetID, final Context context, final OnAPITaskComplete callBack) {
        String params =  "device/info?id="+deviceId+"+&supportedMethods="+supportedMethodsAggreg;
        API endPoints = new API();
        endPoints.callEndPoint(context, params, new OnAPITaskComplete() {
            @Override
            public void onSuccess(JSONObject response) {
                try {
                    MyDBHandler db = new MyDBHandler(context);
                    DeviceInfo info = db.findUser(widgetID);
                    if (info != null) {
                        String currentState = info.getState();
                        String reqState = String.valueOf(requestedState);
                        String newState = response.optString("state");

                        if (newState.equals(currentState)) {
                            db.updateActionDevice(newState, deviceId);
                            if (!newState.equals(reqState)) {
                                Toast.makeText(context, "Action Currently Unavailable", Toast.LENGTH_LONG).show();
                            }
                            callBack.onSuccess(response);
                        } else {
                            db.updateActionDevice(newState, deviceId);
                            callBack.onSuccess(response);
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    callBack.onSuccess(response);
                };
            }
            @Override
            public void onError(ANError error) {
                callBack.onError(error);
            }
        });
    }
}