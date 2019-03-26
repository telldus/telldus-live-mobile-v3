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
// @flow

'use strict';

import { NativeModules, Platform } from 'react-native';

import { publicKey, privateKey } from '../../Config';
import type { ThunkAction } from './Types';

const widgetAndroidConfigure = (): ThunkAction => {
	return (dispatch: Function, getState: Function): any => {
		if (Platform.OS === 'android') {
			const { user } = getState();
			const { accessToken = {}, userProfile = {} } = user;
			const { pro = -1, email } = userProfile;
			const { access_token = '', refresh_token = '', expires_in = ''} = accessToken;
			const { AndroidWidget } = NativeModules;
			AndroidWidget.configureWidgetAuthData(access_token, refresh_token, expires_in.toString(), publicKey, privateKey, email, pro);
		}
		return;
	};
};

const widgetAndroidDisableAll = (): ThunkAction => {
	return (dispatch: Function, getState: Function): any => {
		if (Platform.OS === 'android') {
			const { AndroidWidget } = NativeModules;
			AndroidWidget.disableAllWidgets();
		}
		return;
	};
};

const widgetAndroidDisableWidget = (id: number, widgetType: "SENSOR" | "DEVICE") => {
	if (Platform.OS === 'android') {
		const { AndroidWidget } = NativeModules;
		AndroidWidget.disableWidget(id, widgetType);
	}
};

const widgetAndroidRefresh = (): ThunkAction => {
	return (dispatch: Function, getState: Function): any => {
		if (Platform.OS === 'android') {
			const { devices: {allIds: allDevices, byId: byIdDevices}, sensors: {allIds: allSensors, byId: byIdSensors} } = getState();
			if (allDevices.length !== 0) {
				widgetAndroidRefreshDevices(allDevices, byIdDevices);
			}
			if (allSensors.length !== 0) {
				widgetAndroidRefreshSensors(allSensors, byIdSensors);
			}
		}
		return;
	};
};

const widgetAndroidRefreshDevices = (deviceIds: Array<string>, byIdDevices: Object) => {
	if (Platform.OS === 'android') {
		const { AndroidWidget } = NativeModules;
		AndroidWidget.refreshWidgetsDevices(deviceIds, byIdDevices);
	}
};

const widgetAndroidRefreshSensors = (sensorIds: Array<string>, byIdSensors: Object) => {
	if (Platform.OS === 'android') {
		const { AndroidWidget } = NativeModules;
		AndroidWidget.refreshWidgetsSensors(sensorIds, byIdSensors);
	}
};

module.exports = {
	widgetAndroidConfigure,
	widgetAndroidDisableWidget,
	widgetAndroidDisableAll,
	widgetAndroidRefreshSensors,
	widgetAndroidRefreshDevices,
	widgetAndroidRefresh,
};
