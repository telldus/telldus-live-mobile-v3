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

import android.app.Application;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import com.telldus.live.mobile.MainActivity;
import com.facebook.react.PackageList;
import com.facebook.hermes.reactexecutor.HermesExecutorFactory;
import com.facebook.react.bridge.JavaScriptExecutorFactory;

import java.util.List;

import ca.jaysoo.extradimensions.ExtraDimensionsPackage;
import org.pgsqlite.SQLitePluginPackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.invertase.firebase.fabric.crashlytics.RNFirebaseCrashlyticsPackage;
import com.telldus.live.mobile.WidgetPackage;
import com.RNFetchBlob.RNFetchBlobPackage;

public class MainApplication extends Application implements ReactApplication {

	private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
		@Override
		public boolean getUseDeveloperSupport() {
			return BuildConfig.DEBUG;
		}

		@Override
		protected List<ReactPackage> getPackages() {
			@SuppressWarnings("UnnecessaryLocalVariable")
			List<ReactPackage> packages = new PackageList(this).getPackages();
			// Packages that cannot be autolinked yet can be added manually here, for example:
			// packages.add(new MyReactNativePackage());

			packages.add(new SQLitePluginPackage());
			packages.add(new ExtraDimensionsPackage());
			packages.add(new RNFetchBlobPackage());
			packages.add(new RNFirebaseMessagingPackage());
			packages.add(new RNFirebaseNotificationsPackage());
			packages.add(new RNFirebaseCrashlyticsPackage());
			packages.add(new WidgetPackage());
			return packages;
		}

		@Override
		protected String getJSMainModuleName() {
			return "index";
		}
	};

	@Override
	public ReactNativeHost getReactNativeHost() {
			return mReactNativeHost;
	}

    @Override
    public void onCreate() {
        super.onCreate();
		// saving current locale of the user inorder to reload the app(inside MainActivity) on locale change.
		MainActivity.currentLocale = getResources().getConfiguration().locale.toString();

        SoLoader.init(this, /* native exopackage */ false);
    }
}
