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


}
