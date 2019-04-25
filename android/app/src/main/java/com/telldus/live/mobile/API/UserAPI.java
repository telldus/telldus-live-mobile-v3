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
import android.content.Intent;

import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;

import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.API.API;
import com.telldus.live.mobile.API.OnAPITaskComplete;
import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.NewOnOffWidget;
import com.telldus.live.mobile.Utility.HandlerRunnablePair;
import com.telldus.live.mobile.R;
import com.telldus.live.mobile.TransactionWebView;

import java.util.concurrent.Callable;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONObject;

public class UserAPI {

    public void getUserProfile(final Context context, final OnAPITaskComplete callBack) {
        String params = "/user/profile";
        API endPoints = new API();
        endPoints.callEndPoint(context, params, new OnAPITaskComplete() {
            @Override
            public void onSuccess(final JSONObject response) {
                try {
                    String error = response.optString("error");
                    if (!error.isEmpty() && error != null) {
                        callBack.onSuccess(response);
                    } else {
                        int proNew = response.optInt("pro");
                        String email = response.optString("email");

                        PrefManager prefManager = new PrefManager(context);
                        int pro = prefManager.getPro();

                        if (pro != proNew) {
                            prefManager.setUserId(email, proNew);
                        }
                        callBack.onSuccess(response);
                    }
                } catch (Exception e) {
                    callBack.onSuccess(response);
                };
            }
            @Override
            public void onError(ANError error) {
                callBack.onError(error);
            }
        });
    }

    public void createTransaction(String product, String quantity, String returnURL, final Context context, final OnAPITaskComplete callBack) {
        String params = "/user/createTransaction?product="+product+"&quantity="+quantity+"&returnURL="+returnURL;
        API endPoints = new API();
        endPoints.callEndPoint(context, params, new OnAPITaskComplete() {
            @Override
            public void onSuccess(final JSONObject response) {
                callBack.onSuccess(response);
            }
            @Override
            public void onError(ANError error) {
                callBack.onError(error);
            }
        });
    }
}