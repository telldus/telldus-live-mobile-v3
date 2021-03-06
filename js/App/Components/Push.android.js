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

import { NativeModules } from 'react-native';
const {
	NativeUtilitiesModule,
} = NativeModules;

import messaging from '@react-native-firebase/messaging';
const {
	AuthorizationStatus,
} = messaging;
import DeviceInfo from 'react-native-device-info';
import { utils } from '@react-native-firebase/app';

import type { ThunkAction } from '../Actions/Types';
import {
	pushSenderId,
	pushServiceId,
	deployStore,
} from '../../Config';
import { registerPushToken } from '../Actions/User';
import { reportException } from '../Lib/Analytics';

import { CONSTANTS } from 'live-shared-data';
const {
	DARK_THEME_KEY,
} = CONSTANTS;
import Theme from '../Theme';

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

				return messaging().hasPermission()
					.then((authStatus: Object): any => {
						const enabled = authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL;
						if (enabled) {
							// user has permissions
							if (!pushToken || !pushTokenRegistered) {
								return dispatch(Push.getToken(params));
							}
						} else {
							return messaging().requestPermission()
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
		NativeUtilitiesModule.createNotificationChannel({
			channelId: pushSenderId,
			channelName: 'Tellus Alert',
			channelDescription: 'Telldus Live alerts on user subscribed events',
		});
	},
	getToken: ({
		pushToken,
		pushTokenRegistered,
		deviceId,
		register,
		toggleDialogueBox,
	}: Object): ThunkAction => {
		return (dispatch: Function, getState: Object): Promise<any> => {
			return messaging().getToken()
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
	onNotification: (params: Object): any => {
		if (deployStore === 'huawei') {
			return;
		}
		return messaging().onMessage((notification: Object): any => {
			// Remote Notification received when app is in foreground is handled here.
			Push.createLocalNotification(notification, params);
		});
	},
	// Displays notification in the notification tray.
	createLocalNotification: ({notification}: Object, {getThemeOptions}: Object) => {
		Push.setChannel();
		const {
			colorScheme,
		} = getThemeOptions();
		const {
			brandSecondaryShadeOne,
			brandSecondary,
		} = Theme.Core;
		const notifColor = colorScheme === DARK_THEME_KEY ? brandSecondaryShadeOne : brandSecondary;
		NativeUtilitiesModule.showLocalNotification({
			channelId: pushSenderId,
			smallIcon: 'icon_notif',
			title: notification.title,
			text: notification.body,
			notificationId: notification.notificationId,
			color: notifColor,
			userInfo: notification.data,
			bigText: {
				text: notification.body,
				contentTitle: notification.title,
				summaryText: notification.body,
			},
		}).catch((err: any) => {
			reportException(err);
		});
	},
	refreshTokenListener: ({ deviceId, register }: Object): ThunkAction => {
		return (dispatch: Function, getState: Object): Function => {
			if (deployStore === 'huawei') {
				return;
			}
			return messaging().onTokenRefresh(async (token: string) => {
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
		return messaging().onNotificationOpenedApp((notificationOpen: Object) => {
			if (Push.isPremiumExpireHeadsup(notificationOpen)) {
				Push.navigateToPurchasePremium();
			}
		});
	},
	isPremiumExpireHeadsup: ({notification}: Object): boolean => {
		// TODO: Check and verify the notification data!
		if (notification.android && notification.android.clickAction) {
			return notification.android.clickAction === 'SHOW_PREMIUM_PURCHASE_SCREEN';
		}
		return false;
	},
	navigateToPurchasePremium: () => {
		navigate('PremiumUpgradeScreen');
	},
	checkPlayServices(): Object {

		const {
			status,
			isAvailable,
			hasResolution,
			isUserResolvableError,
		} = utils().playServicesAvailability;

		// all good and valid \o/
		if (isAvailable) {
			return utils().playServicesAvailability;
		}

		// if the user can resolve the issue i.e by updating play services
		// then call Google Play's own/default prompting functionality
		if (isUserResolvableError || hasResolution) {
		  switch (status) {
				case 1:
			  // SERVICE_MISSING - Google Play services is missing on this device.
			  // show something to user
			  // and then attempt to install if necessary
					utils().makePlayServicesAvailable();
					return utils().playServicesAvailability;
				case 2:
			  // SERVICE_VERSION_UPDATE_REQUIRED - The installed version of Google Play services is out of date.
			  // show something to user
			  // and then attempt to update if necessary
			   utils().resolutionForPlayServices();
			   return utils().playServicesAvailability;
					// TODO handle other cases as necessary, see link below for all codes and descriptions
					// TODO e.g. https://developers.google.com/android/reference/com/google/android/gms/common/ConnectionResult#SERVICE_VERSION_UPDATE_REQUIRED
				default:
			  // some default dialog / component?
			  if (isUserResolvableError) {
				   utils().promptForPlayServices();
				  return utils().playServicesAvailability;
			  }
			  if (hasResolution) {
						utils().resolutionForPlayServices();
				  return utils().playServicesAvailability;
			  }
		  }
		}

		// There's no way to resolve play services on this device
		// probably best to show a dialog / force crash the app
		return utils().playServicesAvailability;
	  },
};

module.exports = Push;
