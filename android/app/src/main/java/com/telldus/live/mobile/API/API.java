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
import android.util.Log;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;

import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.API.OnAPITaskComplete;

import java.util.concurrent.Callable;

import org.json.JSONObject;

public class API {
    private static String API_SERVER = "https://api3.telldus.com/oauth2/";
    public void callEndPoint(Context context, String params, final OnAPITaskComplete callBack) {
        PrefManager prefManager = new PrefManager(context);
        String  accessToken = prefManager.getAccess();

        String Url = API_SERVER+params;

        AndroidNetworking.get(Url)
                .addHeaders("Content-Type", "application/json")
                .addHeaders("Accpet", "application/json")
                .addHeaders("Authorization", "Bearer " + accessToken)
                .setPriority(Priority.LOW)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        callBack.onSuccess(response);
                    }

                    @Override
                    public void onError(ANError anError) {
                        callBack.onError(anError);
                    }
                });
    }
}