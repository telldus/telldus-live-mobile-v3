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
 *
 */
package com.telldus.live.mobile.Database;

import android.content.Context;
import android.content.SharedPreferences;

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

    public void ExpireAccessDate(String date) {
        editor.putString("access_date",date);
        editor.commit();
    }

    public String getAccessDate() {
        return pref.getString("access_date","");
    }

    public void saveSessionID(String id) {
        editor.putString("session", id);
        editor.commit();
    }

    public void TokenService(boolean b) {
        editor.putBoolean("token_service",b);
        editor.commit();
    }

    public boolean getTokenService() {
        return pref.getBoolean("token_service",false);
    }

    public void websocketService(boolean b) {
        editor.putBoolean("web_service",b);
        editor.commit();
    }

    public boolean getWebService() {
        return pref.getBoolean("web_service",false);
    }

    public void AccessTokenDetails(String accessToken, String expire) {
        editor.putString("accessToken", accessToken);
        editor.putString("expire", expire);
        editor.commit();
    }

    public void webSocketState(boolean web) {
        editor.putBoolean("websocket",web);
        editor.commit();

    }

    public boolean getWebSocketState() {
        return pref.getBoolean("websocket",false);
    }

    public void sessionExDate(String date) {
        editor.putString("access_date",date);
        editor.commit();
    }

    public void sensorDB(boolean b) {
        editor.putBoolean("sensor_db",b);
        editor.commit();
    }

    public boolean getSensorDB() {
        return pref.getBoolean("sensor_db",false);
    }

    public void DeviceDB(boolean b) {
        editor.putBoolean("device_db",b);
        editor.commit();
        editor.apply();
    }

    public boolean getDeviceDB() {
        return pref.getBoolean("device_db",false);
    }

    public String getSessionExDate() {
        return pref.getString("access_date","");
    }

    public String getSession() {
        return pref.getString("session","");
    }

    public String getAccess() {
        return pref.getString("accessToken","");
    }

    public String getExpire() {
        return pref.getString("expire","");
    }

    public void infoAccessToken(String client_id,String client_secret,String ref) {
        editor.putString("client_id",client_id);
        editor.putString("client_secret",client_secret);
        editor.putString("ref_token",ref);
        editor.commit();
    }

    public String getClientID() {
        return pref.getString("client_id","");
    }

    public String getClientSecret() {
        return pref.getString("client_secret","");
    }

    public String getGrantType() {
        return pref.getString("grant_type","");
    }

    public String refToken() {
        return pref.getString("ref_token","");
    }

    public void timeStampAccessToken(String timeStamp) {
        editor.putString("access_time",timeStamp);
        editor.commit();
    }

    public String getAccessTime() {
        return pref.getString("access_time","");
    }

    public void setDimmer(String dimmer) {
        editor.putString("dimmer",dimmer);
        editor.commit();
        editor.apply();
    }

    public String getDimmer() {
        return pref.getString("dimmer","0");
    }

    public void clear() {
        editor.clear();
        editor.commit();
    }
}
