package com.telldus.live.mobile.ServiceBackground;

import android.app.Service;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;
import android.provider.ContactsContract;
import android.support.annotation.Nullable;
import android.util.Log;
import android.widget.Toast;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Date;
import java.util.UUID;

import com.telldus.live.mobile.Database.PrefManager;

/**
 * Created by crosssales on 1/30/2018.
 */

public class AccessTokenService extends Service {
    PrefManager prefManager;
    private Handler handler;
    private Runnable r;
    String time;
    long convertMilliseconds;

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onStart(Intent intent, int startId) {
        super.onStart(intent, startId);
       // time= intent.getStringExtra("timeStamp");


        String accessDate=prefManager.getAccessDate();


        if(accessDate.equals("")) {

            time=prefManager.getExpire();
            long timeStamp = Long.parseLong(time);

            convertMilliseconds=timeStamp*1000;
            convertMilliseconds=convertMilliseconds-20000;
            playHandler(convertMilliseconds);

            long currentDateTime = System.currentTimeMillis();

            convertMilliseconds=currentDateTime+convertMilliseconds;

            Date dateAccess=new Date(convertMilliseconds);
            Log.v("New date","*********"+dateAccess.toString());

            prefManager.ExpireAccessDate(dateAccess.toString());

        }else
        {
            long currentDateTime = System.currentTimeMillis();
            Date now=new Date(currentDateTime);
            Date expire=new Date(accessDate);
            Log.v("accessdate",accessDate);
            Log.v("expire time",String.valueOf(expire.getTime()));
            Log.v("now time",String.valueOf(now.toString()));
            Toast.makeText(getApplicationContext(),accessDate,Toast.LENGTH_SHORT).show();

            if(expire.getTime()>now.getTime())
            {
                long timeStamp=expire.getTime()-now.getTime();
                convertMilliseconds=timeStamp-20000;
                playHandler(convertMilliseconds);
                Log.v("playHandler",String.valueOf(convertMilliseconds));

            }else
            {
                fetchAccessToken();
            }

        }

    }

    public void playHandler(final long timer)
    {
        Toast.makeText(getApplicationContext(),"Listener created",Toast.LENGTH_SHORT).show();
        Log.v("timer for handler",String.valueOf(timer));

        handler = new Handler();
        r = new Runnable() {
            public void run() {
                fetchAccessToken();
                //   trigger();
                handler.postDelayed(this, timer);
            }
        };
        handler.postDelayed(r, timer);
    }


    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        return super.onStartCommand(intent, flags, startId);
    }

    @Override
    public void onCreate() {
        super.onCreate();
        prefManager=new PrefManager(this);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
    }

    public void fetchAccessToken()
    {

        Log.d("&&&&&&&&&&&&&&&&&&&&&&&", "&&&&&&&&&&&&&&&&&&&&&&&&&&");
        AndroidNetworking.post("https://api3.telldus.com/oauth2/accessToken")
                .addHeaders("Content-Type", "application/json")
                .addHeaders("Accpet", "application/json")
                .addBodyParameter("client_id",prefManager.getClientID())
                .addBodyParameter("client_secret",prefManager.getClientSecret())
                .addBodyParameter("grant_type","refresh_token")
                .addBodyParameter("refresh_token",prefManager.refToken())

                .setPriority(Priority.LOW)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {

                            Log.v("jsonResponse",response.toString(5));

                            prefManager.AccessTokenDetails(response.getString("access_token")
                                    ,response.getString("expires_in"));
                            String str=response.getString("expires_in");

                            long timeStamp = Long.parseLong(str);

                            convertMilliseconds=timeStamp*1000;
                            convertMilliseconds=convertMilliseconds-20000;
                            playHandler(convertMilliseconds);
                            long currentDateTime = System.currentTimeMillis();

                            convertMilliseconds=currentDateTime+convertMilliseconds;

                            Date dateAccess=new Date(convertMilliseconds);
                            prefManager.ExpireAccessDate(dateAccess.toString());



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
