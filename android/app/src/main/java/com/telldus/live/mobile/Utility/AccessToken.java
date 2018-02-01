package com.telldus.live.mobile.Utility;

import android.app.Activity;
import android.content.Context;
import android.util.Log;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;

import org.json.JSONException;
import org.json.JSONObject;

import com.telldus.live.mobile.Database.PrefManager;

/**
 * Created by crosssales on 1/29/2018.
 */

public class AccessToken {
PrefManager prefManager;
    public  void createAccessToken(Context context) {
        prefManager=new PrefManager(context);



        Log.d("&&&&&&&&&&&&&&&&&&&&&&&", "&&&&&&&&&&&&&&&&&&&&&&&&&&");
        AndroidNetworking.post("https://api3.telldus.com/oauth2/accessToken")
                .addHeaders("Content-Type", "application/json")
                .addHeaders("Accpet", "application/json")
                .addBodyParameter("client_id",prefManager.getClientID())
                .addBodyParameter("client_secret",prefManager.getClientSecret())
                .addBodyParameter("grant_type",prefManager.getGrantType())
                .addBodyParameter("username",prefManager.getUsername())
                .addBodyParameter("password",prefManager.getPassword())
                .setPriority(Priority.LOW)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {

                        Log.v("jsonResponse",response.toString(5));

                        prefManager.AccessTokenDetails(response.getString("access_token")
                        ,response.getString("expires_in"));



                        } catch (JSONException e) {
                            e.printStackTrace();
                        };
                    }

                    @Override
                    public void onError(ANError anError) {

                    }
                });
    }
}
