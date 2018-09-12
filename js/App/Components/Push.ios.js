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

const DeviceInfo = require('react-native-device-info');
import { Alert, PushNotificationIOS } from 'react-native';

import type { ThunkAction } from '../Actions/Types';
import { pushServiceId } from '../../Config';
import { registerPushToken } from '../Actions/User';

const Push = {
	configure: (params: any): ThunkAction => {
		return (dispatch: Function, getState: Object): any => {
			PushNotificationIOS.requestPermissions();
			PushNotificationIOS.addEventListener('register', (token: string): any => {
				return dispatch(Push.onRegister(token, params));
			});
		};
	},
	onRegister: (token: string, params: Object): ThunkAction => {
		return (dispatch: Function, getState: Object): any => {
			const { pushToken, pushTokenRegistered } = params;
			if ((!pushToken) || (pushToken !== token) || (!pushTokenRegistered)) {
			// stores fcm token in the server
				dispatch(registerPushToken(token, DeviceInfo.getDeviceName(), DeviceInfo.getModel(), DeviceInfo.getManufacturer(), DeviceInfo.getSystemVersion(), DeviceInfo.getUniqueID(), pushServiceId));
				dispatch({ type: 'RECEIVED_PUSH_TOKEN', pushToken: token });
			}
		};
	},
	// Remote notification listerner. Returns a function that clears all(register & notification) the listeners.
	onNotification: (): Function => {
		PushNotificationIOS.addEventListener('notification', Push.createLocalNotification);
		return Push.removeListeners;
	},
	removeListeners: () => {
		PushNotificationIOS.removeEventListener('notification');
		PushNotificationIOS.removeEventListener('register');
	},
	createLocalNotification: (notification: Object) => {
		// 	// On iOS, if the app is in foreground the local notification is not shown.
		// 	// We use normal alert instead
		Alert.alert('Telldus Live!', notification.getMessage());
	},
};

module.exports = Push;
