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
    public void saveSessionID(String id, String ttl) {
        /*SharedPreferences sharedPreferences = context.getSharedPreferences("LoginDetails", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();*/
        editor.putString("session", id);
        editor.putString("ttl", ttl);
        editor.commit();
    }
    public void AccessTokenDetails(String accessToken, String expire) {
        /*SharedPreferences sharedPreferences = context.getSharedPreferences("LoginDetails", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();*/
        editor.putString("accessToken", accessToken);
        editor.putString("expire", expire);
        editor.commit();
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
    public void infoAccessToken(String client_id,String client_secret,String grant_type,String user,String pwd)
    {
        editor.putString("client_id",client_id);
        editor.putString("client_secret",client_secret);
        editor.putString("grant_type",grant_type);
        editor.putString("user_name",user);
        editor.putString("password",pwd);
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
