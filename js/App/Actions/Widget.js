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

const widgetConfigure = (): ThunkAction => {
	return (dispatch: Function, getState: Function): any => {
		const { user } = getState();
		const { accessToken = {}, userProfile = {}, accounts, userId } = user;
		const { pro = -1, email, uuid } = userProfile;
		const { access_token = '', refresh_token = '', expires_in = ''} = accessToken;
		const account = accounts[userId] || {};
		const _email = account.email || email;
		const { WidgetModule } = NativeModules;
		const _uuid = userId || uuid;
		if (Platform.OS === 'android') {
			WidgetModule.configureWidgetAuthData(access_token, refresh_token, expires_in.toString(), publicKey, privateKey, _email, pro, _uuid);
		} else {
			WidgetModule.configureWidgetAuthData({
				accessToken: access_token,
				refreshToken: refresh_token,
				expiresIn: expires_in.toString(),
				clientId: publicKey,
				clientSecret: privateKey,
				email: _email,
				pro,
				uuid: _uuid,
			});
		}
	};
};

const widgetDisableAll = (): ThunkAction => {
	return (dispatch: Function, getState: Function): any => {
		const { WidgetModule } = NativeModules;
		WidgetModule.disableAllWidgets();
		return;
	};
};

const widgetAndroidDisableWidget = (id: number, widgetType: "SENSOR" | "DEVICE") => {
	if (Platform.OS === 'android') {
		const { WidgetModule } = NativeModules;
		WidgetModule.disableWidget(id, widgetType);
	}
};

const widgetRefresh = (): ThunkAction => {
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
		if (Platform.OS === 'ios') {
			const { WidgetModule } = NativeModules;
			WidgetModule.refreshAllWidgetsData();
		}
		return;
	};
};

const widgetAndroidRefreshDevices = (deviceIds: Array<string>, byIdDevices: Object) => {
	if (Platform.OS === 'android') {
		const { WidgetModule } = NativeModules;
		WidgetModule.refreshWidgetsDevices(deviceIds, byIdDevices);
	}
};

const widgetAndroidRefreshSensors = (sensorIds: Array<string>, byIdSensors: Object) => {
	if (Platform.OS === 'android') {
		const { WidgetModule } = NativeModules;
		WidgetModule.refreshWidgetsSensors(sensorIds, byIdSensors);
	}
};

const getWidgetConstants = (): Object => {
	// NOTE: Calling synchronous native methods not supported while debugging in chrome
	if (typeof atob !== 'undefined') {
		return {};
	}

	if (Platform.OS === 'android') {
		const { WidgetModule } = NativeModules;
		return WidgetModule.getAllConstants();
	}
	return {};
};

const getWidgetTextFontSizeFactor = (): number => {
	// NOTE: Calling synchronous native methods not supported while debugging in chrome
	if (typeof atob !== 'undefined') {
		return 0;
	}
	if (Platform.OS === 'android') {
		const { WidgetModule } = NativeModules;
		return WidgetModule.getTextFontSizeFactor();
	}
	return 0;
};

const setWidgetTextFontSizeFactor = (factor: number): Promise<number> => {
	if (Platform.OS === 'android') {
		const { WidgetModule } = NativeModules;
		return WidgetModule.setTextFontSizeFactor(factor);
	}
	return Promise.resolve(1);
};

const setWidgetSensorLastUpdatedModeIOS = (forceUpdate: boolean = false): ThunkAction => {
	return (dispatch: Function, getState: Function) => {
		if (Platform.OS === 'ios') {
			const { WidgetModule } = NativeModules;
			const { app } = getState();
			const {
				defaultSettings = {},
			} = app;
			const {
				sensorLastUpdatedMode = '0',
			} = defaultSettings;
			const curValue = WidgetModule.getUserDefault('sensorLastUpdatedModeKey');
			WidgetModule.setUserDefault('sensorLastUpdatedModeKey', sensorLastUpdatedMode);
			if (!forceUpdate && curValue) {
				return;
			}
			WidgetModule.refreshAllWidgets();
		}
	};
};

module.exports = {
	widgetConfigure,
	widgetAndroidDisableWidget,
	widgetDisableAll,
	widgetAndroidRefreshSensors,
	widgetAndroidRefreshDevices,
	widgetRefresh,
	getWidgetConstants,
	getWidgetTextFontSizeFactor,
	setWidgetTextFontSizeFactor,
	setWidgetSensorLastUpdatedModeIOS,
};
