package com.telldus.live.mobile.Database;

import android.content.Context;
import android.content.SharedPreferences;

import java.util.ArrayList;

/**
 * Created by Lincoln on 05/05/16.
 */
public class PrefManager {
    SharedPreferences pref;
    SharedPreferences.Editor editor;
    Context _context;

    // shared pref mode
    private static final int PRIVATE_MODE = 0;

    // Shared preferences file name
    private static final String PREF_NAME = "DemoPref";

    private static final String IS_FIRST_TIME_LAUNCH = "IsFirstTimeLaunch";

    public PrefManager(Context context) {
        this._context = context;
        pref = _context.getSharedPreferences(PREF_NAME, PRIVATE_MODE);
        editor = pref.edit();
    }

    public void checkAvailability(boolean b)
    {
        editor.putBoolean("availability",b);
        editor.commit();
        editor.apply();

    }
    public boolean  getAvailability()
    {
        return pref.getBoolean("availability",false);
    }

    public void ExpireAccessDate(String date)
    {
        editor.putString("access_date",date);
        editor.commit();
    }
    public String getAccessDate()
    {
        return pref.getString("access_date","");
    }

    public void saveSessionID(String id, String ttl) {
        /*SharedPreferences sharedPreferences = context.getSharedPreferences("LoginDetails", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();*/
        editor.putString("session", id);
        editor.putString("ttl", ttl);
        editor.commit();
    }
    public void TokenService(boolean b)
    {
        editor.putBoolean("token_service",b);
        editor.commit();
    }
    public boolean getTokenService()
    {
        return pref.getBoolean("token_service",false);
    }

    public void websocketService(boolean b)
    {
        editor.putBoolean("web_service",b);
        editor.commit();
    }
    public boolean getWebService()
    {
        return pref.getBoolean("web_service",false);
    }


    public void AccessTokenDetails(String accessToken, String expire) {
        /*SharedPreferences sharedPreferences = context.getSharedPreferences("LoginDetails", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();*/
        editor.putString("accessToken", accessToken);
        editor.putString("expire", expire);
        editor.commit();
    }
    public void webSocketState(boolean web)
    {
        editor.putBoolean("websocket",web);
        editor.commit();

    }
    public boolean getWebSocketState()
    {
        return pref.getBoolean("websocket",false);
    }
    public void sessionExDate(String date)
    {
        editor.putString("access_date",date);
        editor.commit();

    }

    public void sensorDB(boolean b)
    {
        editor.putBoolean("sensor_db",b);

        editor.commit();
    }
    public boolean getSensorDB()
    {
        return pref.getBoolean("sensor_db",false);
    }

    public void DeviceDB(boolean b)
    {
        editor.putBoolean("device_db",b);
        editor.commit();
        editor.apply();
    }

    public boolean getDeviceDB()
    {
        return pref.getBoolean("device_db",false);
    }




    public String getSessionExDate()
    {
        return pref.getString("access_date","");
    }

    public String getSession()
    {
        return pref.getString("session","");
    }
    public String getTTl() {
        //SharedPreferences sharedPreferences = context.getSharedPreferences("LoginDetails", Context.MODE_PRIVATE);
        return pref.getString("ttl", "");
    }
    public String getAccess()
    {
        return pref.getString("accessToken","");
    }
    public String getExpire()
    {
        return pref.getString("expire","");
    }
    public void infoAccessToken(String client_id,String client_secret,String grant_type,String user,String pwd,String ref)
    {
        editor.putString("client_id",client_id);
        editor.putString("client_secret",client_secret);
        editor.putString("grant_type",grant_type);
        editor.putString("user_name",user);
        editor.putString("password",pwd);
        editor.putString("ref_token",ref);
        editor.commit();
    }
    public String getClientID()
    {
        return pref.getString("client_id","");
    }
    public String getClientSecret()
    {
        return pref.getString("client_secret","");
    }
    public String getGrantType()
    {
        return pref.getString("grant_type","");
    }
    public String getUsername()
    {
        return pref.getString("user_name","");
    }
    public String getPassword()
    {
        return pref.getString("password","");
    }
    public String refToken()
    {
        return pref.getString("ref_token","");
    }

    public void timeStampAccessToken(String timeStamp)
    {
        editor.putString("access_time",timeStamp);
        editor.commit();
    }
    public String getAccessTime()
    {
        return pref.getString("access_time","");
    }



}
