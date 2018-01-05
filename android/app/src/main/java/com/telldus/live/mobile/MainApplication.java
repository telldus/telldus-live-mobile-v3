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
import com.reactlibrary.RNReactNativeAccessibilityPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.telldus.live.mobile.MainActivity;

import java.util.Arrays;
import java.util.List;

import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.oblador.vectoricons.VectorIconsPackage;
import ca.jaysoo.extradimensions.ExtraDimensionsPackage;
import com.smixx.fabric.FabricPackage;
import com.crashlytics.android.Crashlytics;
import com.crashlytics.android.core.CrashlyticsCore;
import io.fabric.sdk.android.Fabric;
import com.github.yamill.orientation.OrientationPackage;

public class MainApplication extends Application implements ReactApplication {

	private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
		@Override
		public boolean getUseDeveloperSupport() {
			return BuildConfig.DEBUG;
		}

		@Override
		protected List<ReactPackage> getPackages() {
			return Arrays.<ReactPackage>asList(
				new FabricPackage(),
				new RNDeviceInfo(),
				new VectorIconsPackage(),
				new ExtraDimensionsPackage(),
				new MainReactPackage(),
				new RNReactNativeAccessibilityPackage(),
				new MapsPackage(),
				new ReactNativePushNotificationPackage(),
				new OrientationPackage()
			);
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
        // Set up Crashlytics, disabled for debug builds
        Crashlytics crashlyticsKit = new Crashlytics.Builder()
          .core(new CrashlyticsCore.Builder().disabled(BuildConfig.DEBUG).build())
          .build();
        Fabric.with(this, crashlyticsKit);
        SoLoader.init(this, /* native exopackage */ false);
    }
}
