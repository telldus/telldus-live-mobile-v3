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

// @flow

'use strict';

import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import {
	deployStore,
} from '../../Config';

const enableAnalytics = deployStore !== 'huawei' && !__DEV__;

export function reportError(error: Error) {
	if (enableAnalytics) {
		crashlytics().recordError(error);
	}
}

export function reportException(e: Error | string) {
	if (enableAnalytics) {
		if (e instanceof Error) {
			// Log the stack trace
			crashlytics().log(e.stack);
			reportError(e);
		} else {
			crashlytics().log(JSON.stringify(e));
			reportError(new Error(JSON.stringify(e)));
		}
	}
}

export function setBoolean(key: string, value: string) {
	if (enableAnalytics) {
		crashlytics().setAttribute(key, value);
	}
}

export function setUserIdentifier(userId: string = '') {
	if (enableAnalytics) {
		const uid = typeof userId !== 'string' ? '' : userId;
		crashlytics().setUserId(uid);
	}
}

export function enableCrashlyticsCollection() {
	if (enableAnalytics) {
		crashlytics().setCrashlyticsCollectionEnabled(true);
	} else if (crashlytics().isCrashlyticsCollectionEnabled) {
		crashlytics().setCrashlyticsCollectionEnabled(false);
	}
}

export function setUserName(uname?: string | null) {
	// TODO: rn-firebase analytics(v7) seem to have removed setUserName
	// Enable this back if it gets added again in any upcoming version
	if (enableAnalytics) {
		// const uName = typeof uname !== 'string' ? 'anonymous' : uname;
		// crashlytics().setUserName(uName);
	}
}

export const setGAUserProperty = (key: Object, value: string) => {
	if (deployStore !== 'huawei') {
		analytics().setUserProperty(key, value);
	}
};

export const setGAUserProperties = (properties: Object) => {
	if (deployStore !== 'huawei') {
		analytics().setUserProperties(properties);
	}
};
