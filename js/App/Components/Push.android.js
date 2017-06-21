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
 * @providesModule Push
 */

'use strict';

const DeviceInfo = require('react-native-device-info');
const PushNotification = require('react-native-push-notification');
import { pushSenderId, pushServiceId } from '../../Config';
import { registerPushToken } from 'Actions_User';

const Push = {
	configure: (store) => {
		PushNotification.configure({

			// Called when Token is generated
			onRegister: function (data) {
				if ((!store.pushToken) || (store.pushToken !== data.token)) {
					// stores fcm token in the server
					store.dispatch(registerPushToken(data.token, DeviceInfo.getBuildNumber(), DeviceInfo.getModel(), DeviceInfo.getManufacturer(), DeviceInfo.getSystemVersion(), DeviceInfo.getUniqueID(), pushServiceId));
					store.dispatch({ type: 'RECEIVED_PUSH_TOKEN', pushToken: data.token });
				}
			},

			// Called when a remote or local notification is opened or received
			onNotification: function (notification) {
				console.log( 'NOTIFICATION:', notification );
			},

			// GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications)
			senderID: pushSenderId,

			// Should the initial notification be popped automatically
			// default: true
			popInitialNotification: true,

			/**
				* (optional) default: true
				* - Specified if permissions (ios) and token (android and ios) will requested or not,
				* - if not, you must call PushNotificationsHandler.requestPermissions() later
				*/
			requestPermissions: true,
		});
	},
};

module.exports = Push;
