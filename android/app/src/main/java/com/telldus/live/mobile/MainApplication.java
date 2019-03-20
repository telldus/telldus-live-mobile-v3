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
import org.bvic23.rngetpixel.RNPixelColorPackage;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import org.wonday.orientation.OrientationPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.telldus.live.mobile.MainActivity;

import java.util.Arrays;
import java.util.List;

import com.horcrux.svg.SvgPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.oblador.vectoricons.VectorIconsPackage;
import ca.jaysoo.extradimensions.ExtraDimensionsPackage;
import org.pgsqlite.SQLitePluginPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.invertase.firebase.fabric.crashlytics.RNFirebaseCrashlyticsPackage;
import com.RNRSA.RNRSAPackage;
import com.tradle.react.UdpSocketsModule;
import br.com.classapp.RNSensitiveInfo.RNSensitiveInfoPackage;
import com.reactlibrary.RNReactNativeAccessibilityPackage;
import com.airbnb.android.react.maps.MapsPackage;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.telldus.live.mobile.WidgetPackage;

public class MainApplication extends Application implements ReactApplication {

	private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
		@Override
		public boolean getUseDeveloperSupport() {
			return BuildConfig.DEBUG;
		}

		@Override
		protected List<ReactPackage> getPackages() {
			return Arrays.<ReactPackage>asList(
				new SQLitePluginPackage(),
				new RNDeviceInfo(),
				new VectorIconsPackage(),
				new ExtraDimensionsPackage(),
				new MainReactPackage(),
            new RNPixelColorPackage(),
            new ImageResizerPackage(),
				new RNGestureHandlerPackage(),
				new RNGoogleSigninPackage(),
				new OrientationPackage(),
				new SvgPackage(),
				new RNFirebasePackage(),
				new RNFirebaseMessagingPackage(),
				new RNFirebaseNotificationsPackage(),
				new RNFirebaseCrashlyticsPackage(),
				new RNRSAPackage(),
				new UdpSocketsModule(),
				new RNSensitiveInfoPackage(),
				new RNReactNativeAccessibilityPackage(),
				new MapsPackage(),
				new RNI18nPackage(),
				new WidgetPackage()
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

        SoLoader.init(this, /* native exopackage */ false);
    }
}
