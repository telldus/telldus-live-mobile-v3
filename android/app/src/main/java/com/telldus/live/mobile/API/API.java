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
import com.telldus.live.mobile.BuildConfig;

import java.util.concurrent.Callable;

import org.json.JSONObject;
import org.json.JSONException;

public class API {
    private static String API_SERVER = BuildConfig.TELLDUS_API_SERVER;

    public void callEndPoint(final Context context, final String params, final OnAPITaskComplete callBack) {
        PrefManager prefManager = new PrefManager(context);
        String  accessToken = prefManager.getAccess();

        String Url = API_SERVER+"/oauth2"+params;
        AndroidNetworking.get(Url)
                .addHeaders("Content-Type", "application/json")
                .addHeaders("Accpet", "application/json")
                .addHeaders("Authorization", "Bearer " + accessToken)
                .setPriority(Priority.LOW)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(final JSONObject response) {
                        String error = response.optString("error");

                        if (!error.isEmpty() && error != null) {
                            if ((error.equalsIgnoreCase("invalid_token")) || (error.equalsIgnoreCase("expired_token"))) {
                                refreshAccessToken(context, new OnAPITaskComplete() {
                                    @Override
                                    public void onSuccess(final JSONObject responseRefreshToken) {

                                        String error = responseRefreshToken.optString("error");
                                        if (!error.isEmpty() && error != null) {
                                            callBack.onSuccess(response);
                                        } else {
                                            callEndPoint(context, params, callBack);
                                        }
                                    }
                                    @Override
                                    public void onError(ANError errorRefreshToken) {
                                        callBack.onSuccess(response);
                                    }
                                });
                            } else {
                                callBack.onSuccess(response);
                            }
                        } else {
                            callBack.onSuccess(response);
                        }
                    }

                    @Override
                    public void onError(final ANError error) {
                        if (error.getErrorCode() != 0) {
                            try {
                                JSONObject errorBody = new JSONObject(error.getErrorBody());
                                String errorMessage = errorBody.optString("error");
                                Boolean hasMessage = !errorMessage.isEmpty() && errorMessage != null;
                                if (hasMessage && (errorMessage.equalsIgnoreCase("invalid_token")) || (errorMessage.equalsIgnoreCase("expired_token"))) {
                                    refreshAccessToken(context, new OnAPITaskComplete() {
                                        @Override
                                        public void onSuccess(final JSONObject responseRefreshToken) {
                                            String errorRefreshToken = responseRefreshToken.optString("error");
                                            if (!errorRefreshToken.isEmpty() && errorRefreshToken != null) {
                                                callBack.onError(error);
                                            } else {
                                                callEndPoint(context, params, callBack);
                                            }
                                        }
                                        @Override
                                        public void onError(ANError errorRefreshToken) {
                                            callBack.onError(errorRefreshToken);
                                        }
                                    });
                                }
                            } catch (JSONException e) {
                                e.printStackTrace();
                                callBack.onError(error);
                            };
                       } else {
                            callBack.onError(error);
                       }
                    }
                });
    }

    public void refreshAccessToken(final Context context, final OnAPITaskComplete callBack) {
        final PrefManager prefManager = new PrefManager(context);
        final String  clientId = prefManager.getClientID();
        final String  clientSecret = prefManager.getClientSecret();
        final String  refreshToken = prefManager.refToken();

        String Url = API_SERVER+"/oauth2/accessToken";

        AndroidNetworking.post(Url)
            .addBodyParameter("client_id", clientId)
            .addBodyParameter("client_secret", clientSecret)
            .addBodyParameter("grant_type", "refresh_token")
            .addBodyParameter("refresh_token", refreshToken)
            .addHeaders("Content-Type", "application/json")
            .addHeaders("Accpet", "application/json")
            .setPriority(Priority.LOW)
            .build()
            .getAsJSONObject(new JSONObjectRequestListener() {
                @Override
                public void onResponse(JSONObject response) {
                    String error = response.optString("error");
                    if (!error.isEmpty() && error != null) {
                        callBack.onSuccess(response);
                    } else {

                        String accessTokenN = response.optString("access_token");
                        String refreshTokenN = response.optString("refresh_token");
                        String expiresInN = response.optString("expires_in");

                        prefManager.timeStampAccessToken(expiresInN);
                        prefManager.AccessTokenDetails(accessTokenN, expiresInN);
                        prefManager.infoAccessToken(clientId, clientSecret, refreshTokenN);

                        callBack.onSuccess(response);
                    }
                }

                @Override
                public void onError(ANError anError) {
                    callBack.onError(anError);
                }
            });
    }
}