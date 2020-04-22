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

import firebase from 'react-native-firebase';
import {
	deployStore,
} from '../../Config';

const enableAnalytics = deployStore !== 'huawei' && !__DEV__;

export function reportError(msg: string) {
	if (enableAnalytics) {
		firebase.crashlytics().recordError(101, msg);
	}
}

export function reportException(e: Error | string) {
	if (enableAnalytics) {
		if (e instanceof Error) {
			// Log the stack trace
			firebase.crashlytics().log(e.stack);
			reportError(e.message);
		} else {
			reportError(JSON.stringify(e));
		}
	}
}

export function setBoolean(key: string, value: boolean) {
	if (enableAnalytics) {
		firebase.crashlytics().setBoolValue(key, value);
	}
}

export function setUserIdentifier(userId: string = '') {
	if (enableAnalytics) {
		firebase.crashlytics().setUserIdentifier(userId);
	}
}

export function enableCrashlyticsCollection() {
	if (enableAnalytics) {
		firebase.crashlytics().enableCrashlyticsCollection();
	}
}

export function setUserName(uname: string) {
	// TODO: Enable once the method is supported. rn-firebase v6
	// if (enableAnalytics) {
	// 	firebase.crashlytics().setUserName(uname);
	// }
}

export const setGAUserProperty = (key: Object, value: string) => {
	if (deployStore !== 'huawei') {
		firebase.analytics().setUserProperty(key, value);
	}
};

export const setGAUserProperties = (properties: Object) => {
	if (deployStore !== 'huawei') {
		firebase.analytics().setUserProperties(properties);
	}
};
