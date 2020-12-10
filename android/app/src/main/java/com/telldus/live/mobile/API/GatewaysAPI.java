package com.telldus.live.mobile.API;

import android.content.Context;

import com.androidnetworking.error.ANError;
import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Model.GatewayInfo;
import com.telldus.live.mobile.Utility.DevicesUtilities;
import com.telldus.live.mobile.WidgetsUpdater;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;

public class GatewaysAPI {
    public void cacheGateways(final Context context) {
        getGateways(context, new OnAPITaskComplete() {
            @Override
            public void onSuccess(JSONObject response, HashMap<String, String> authData) {
                try {

                    JSONObject deviceData = new JSONObject(response.toString());
                    JSONArray clients = deviceData.getJSONArray("client");

                    String userUuid = authData.get("userUuid");
                    System.out.println("TEST GAPI userUuid"+ userUuid);

                    MyDBHandler db = new MyDBHandler(context);

                    for (int i = 0; i < clients.length(); i++) {
                        JSONObject curObj = clients.getJSONObject(i);
                        String timezone = curObj.getString("timezone");
                        int id = curObj.getInt("id");
                        GatewayInfo gatewayInfo = new GatewayInfo(
                                id,
                                userUuid,
                                timezone
                        );
                        db.addGatewaysInfo(gatewayInfo);
                    }
                } catch (JSONException e) {

                }
            }
            @Override
            public void onError(ANError error) {
            }
        });
    }

    public void getGateways(final Context context, final OnAPITaskComplete callBack) {
        String params = "/clients/list?extras=timezone";
        API endPoints = new API();
        endPoints.callEndPoint(context, params, "GatewaysList", new OnAPITaskComplete() {
            @Override
            public void onSuccess(JSONObject response, HashMap<String, String> authData) {
                callBack.onSuccess(response, authData);
            }

            @Override
            public void onError(ANError error) {
                callBack.onError(error);
            }
        });
    }
}
