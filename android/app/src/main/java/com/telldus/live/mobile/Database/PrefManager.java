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

    // Shared preferences file name
    private static final String PREF_NAME = "TelldusSharedPreference";

    public PrefManager(Context context) {
        this._context = context;
        pref = _context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        editor = pref.edit();
    }

    public void setAccessDetails(String accessToken, String expire, String clientId, String clientSecret, String refreshToken) {
        editor.putString("accessToken", accessToken);
        editor.putString("expire", expire);
        editor.putString("clientId", clientId);
        editor.putString("clientSecret", clientSecret);
        editor.putString("refreshToken", refreshToken);
        editor.apply();
    }

    public String getAccessToken() {
        return pref.getString("accessToken", "");
    }

    public String getClientID() {
        return pref.getString("clientId", "");
    }

    public String getClientSecret() {
        return pref.getString("clientSecret", "");
    }

    public String getGrantType() {
        return pref.getString("grantType", "");
    }

    public String getRefreshToken() {
        return pref.getString("refreshToken", "");
    }

    public void setUserId(String userId) {
        editor.putString("userId", userId);
        editor.apply();
    }

    public String getUserId() {
        return pref.getString("userId", null);
    }

    public void clear() {
        editor.clear();
        editor.apply();
    }
}
