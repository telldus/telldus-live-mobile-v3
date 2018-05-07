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
import FCM, {FCMEvent} from 'react-native-fcm';
// import { Alert, Platform } from 'react-native';
import { pushServiceId } from '../../Config';
import { registerPushToken } from '../Actions/User';

const Push = {
	configure: async (store: Object): any => {
		// try {
		// 	let result = await FCM.requestPermissions({badge: false, sound: true, alert: true});
		// } catch (e) {
		// 	console.error(e);
		// }

		FCM.getFCMToken().then((token: string) => {
			// stores fcm token in the server
			if (token && (!store.pushToken || (store.pushToken !== token) || !store.pushTokenRegistered)) {
				store.dispatch(registerPushToken(token, DeviceInfo.getDeviceName(), DeviceInfo.getModel(), DeviceInfo.getManufacturer(), DeviceInfo.getSystemVersion(), DeviceInfo.getUniqueID(), pushServiceId));
				store.dispatch({ type: 'RECEIVED_PUSH_TOKEN', pushToken: token });
			}
		});
		FCM.on(FCMEvent.RefreshToken, (token: string) => {
			// stores fcm token in the server
			if (token) {
				store.dispatch(registerPushToken(token, DeviceInfo.getDeviceName(), DeviceInfo.getModel(), DeviceInfo.getManufacturer(), DeviceInfo.getSystemVersion(), DeviceInfo.getUniqueID(), pushServiceId));
				store.dispatch({ type: 'RECEIVED_PUSH_TOKEN', pushToken: token });
			}
		});
		FCM.getInitialNotification().then((notif: Object) => {
			handleNotification(notif);
		});
		FCM.on(FCMEvent.Notification, (notif: Object) => {
			handleNotification(notif);
		});
	},
};

const handleNotification = (notification: Object) => {
	// TODO: Once the server side is updated to send FCM push, according to the payload, notification
	// needs to be handled here.
};

module.exports = Push;
