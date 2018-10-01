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

package com.telldus.live.mobile;

import com.facebook.react.ReactActivity;
import android.content.Intent;
import android.content.res.Configuration;

import com.facebook.react.ReactInstanceManager;
import android.os.Bundle;

public class MainActivity extends ReactActivity {
	static String currentLocale;
	/**
	 * Returns the name of the main component registered from JavaScript.
	 * This is used to schedule rendering of the component.
	 */
	@Override
	protected String getMainComponentName() {
		return "TelldusLiveApp";
	}
	@Override
	protected void onCreate(Bundle savedInstanceState) {
			super.onCreate(savedInstanceState);
		//	setContentView(R.layout.activity_main);
	}

	@Override
	public void invokeDefaultOnBackPressed() {
		moveTaskToBack(true);
	}

	public void onConfigurationChanged(Configuration newConfig) {
		super.onConfigurationChanged(newConfig);
		// Reloads the app when ever a change in user's locale is detected.
		String locale = newConfig.locale.toString();
		if (!MainActivity.currentLocale.equals(locale)) {
			MainActivity.currentLocale = locale;
			final ReactInstanceManager instanceManager = getReactInstanceManager();
			instanceManager.recreateReactContextInBackground();
		}

		Intent intent = new Intent("onConfigurationChanged");
		intent.putExtra("newConfig", newConfig);
		this.sendBroadcast(intent);
  }
}
