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
import type { Notification } from 'react-native-firebase';
const DeviceInfo = require('react-native-device-info');

import type { ThunkAction } from '../Actions/Types';
import { pushSenderId, pushServiceId } from '../../Config';
import { registerPushToken } from '../Actions/User';
import { reportException } from '../Lib/Analytics';

const Push = {
	configure: (params: Object): ThunkAction => {
		return (dispatch: Function, getState: Object): Promise<any> => {
			const { pushToken, pushTokenRegistered } = params;

			// It is mandatory to create channel. https://rnfirebase.io/docs/v4.2.x/notifications/android-channels
			// TODO: Check the behaviour in lower android versions.
			Push.setChannel();

			return firebase.messaging().hasPermission()
				.then((enabled: boolean): any => {
					if (enabled) {
						// user has permissions
						if (!pushToken || !pushTokenRegistered) {
							return dispatch(Push.getToken(params));
						}
					} else {
						return firebase.messaging().requestPermission()
							.then((): any => {
								// User has authorised
								if (!pushToken || !pushTokenRegistered) {
									return dispatch(Push.getToken(params));
								}
							})
							.catch(() => {
							// User has rejected permissions
							});
					}
				});
		};
	},
	setChannel: () => {
		const channel = new firebase.notifications.Android.Channel(
			pushSenderId,
			'Tellus Alert',
			firebase.notifications.Android.Importance.Max)
			.setDescription('Telldus Live alerts on user subscribed events')
			.enableVibration(true);

		firebase.notifications().android.createChannel(channel);
	},
	getToken: ({ pushToken, pushTokenRegistered, deviceId }: Object): ThunkAction => {
		return (dispatch: Function, getState: Object): Promise<any> => {
			return firebase.messaging().getToken()
				.then((token: string): string => {
					if (pushToken !== token) {
						const deviceUniqueId = deviceId ? deviceId : DeviceInfo.getUniqueID();
						dispatch(registerPushToken(token, DeviceInfo.getDeviceName(), DeviceInfo.getModel(), DeviceInfo.getManufacturer(), DeviceInfo.getSystemVersion(), deviceUniqueId, pushServiceId));
						dispatch({ type: 'RECEIVED_PUSH_TOKEN', pushToken: token });
					}
					return token;
				})
				.catch((err: any) => {
					throw err;
				});
		};
	},
	// Remote notification listerner. Returns a function that clears the listener.
	onNotification: (): any => {
		return firebase.notifications().onNotification((notification: Notification): any => {
			// Remote Notification received when app is in foreground is handled here.
			Push.createLocalNotification(notification);
		});
	},
	// Displays notification in the notification tray.
	createLocalNotification: (notification: Object) => {
		// $FlowFixMe
		const localNotification = new firebase.notifications.Notification({
			sound: 'default',
			show_in_foreground: true,
			  })
			  .setNotificationId(notification.notificationId)
			  .setTitle(notification.title)
			  .setBody(notification.body)
			  .setData(notification.data)
			  .android.setChannelId(pushSenderId)
			  .android.setSmallIcon('icon_notif')
			  .android.setColor('#e26901')
			  .android.setPriority(firebase.notifications.Android.Priority.High);
		firebase.notifications().displayNotification(localNotification)
			.catch((err: any) => {
				reportException(err);
			});
	},
};

module.exports = Push;
