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

export const widgetAndroidConfigure = (): ThunkAction => {
	return (dispatch: Function, getState: Function): any => {
		if (Platform.OS === 'android') {
			const { user, websockets } = getState();
			const { accessToken = {}, userProfile = {} } = user;
			const { access_token = '', refresh_token = '', expires_in = ''} = accessToken;
			const { AndroidWidget } = NativeModules;
			AndroidWidget.configureWidgetAuthData(access_token, refresh_token, expires_in.toString(), publicKey, privateKey, userProfile.email);

			const { session } = websockets;
			if (session && session.id) {
				AndroidWidget.configureWidgetSessionData(session.id);
			}
		}
		return;
	};
};

export const widgetAndroidConfigureSessionData = (sessionId: string): ThunkAction => {
	return (dispatch: Function, getState: Function): any => {
		if (Platform.OS === 'android') {
			const { AndroidWidget } = NativeModules;
			AndroidWidget.configureWidgetSessionData(sessionId);
		}
		return;
	};
};

export const widgetAndroidDisableAll = (message: string): ThunkAction => {
	return (dispatch: Function, getState: Function): any => {
		if (Platform.OS === 'android') {
			const { AndroidWidget } = NativeModules;
			AndroidWidget.disableAllWidgets(message);
		}
		return;
	};
};
