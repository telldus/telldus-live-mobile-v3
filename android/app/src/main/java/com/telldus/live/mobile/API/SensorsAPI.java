
package com.telldus.live.mobile.API;

import android.content.Context;

import com.androidnetworking.error.ANError;

import org.json.JSONObject;

public class SensorsAPI {

    public void getSensorsList(String params, Context context, String tag, final OnAPITaskComplete callBack) {
        API endPoints = new API();
        endPoints.callEndPoint(context, params,  tag, new OnAPITaskComplete() {

            @Override
            public void onSuccess(JSONObject result) {
                callBack.onSuccess(result);
            }

            @Override
            public void onError(ANError result) {
                callBack.onError(result);
            }
        });
    }
}