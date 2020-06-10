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
import type { Notification, NotificationOpen } from 'react-native-firebase';
import DeviceInfo from 'react-native-device-info';

import type { ThunkAction } from '../Actions/Types';
import {
	pushSenderId,
	pushServiceId,
	deployStore,
} from '../../Config';
import { registerPushToken } from '../Actions/User';
import { reportException } from '../Lib/Analytics';

import {
	navigate,
} from '../Lib';

const Push = {
	configure: (params: Object): ThunkAction => {
		return (dispatch: Function, getState: Object): Promise<any> => {
			const {
				user: {
					playServicesInfo = {},
				},
			} = getState();

			if (deployStore === 'huawei') {
				return;
			}

			const { isAvailable, ...others } = Push.checkPlayServices();
			if (isAvailable) {
				if (!playServicesInfo.isAvailable) {
					dispatch({
						type: 'PLAY_SERVICES_INFO',
						payload:
							{
								isAvailable,
								...others,
							},
					});
				}

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
								.catch((): any => {
									// User has rejected permissions
									if (!pushToken || !pushTokenRegistered) {
										return dispatch(Push.getToken(params));
									}
								});
						}
					});
			}
			dispatch({
				type: 'PLAY_SERVICES_INFO',
				payload:
					{
						isAvailable,
						...others,
					},
			});
			return Promise.resolve();
		};
	},
	setChannel: () => {
		const channel = new firebase.notifications.Android.Channel(
			pushSenderId,
			'Tellus Alert',
			firebase.notifications.Android.Importance.Max)
			.setDescription('Telldus Live alerts on user subscribed events')
			.enableVibration(true)
			.setVibrationPattern([0.0, 1000.0, 500.0]);

		firebase.notifications().android.createChannel(channel);
	},
	getToken: ({
		pushToken,
		pushTokenRegistered,
		deviceId,
		register,
		toggleDialogueBox,
	}: Object): ThunkAction => {
		return (dispatch: Function, getState: Object): Promise<any> => {
			return firebase.messaging().getToken()
				.then(async (token: string): string => {
					if (token && (!pushToken || pushToken !== token || !pushTokenRegistered)) {
						if (register) {
							const deviceUniqueId = deviceId ? deviceId : DeviceInfo.getUniqueId();
							const deviceName = await DeviceInfo.getDeviceName();
							const manufacturer = await DeviceInfo.getManufacturer();
							dispatch(registerPushToken(token, deviceName, DeviceInfo.getModel(), manufacturer, DeviceInfo.getSystemVersion(), deviceUniqueId, pushServiceId));
						}
						dispatch({ type: 'RECEIVED_PUSH_TOKEN', pushToken: token });
					} else {
						dispatch({ type: 'GENERATE_PUSH_TOKEN_ERROR', generatePushError: `token: ${token}, pushToken: ${pushToken}, pushTokenRegistered: ${pushTokenRegistered}` });
					}
					return token;
				})
				.catch((err: any) => {
					if (err.message && err.message === 'AUTHENTICATION_FAILED') {
						if (toggleDialogueBox) {
							toggleDialogueBox({
								show: true,
								showHeader: true,
								text: 'Push notification might not work. ' +
								'Please make sure Google account is configured properly ' +
								'and working in this device. Also make sure you have latest ' +
								'Google play services installed.',
								showPositive: true,
							});
						}
					}
					dispatch({ type: 'GENERATE_PUSH_TOKEN_ERROR', generatePushError: err.message });
				});
		};
	},
	// Remote notification listerner. Returns a function that clears the listener.
	onNotification: (): any => {
		if (deployStore === 'huawei') {
			return;
		}
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
			  .android.setDefaults(firebase.notifications.Android.Defaults.All)
			  .android.setVibrate([0.0, 1000.0, 500.0])
			  .android.setPriority(firebase.notifications.Android.Priority.High);
		firebase.notifications().displayNotification(localNotification)
			.catch((err: any) => {
				reportException(err);
			});
	},
	refreshTokenListener: ({ deviceId, register }: Object): ThunkAction => {
		return (dispatch: Function, getState: Object): Function => {
			if (deployStore === 'huawei') {
				return;
			}
			return firebase.messaging().onTokenRefresh(async (token: string) => {
				if (token) {
					if (register) {
						const deviceUniqueId = deviceId ? deviceId : DeviceInfo.getUniqueId();
						const deviceName = await DeviceInfo.getDeviceName();
						const manufacturer = await DeviceInfo.getManufacturer();
						dispatch(registerPushToken(token, deviceName, DeviceInfo.getModel(), manufacturer, DeviceInfo.getSystemVersion(), deviceUniqueId, pushServiceId));
					}
					dispatch({ type: 'RECEIVED_PUSH_TOKEN', pushToken: token });
				}
			});
		};
	},
	onNotificationOpened: (): any => {
		if (deployStore === 'huawei') {
			return;
		}
		return firebase.notifications().onNotificationOpened((notificationOpen: NotificationOpen) => {
			if (Push.isPremiumExpireHeadsup(notificationOpen)) {
				Push.navigateToPurchasePremium();
			}
		});
	},
	isPremiumExpireHeadsup: (notification: Object): boolean => {
		if (notification && notification.action) {
			const action = notification.action;
			return action === 'SHOW_PREMIUM_PURCHASE_SCREEN';
		}
		return false;
	},
	navigateToPurchasePremium: () => {
		navigate('PremiumUpgradeScreen');
	},
	checkPlayServices(): Object {
		const utils = firebase.utils();

		const {
		  status,
		  isAvailable,
		  hasResolution,
		  isUserResolvableError,
		} = utils.playServicesAvailability;

		// all good and valid \o/
		if (isAvailable) {
			return utils.playServicesAvailability;
		}

		// if the user can resolve the issue i.e by updating play services
		// then call Google Play's own/default prompting functionality
		if (isUserResolvableError || hasResolution) {
		  switch (status) {
				case 1:
			  // SERVICE_MISSING - Google Play services is missing on this device.
			  // show something to user
			  // and then attempt to install if necessary
					utils.makePlayServicesAvailable();
					return utils.playServicesAvailability;
				case 2:
			  // SERVICE_VERSION_UPDATE_REQUIRED - The installed version of Google Play services is out of date.
			  // show something to user
			  // and then attempt to update if necessary
			   utils.resolutionForPlayServices();
			   return utils.playServicesAvailability;
					// TODO handle other cases as necessary, see link below for all codes and descriptions
					// TODO e.g. https://developers.google.com/android/reference/com/google/android/gms/common/ConnectionResult#SERVICE_VERSION_UPDATE_REQUIRED
				default:
			  // some default dialog / component?
			  if (isUserResolvableError) {
				   utils.promptForPlayServices();
				  return utils.playServicesAvailability;
			  }
			  if (hasResolution) {
						utils.resolutionForPlayServices();
				  return utils.playServicesAvailability;
			  }
		  }
		}

		// There's no way to resolve play services on this device
		// probably best to show a dialog / force crash the app
		return utils.playServicesAvailability;
	  },
};

module.exports = Push;
