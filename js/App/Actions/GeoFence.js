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
const colorsys = require('colorsys');
import {
	NativeModules,
} from 'react-native';
import BackgroundGeolocation from 'react-native-background-geolocation';
import {
	Platform,
} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';


const {
	NativeUtilitiesModule,
} = NativeModules;

// import {
// 	deviceSetState,
// 	deviceSetStateThermostat,
// 	deviceSetStateRGB,
// } from './Devices';
import { actions as _actions } from 'live-shared-data';
const { Devices } = _actions;
const { deviceSetState, deviceSetStateThermostat, deviceSetStateRGB } = Devices;

import {
	getScheduleOptions,
	saveSchedule,
} from './Schedule';
import {
	getEventOptions,
	setEvent,
} from './Events';
import {
	storeGeoFenceEvent,
} from './LocalStorage';

import type { ThunkAction } from './Types';
import {
	setCurrentLocation,
} from './Fences';
import GeoFenceUtils from '../Lib/GeoFenceUtils';
import {
	createLocationNotification,
} from '../Lib/PushNotification';
import {
	platformAppStateIndependentSetTimeout,
	platformAppStateIndependentClearTimeout,
} from '../Lib/Timer';
import {
	getRawIntl,
} from '../Lib/intlUtils';

import i18n from '../Translations/common';

const ERROR_CODE_FENCE_NO_ACTION = 'FENCE_NO_ACTION';
const ERROR_CODE_TIMED_OUT = 'FENCE_TIMED_OUT';

const ERROR_CODE_GF_RC_DISABLED = 'GF_REMOTE_CONFIG_DISABLED';

import type { Action } from './Types';

import {
	isBasicUser,
	hasAPremiumAccount,
} from '../Lib/appUtils';
import {
	TEST_ACCOUNTS,
} from '../../Config';

let retryQueueSchedule = {};
let retryQueueEvent = {};
let retryQueueDeviceAction = {};
let MAP_QUEUE_TIME = {
	'1': 10,
	'2': 30,
	'3': 60,
};
let backgroundTimerStartedIniOS = false;

function setupGeoFence(intl: Object): ThunkAction {
	return async (dispatch: Function, getState: Function): Promise<any> => {

		const {
			user: {
				firebaseRemoteConfig = {},
				accounts = {},
				userProfile = {},
			},
			geoFence = {},
		} = getState();
		const { geoFenceFeature = JSON.stringify({enable: false}) } = firebaseRemoteConfig;
		const { enable } = JSON.parse(geoFenceFeature);

		const hasAPremAccount = hasAPremiumAccount(accounts);
		const isTestAccount = TEST_ACCOUNTS.indexOf(userProfile.uuid) !== -1; // NOTE: Always enable geofence option for test accounts

		if ((!enable || !hasAPremAccount) && !isTestAccount) {
			const state = await BackgroundGeolocation.getState();
			if (state.enabled) {
				BackgroundGeolocation.stop();
			}
			return Promise.reject({
				code: ERROR_CODE_GF_RC_DISABLED,
			});
		}

		const {
			formatMessage,
		} = intl;

		const {
			distanceFilter = 5,
			stopTimeout = 5,
			stopOnTerminate = false,
			startOnBoot = true,
			enableHeadless = true,
			geofenceModeHighAccuracy = true,
			preventSuspend = true,
			geofenceInitialTriggerEntry = false,
			locationUpdateInterval = 1000,
			geofenceProximityRadius = 400,
			debug = false,
		} = geoFence.config || {};

		BackgroundGeolocation.onGeofence(async (geofence: Object) => {
			const event = {
				...geofence,
				inAppTime: Date.now(),
			};
			storeGeoFenceEvent(event);
			dispatch(debugGFOnGeofence(event));
			if (Platform.OS === 'ios' && !backgroundTimerStartedIniOS) {
				BackgroundTimer.start();
				backgroundTimerStartedIniOS = true;
			}
			await dispatch(handleFence(geofence));
			if (Platform.OS === 'ios') {
				const date = new Date();
				dispatch(debugGFSetCheckpoint({
					checkpoint: 'BEFORE STOP BackgroundTimer : ',
					time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
				}));
				backgroundTimerStartedIniOS = false;
				BackgroundTimer.stop();
				const date2 = new Date();
				dispatch(debugGFSetCheckpoint({
					checkpoint: 'AFTER STOP BackgroundTimer : ',
					time: `${date2.getHours()}:${date2.getMinutes()}:${date2.getSeconds()}`,
				}));
			}
		});

		return BackgroundGeolocation.ready({
			// Geolocation Config
			desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
			geofenceInitialTriggerEntry,
			distanceFilter,
			locationUpdateInterval,
			fastestLocationUpdateInterval: locationUpdateInterval,
			// Activity Recognition
			stopTimeout,
			// Application config
			debug, // <-- enable this hear sounds for background-geolocation life-cycle.
			logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
			logMaxDays: 15,
			stopOnTerminate, // <-- Allow the background-service to continue tracking when user closes the app.
			startOnBoot, // <-- Auto start tracking when device is powered-up.
			// HTTP / SQLite config
			batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
			autoSync: false, // <-- [Default: true] Set true to sync each location to server as it arrives.
			// Android
			enableHeadless,
			geofenceModeHighAccuracy,
			geofenceProximityRadius,
			foregroundService: true,
			notification: {
				smallIcon: 'drawable/icon_notif', // <-- defaults to app icon
				largeIcon: 'drawable/icon_notif',
				title: 'Telldus Live! Mobile',
				text: formatMessage(i18n.geoFenceTrackingActive),
			},
			// iOS
			preventSuspend,
		}).then(async (state: Object): Object => {
			if (!state.enabled || state.trackingMode !== 0) {
				state = await dispatch(startGeofences());
			}
			if (state.enabled) {
				try {
					dispatch(getCurrentLocation());
				} catch (e) {
					// Ignore
				}
			}
			return state;
		});
	};
}

const stopGeoFence = (): ThunkAction => {
	return (dispatch: Function, getState: Function): Promise<any> => {
		return BackgroundGeolocation.stop();
	};
};

const startGeofences = (): ThunkAction => {
	return async (dispatch: Function, getState: Function): Promise<any> => {
		return await BackgroundGeolocation.startGeofences();
	};
};

const getCurrentLocation = (): ThunkAction => {
	return async (dispatch: Function, getState: Function): Promise<any> => {
		const location = await BackgroundGeolocation.getCurrentPosition({
			timeout: 30,
			maximumAge: 5000,
			desiredAccuracy: 10,
			samples: 3,
		}) || {};
		const {
			latitude,
			longitude,
		} = location.coords || {};
		dispatch(setCurrentLocation({
			latitude,
			longitude,
		}));
		return location;
	};
};

let queue = {};
const GeoFenceHeadlessTask = async (store: Object, event: Object): Promise<any> => {
	const {
		params = {},
		name,
	} = event;

	if (name === 'geofence') {
		const {
			location = {},
		} = params;
		const {
			uuid,
		} = location;

		const _event = {
			...params,
			inAppTime: Date.now(),
		};
		storeGeoFenceEvent(_event);

		queue[uuid] = true;

		return new Promise(async (resolve: Function) => {
			const removeSubscriber = store.subscribe(async () => {
				const { _persist: persist = {} } = store.getState();
				if (persist.rehydrated && queue[uuid]) {
					delete queue[uuid];
					store.dispatch(debugGFOnGeofence({
						...params,
						inAppTime: Date.now(),
					}));
					await store.dispatch(handleFence(params));
					removeSubscriber();
					Promise.resolve();
				}
			});

			const { _persist = {} } = store.getState() || {};
			if (_persist.rehydrated && queue[uuid]) {
				removeSubscriber();
				delete queue[uuid];
				store.dispatch(debugGFOnGeofence({
					...params,
					inAppTime: Date.now(),
				}));
				await store.dispatch(handleFence(params));
				Promise.resolve();
			}
		});
	}
	return Promise.resolve();
};

function handleFence(fence: Object): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		if (!fence) {
			return Promise.resolve('done');
		}

		const {
			action,
			extras = {},
			location = {},
		} = fence;

		dispatch(debugGFSetCheckpoint({
			checkpoint: 'handleFence-0',
			eventUUID: location.uuid,
		}));

		const {
			isAlwaysActive,
			arriving,
			leaving,
			fromHr,
			fromMin,
			toHr,
			toMin,
			userId,
		} = extras;
		if (isAlwaysActive || GeoFenceUtils.isActive(fromHr, fromMin, toHr, toMin)) {
			dispatch(debugGFSetCheckpoint({
				checkpoint: 'handleFence-1',
				eventUUID: location.uuid,
			}));
			let actions = null;
			if (action === 'ENTER') {
				actions = arriving;
			} else if (action === 'EXIT') {
				actions = leaving;
			}

			if (actions) {
				dispatch(debugGFSetCheckpoint({
					checkpoint: 'handleFence-2',
					eventUUID: location.uuid,
				}));
				return dispatch(handleActions(actions, userId, location.uuid, {
					...extras,
					actionEvent: action,
				}));
			}
			return Promise.resolve('done');
		}
		return Promise.resolve('done');
	};
}

function handleActions(actions: Object, userId: string, eventUUID: string, extras: Object): ThunkAction {
	return async (dispatch: Function, getState: Function): Promise<any> => {
		const { devices = {}, schedules = {}, events = {} } = actions;
		dispatch(debugGFSetCheckpoint({
			checkpoint: 'handleActions-0',
			eventUUID,
			userId,
		}));
		if (!userId) {
			return Promise.resolve('done');
		}

		const { user: { accounts = {} } } = getState();
		const {
			accessToken,
			pro,
		} = accounts[userId] || {};
		dispatch(debugGFSetCheckpoint({
			checkpoint: 'handleActions-1',
			eventUUID,
			accessToken,
		}));

		const isBasic = isBasicUser(pro);
		if (!accessToken || isBasic) {
			return Promise.resolve('done');
		}

		let promises = [];

		for (let id in devices) {
			promises.push(dispatch(handleActionDevice(devices[id], accessToken, eventUUID, extras)));
		}
		for (let id in events) {
			promises.push(dispatch(handleActionEvent(events[id], accessToken, eventUUID, extras)));
		}
		for (let id in schedules) {
			promises.push(dispatch(handleActionSchedule(schedules[id], accessToken, eventUUID, extras)));
		}
		// NOTE: Not using Promise.all to resolve as BG task started using BackgroundGeolocation.startBackgroundTask
		// Will only last for 30secs in Android and 180secs in iOS. If any promise gets stuck we do not want the
		// preceeding requests/actions to be not fires/ignored.
		return await Promise.all(promises.map((promise: Promise<any>): Promise<any> => {
			return promise.then((res: Object): Object => {
				return res;
			}).catch((err: Object): Object => {
				return err;
			});
		}));
	};
}

function handleActionDevice(action: Object, accessToken: Object, eventUUID: string, extras: Object): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		const {
			actionEvent,
			title,
		} = extras;

		let { deviceId, method, stateValues = {} } = action;
		let date = new Date();
		dispatch(debugGFSetCheckpoint({
			checkpoint: `handleActionDevice${action.uuid}`,
			eventUUID,
			...action,
			time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
		}));
		if (!deviceId) {
			return Promise.resolve('done');
		}
		if (typeof method === 'undefined') {
			return Promise.resolve('done');
		}

		const { app: {
			defaultSettings = {},
		}} = getState();
		let { language = {} } = defaultSettings;
		let locale = language.code;
		const {
			formatMessage,
		} = getRawIntl(locale);

		method = parseInt(method, 10);
		const methodsSharedSetState = [1, 2, 4, 16, 128, 256, 512];
		if (methodsSharedSetState.indexOf(method) !== -1) {
			const dimValue = stateValues[16];
			return dispatch(deviceSetState(deviceId, method, dimValue, accessToken)).then((res: Object = {}): Object => {
				if (retryQueueDeviceAction[action.uuid] && typeof retryQueueDeviceAction[action.uuid].timeoutId !== 'undefined') {
					platformAppStateIndependentClearTimeout(retryQueueDeviceAction[action.uuid].timeoutId);
					delete retryQueueDeviceAction[action.uuid];
				}

				date = new Date();
				dispatch(debugGFSetCheckpoint({
					checkpoint: `handleActionDevice-SUCCESS${action.uuid}`,
					eventUUID,
					...res,
					time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
				}));

				return res;
			}).catch((err: Object = {}): Object => {

				const actionString = actionEvent === 'EXIT' ? formatMessage(i18n.exiting) : formatMessage(i18n.entering);

				if (retryQueueDeviceAction[action.uuid] && (retryQueueDeviceAction[action.uuid].count >= 3)) {
					if (typeof retryQueueDeviceAction[action.uuid].timeoutId !== 'undefined') {
						platformAppStateIndependentClearTimeout(retryQueueDeviceAction[action.uuid].timeoutId);
					}
					delete retryQueueDeviceAction[action.uuid];
					dispatch(showNotificationOnErrorExecutingAction({
						notificationId: action.uuid,
						body: formatMessage(i18n.deviceActionFailedOnGF, {
							actionString,
							fenceName: title,
						}),
					}));
					return Promise.resolve('done');
				}

				if (!retryQueueDeviceAction[action.uuid]) {
					retryQueueDeviceAction[action.uuid] = {
						count: 0,
					};
				}

				let prevCount = retryQueueDeviceAction[action.uuid].count;
				retryQueueDeviceAction[action.uuid] = {
					count: prevCount + 1,
				};

				date = new Date();
				dispatch(debugGFSetCheckpoint({
					checkpoint: `handleActionDevice-ERROR${action.uuid}`,
					eventUUID,
					error: err.message || JSON.stringify(err),
					time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
					retryCount: retryQueueDeviceAction[action.uuid],
				}));

				const timeout = MAP_QUEUE_TIME[retryQueueDeviceAction[action.uuid].count.toString()];
				const timeString = timeout === 60 ? formatMessage(i18n.oneMinute) : formatMessage(i18n.inSomeSeconds, { value: timeout });
				dispatch(showNotificationOnErrorExecutingAction({
					notificationId: action.uuid,
					body: `${formatMessage(i18n.deviceActionFailedOnGF, {
						actionString,
						fenceName: title,
					})} ${formatMessage(i18n.actionFailedOnGFRetry, {
						timeString,
					})}`,
				}));

				// eslint-disable-next-line no-new
				return new Promise((res: Object): Promise<Any> => {
					retryQueueDeviceAction[action.uuid].timeoutId = platformAppStateIndependentSetTimeout((): Promis<Any> => {
						return res(dispatch(handleActionDevice(action, accessToken, eventUUID, extras)));
					}, timeout * 1000);
				});
			});
		} else if (method === 1024) {
			const rgbValue = stateValues[1024];
			const rgb = colorsys.hexToRgb(rgbValue);
			const { r, g, b } = rgb;
			return dispatch(deviceSetStateRGB(deviceId, r, g, b, accessToken)).then((res: Object = {}): Object => {
				if (retryQueueDeviceAction[action.uuid] && typeof retryQueueDeviceAction[action.uuid].timeoutId !== 'undefined') {
					platformAppStateIndependentClearTimeout(retryQueueDeviceAction[action.uuid].timeoutId);
					delete retryQueueDeviceAction[action.uuid];
				}

				date = new Date();
				dispatch(debugGFSetCheckpoint({
					checkpoint: `handleActionDevice-SUCCESS${action.uuid}`,
					eventUUID,
					...res,
					time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
				}));
				return res;
			}).catch((err: Object = {}): Object => {
				const actionString = actionEvent === 'EXIT' ? formatMessage(i18n.exiting) : formatMessage(i18n.entering);

				if (retryQueueDeviceAction[action.uuid] && (retryQueueDeviceAction[action.uuid].count >= 3)) {
					if (typeof retryQueueDeviceAction[action.uuid].timeoutId !== 'undefined') {
						platformAppStateIndependentClearTimeout(retryQueueDeviceAction[action.uuid].timeoutId);
					}
					delete retryQueueDeviceAction[action.uuid];
					dispatch(showNotificationOnErrorExecutingAction({
						notificationId: action.uuid,
						body: formatMessage(i18n.deviceActionFailedOnGF, {
							actionString,
							fenceName: title,
						}),
					}));
					return Promise.resolve('done');
				}

				if (!retryQueueDeviceAction[action.uuid]) {
					retryQueueDeviceAction[action.uuid] = {
						count: 0,
					};
				}

				let prevCount = retryQueueDeviceAction[action.uuid].count;
				retryQueueDeviceAction[action.uuid] = {
					count: prevCount + 1,
				};

				date = new Date();
				dispatch(debugGFSetCheckpoint({
					checkpoint: `handleActionDevice-ERROR${action.uuid}`,
					eventUUID,
					error: err.message || JSON.stringify(err),
					time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
					retryCount: retryQueueDeviceAction[action.uuid],
				}));

				const timeout = MAP_QUEUE_TIME[retryQueueDeviceAction[action.uuid].count.toString()];

				const timeString = timeout === 60 ? formatMessage(i18n.oneMinute) : formatMessage(i18n.inSomeSeconds, { value: timeout });
				dispatch(showNotificationOnErrorExecutingAction({
					notificationId: action.uuid,
					body: `${formatMessage(i18n.deviceActionFailedOnGF, {
						actionString,
						fenceName: title,
					})} ${formatMessage(i18n.actionFailedOnGFRetry, {
						timeString,
					})}`,
				}));

				// eslint-disable-next-line no-new
				return new Promise((res: Object): Promise<Any> => {
					retryQueueDeviceAction[action.uuid].timeoutId = platformAppStateIndependentSetTimeout((): Promise<Any> => {
						return res(dispatch(handleActionDevice(action, accessToken, eventUUID, extras)));
					}, timeout * 1000);
				});
			});
		} else if (method === 2048) {
			const {
				changeMode,
				scale,
				mode,
				temp,
			} = action;
			return dispatch(deviceSetStateThermostat(deviceId, mode, temp, scale, changeMode, mode === 'off' ? 2 : 1, accessToken)).then((res: Object = {}): Object => {
				if (retryQueueDeviceAction[action.uuid] && typeof retryQueueDeviceAction[action.uuid].timeoutId !== 'undefined') {
					platformAppStateIndependentClearTimeout(retryQueueDeviceAction[action.uuid].timeoutId);
					delete retryQueueDeviceAction[action.uuid];
				}

				date = new Date();
				dispatch(debugGFSetCheckpoint({
					checkpoint: `handleActionDevice-SUCCESS${action.uuid}`,
					eventUUID,
					...res,
					time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
				}));
				return res;
			}).catch((err: Object = {}): Object => {
				const actionString = actionEvent === 'EXIT' ? formatMessage(i18n.exiting) : formatMessage(i18n.entering);

				if (retryQueueDeviceAction[action.uuid] && (retryQueueDeviceAction[action.uuid].count >= 3)) {
					if (typeof retryQueueDeviceAction[action.uuid].timeoutId !== 'undefined') {
						platformAppStateIndependentClearTimeout(retryQueueDeviceAction[action.uuid].timeoutId);
					}
					delete retryQueueDeviceAction[action.uuid];
					dispatch(showNotificationOnErrorExecutingAction({
						notificationId: action.uuid,
						body: formatMessage(i18n.deviceActionFailedOnGF, {
							actionString,
							fenceName: title,
						}),
					}));
					return Promise.resolve('done');
				}

				if (!retryQueueDeviceAction[action.uuid]) {
					retryQueueDeviceAction[action.uuid] = {
						count: 0,
					};
				}

				let prevCount = retryQueueDeviceAction[action.uuid].count;
				retryQueueDeviceAction[action.uuid] = {
					count: prevCount + 1,
				};

				date = new Date();
				dispatch(debugGFSetCheckpoint({
					checkpoint: `handleActionDevice-ERROR${action.uuid}`,
					eventUUID,
					error: err.message || JSON.stringify(err),
					time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
					retryCount: retryQueueDeviceAction[action.uuid],
				}));

				const timeout = MAP_QUEUE_TIME[retryQueueDeviceAction[action.uuid].count.toString()];

				const timeString = timeout === 60 ? formatMessage(i18n.oneMinute) : formatMessage(i18n.inSomeSeconds, { value: timeout });
				dispatch(showNotificationOnErrorExecutingAction({
					notificationId: action.uuid,
					body: `${formatMessage(i18n.deviceActionFailedOnGF, {
						actionString,
						fenceName: title,
					})} ${formatMessage(i18n.actionFailedOnGFRetry, {
						timeString,
					})}`,
				}));

				// eslint-disable-next-line no-new
				return new Promise((res: Object): Promise<Any> => {
					retryQueueDeviceAction[action.uuid].timeoutId = platformAppStateIndependentSetTimeout((): Promise<Any> => {
						return res(dispatch(handleActionDevice(action, accessToken, eventUUID, extras)));
					}, timeout * 1000);
				});
			});
		}
		return Promise.resolve('done');
	};
}

function handleActionEvent(action: Object, accessToken: Object, eventUUID: string, extras: Object): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		const {
			actionEvent,
			title,
		} = extras;

		const {
			id,
			...options
		} = getEventOptions(action);
		let date = new Date();
		dispatch(debugGFSetCheckpoint({
			checkpoint: `handleActionEvent${action.uuid}`,
			eventUUID,
			id,
			time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
		}));
		return dispatch(setEvent(id, options, accessToken)).then((res: Object = {}): Object => {
			if (retryQueueEvent[action.uuid] && typeof retryQueueEvent[action.uuid].timeoutId !== 'undefined') {
				platformAppStateIndependentClearTimeout(retryQueueEvent[action.uuid].timeoutId);
				delete retryQueueEvent[action.uuid];
			}

			date = new Date();
			dispatch(debugGFSetCheckpoint({
				checkpoint: `handleActionEvent-SUCCESS${action.uuid}`,
				eventUUID,
				...res,
				time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
			}));
			return res;
		}).catch((err: Object = {}): Object => {

			const { app: {
				defaultSettings = {},
			}} = getState();
			let { language = {} } = defaultSettings;
			let locale = language.code;
			const {
				formatMessage,
			} = getRawIntl(locale);

			const actionString = actionEvent === 'EXIT' ? formatMessage(i18n.exiting) : formatMessage(i18n.entering);

			if (retryQueueEvent[action.uuid] && (retryQueueEvent[action.uuid].count >= 3)) {
				if (typeof retryQueueEvent[action.uuid].timeoutId !== 'undefined') {
					platformAppStateIndependentClearTimeout(retryQueueEvent[action.uuid].timeoutId);
				}
				delete retryQueueEvent[action.uuid];
				dispatch(showNotificationOnErrorExecutingAction({
					notificationId: action.uuid,
					body: formatMessage(i18n.eventActionFailedOnGF, {
						actionString,
						fenceName: title,
					}),
				}));
				return Promise.resolve('done');
			}

			if (!retryQueueEvent[action.uuid]) {
				retryQueueEvent[action.uuid] = {
					count: 0,
				};
			}

			let prevCount = retryQueueEvent[action.uuid].count;
			retryQueueEvent[action.uuid] = {
				count: prevCount + 1,
			};

			date = new Date();
			dispatch(debugGFSetCheckpoint({
				checkpoint: `handleActionEvent-ERROR${action.uuid}`,
				eventUUID,
				error: err.message || JSON.stringify(err),
				time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
				retryCount: retryQueueEvent[action.uuid],
			}));

			const timeout = MAP_QUEUE_TIME[retryQueueEvent[action.uuid].count.toString()];

			const timeString = timeout === 60 ? formatMessage(i18n.oneMinute) : formatMessage(i18n.inSomeSeconds, { value: timeout });
			dispatch(showNotificationOnErrorExecutingAction({
				notificationId: action.uuid,
				body: `${formatMessage(i18n.eventActionFailedOnGF, {
					actionString,
					fenceName: title,
				})} ${formatMessage(i18n.actionFailedOnGFRetry, {
					timeString,
				})}`,
			}));

			// eslint-disable-next-line no-new
			return new Promise((res: Object): Promise<Any> => {
				retryQueueEvent[action.uuid].timeoutId = platformAppStateIndependentSetTimeout((): Promise<Any> => {
					return res(dispatch(handleActionEvent(action, accessToken, eventUUID, extras)));
				}, timeout * 1000);
			});
		});
	};
}

function handleActionSchedule(action: Object, accessToken: Object, eventUUID: string, extras: Object): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		const {
			actionEvent,
			title,
		} = extras;

		const options = getScheduleOptions(action);
		let date = new Date();
		dispatch(debugGFSetCheckpoint({
			checkpoint: `handleActionSchedule${action.uuid}`,
			eventUUID,
			options,
			time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
		}));
		return dispatch(saveSchedule(options, accessToken)).then((res: Object = {}): Object => {
			if (retryQueueSchedule[action.uuid] && typeof retryQueueSchedule[action.uuid].timeoutId !== 'undefined') {
				platformAppStateIndependentClearTimeout(retryQueueSchedule[action.uuid].timeoutId);
				delete retryQueueSchedule[action.uuid];
			}

			date = new Date();
			dispatch(debugGFSetCheckpoint({
				checkpoint: `handleActionSchedule-SUCCESS${action.uuid}`,
				eventUUID,
				...res,
				time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
			}));
			return res;
		}).catch((err: Object = {}): Object => {

			const { app: {
				defaultSettings = {},
			}} = getState();
			let { language = {} } = defaultSettings;
			let locale = language.code;
			const {
				formatMessage,
			} = getRawIntl(locale);

			const actionString = actionEvent === 'EXIT' ? formatMessage(i18n.exiting) : formatMessage(i18n.entering);

			if (retryQueueSchedule[action.uuid] && (retryQueueSchedule[action.uuid].count >= 3)) {
				if (typeof retryQueueSchedule[action.uuid].timeoutId !== 'undefined') {
					platformAppStateIndependentClearTimeout(retryQueueSchedule[action.uuid].timeoutId);
				}
				delete retryQueueSchedule[action.uuid];
				dispatch(showNotificationOnErrorExecutingAction({
					notificationId: action.uuid,
					body: formatMessage(i18n.scheduleActionFailedOnGF, {
						actionString,
						fenceName: title,
					}),
				}));
				return Promise.resolve('done');
			}

			if (!retryQueueSchedule[action.uuid]) {
				retryQueueSchedule[action.uuid] = {
					count: 0,
				};
			}

			let prevCount = retryQueueSchedule[action.uuid].count;
			retryQueueSchedule[action.uuid] = {
				count: prevCount + 1,
			};

			date = new Date();
			dispatch(debugGFSetCheckpoint({
				checkpoint: `handleActionSchedule-ERROR${action.uuid}`,
				eventUUID,
				error: err.message || JSON.stringify(err),
				time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
				retryCount: retryQueueSchedule[action.uuid],
			}));

			const timeout = MAP_QUEUE_TIME[retryQueueSchedule[action.uuid].count.toString()];

			const timeString = timeout === 60 ? formatMessage(i18n.oneMinute) : formatMessage(i18n.inSomeSeconds, { value: timeout });
			dispatch(showNotificationOnErrorExecutingAction({
				notificationId: action.uuid,
				body: `${formatMessage(i18n.scheduleActionFailedOnGF, {
					actionString,
					fenceName: title,
				})} ${formatMessage(i18n.actionFailedOnGFRetry, {
					timeString,
				})}`,
			}));

			// eslint-disable-next-line no-new
			return new Promise((res: Object): Promise<Any> => {
				retryQueueSchedule[action.uuid].timeoutId = platformAppStateIndependentSetTimeout((): Promise<Any> => {
					return res(dispatch(handleActionSchedule(action, accessToken, eventUUID, extras)));
				}, timeout * 1000);
			});
		});
	};
}

type TYPE_ADD_GEO_FENCE_DATA = {
	identifier: string,
	radius: number, // The minimum reliable radius is 200 meters. Anything less will likely not cause a geofence to trigger. This is documented by Apple.
	latitude: number,
	longitude: number,
	notifyOnEntry?: boolean,
	notifyOnExit?: boolean,
	extras?: Object,
};

const hasEntry = (item: Object = {}): boolean => {
	return Object.keys(item).length > 0;
};

let addGeofenceTimeout = null;
function addGeofence(override?: boolean = false): ThunkAction {
	return async (dispatch: Function, getState: Function): Promise<any> => {
		return new Promise(async (resolve: Function, reject: Function) => {
			if (addGeofenceTimeout) {
				clearTimeout(addGeofenceTimeout);
				addGeofenceTimeout = null;
			}
			addGeofenceTimeout = setTimeout(() => {
				addGeofenceTimeout = null;
				reject({
					code: ERROR_CODE_TIMED_OUT,
					message: 'timed out',
				});
			}, 8000);

			const {
				fences: {
					fence,
				},
				user: {
					userId,
				},
				app: {
					defaultSettings = {},
				},
			} = getState();

			const {
				enableGeoFence = false,
			} = defaultSettings;
			const {
				identifier,
				radius,
				latitude,
				longitude,
				arriving = {},
				leaving = {},
			} = fence;

			const { devices: ad = {}, schedules: as = {}, events: aa = {} } = arriving;
			const { devices: ld = {}, schedules: ls = {}, events: la = {} } = leaving;

			const notifyOnEntry = hasEntry(ad) || hasEntry(as) || hasEntry(aa);
			const notifyOnExit = hasEntry(ld) || hasEntry(ls) || hasEntry(la);

			if (!notifyOnEntry && !notifyOnExit) {
				if (addGeofenceTimeout) {
					clearTimeout(addGeofenceTimeout);
					addGeofenceTimeout = null;
				}
				reject({
					code: ERROR_CODE_FENCE_NO_ACTION,
					message: 'No actions are selected to execute on Entry/Exit. Please select any action to perform.',
				});
			}

			const data: TYPE_ADD_GEO_FENCE_DATA = {
				identifier,
				radius: radius * 1000, // In meters
				latitude,
				longitude,
				notifyOnEntry,
				notifyOnExit,
				extras: {
					...fence,
					radius: radius * 1000,
					userId,
				},
			};

			BackgroundGeolocation.addGeofence(data).then((success: any): Object => {
				try {
					if (enableGeoFence) {
						dispatch(startGeofences());
					}
				} catch (e) {
					// ignore
				} finally {
					if (addGeofenceTimeout) {
						clearTimeout(addGeofenceTimeout);
						addGeofenceTimeout = null;
					}
					resolve(success);
				}
			}).catch((error: any) => {
				if (addGeofenceTimeout) {
					clearTimeout(addGeofenceTimeout);
					addGeofenceTimeout = null;
				}
				reject(error);
			});
		});
	};
}

function getGeofences(): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		return BackgroundGeolocation.getGeofences().then((geofences: Array<Object>): Array<Object> => {
			return geofences;
		});
	};
}

function getCurrentAccountsFences(): ThunkAction {
	return async (dispatch: Function, getState: Function): Promise<any> => {

		const {
			user: {
				userId: userIdC,
			},
		} = getState();

		const fences = await dispatch(getGeofences()) || [];
		let currFences = [];
		for (let i = 0; i < fences.length; i++) {
			const {
				extras: {
					userId,
				},
			} = fences[i];
			if (userId === userIdC) {
				currFences.push(fences[i]);
			}
		}
		return Promise.resolve(currFences);
	};
}

function removeGeofence(identifier: string): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		return BackgroundGeolocation.removeGeofence(identifier).then((success: any): any => {
			return success;
		}).catch((error: Object) => {
			throw error;
		});
	};
}

const debugGFOnGeofence = (payload: Object): Action => {
	return {
		type: 'DEBUG_GF_EVENT_ONGEOFENCE',
		payload,
	};
};

const debugGFSetCheckpoint = (payload: Object): Action => {
	return {
		type: 'DEBUG_GF_SET_CHECKPOINT',
		payload,
	};
};

const updateGeoFenceConfig = (payload: Object): Action => {
	return {
		type: 'UPDATE_GEOFENCE_CONFIG',
		payload,
	};
};

const clearAllOnGeoFencesLog = (): Action => {
	return {
		type: 'CLEAR_ON_GEOFENCE_LOG',
	};
};

const showNotificationOnErrorExecutingAction = ({
	notificationId,
	body,
}: Object): ThunkAction => {
	return (dispatch: Function, getState: Function): ?Promise<any> => {
		const {
			geoFence = {},
		} = getState();

		const {
			showNotificationOnActionFail,
		} = geoFence.config || {};

		if (!showNotificationOnActionFail) {
			return Promise.resolve('done');
		}

		createLocationNotification({
			notificationId,
			title: 'Telldus Live! Mobile',
			body,
			data: {
				notificationId,
			},
		});
	};
};

const requestIgnoreBatteryOptimizations = (): ThunkAction => {
	return async (dispatch: Function, getState: Function) => {
		if (Platform.OS === 'ios') {
			return;
		}

		const flag = await dispatch(isIgnoringBatteryOptimizations());
		if (!flag) {
			NativeUtilitiesModule.requestIgnoreBatteryOptimizations();
		}
	};
};

const isIgnoringBatteryOptimizations = (): ThunkAction => {
	return async (dispatch: Function, getState: Function): Promise<any> => {
		if (Platform.OS === 'ios') {
			return Promise.resolve(true);
		}

		let flag = false;
		try {
			flag = await NativeUtilitiesModule.isIgnoringBatteryOptimizations();
		} catch (e) {
			// Ignore
		} finally {
			return flag;
		}
	};
};

module.exports = {
	setupGeoFence,
	addGeofence,
	getGeofences,
	getCurrentAccountsFences,
	removeGeofence,
	stopGeoFence,
	startGeofences,
	GeoFenceHeadlessTask,
	updateGeoFenceConfig,
	getCurrentLocation,

	ERROR_CODE_FENCE_NO_ACTION,
	ERROR_CODE_TIMED_OUT,

	debugGFOnGeofence,
	clearAllOnGeoFencesLog,
	debugGFSetCheckpoint,

	isIgnoringBatteryOptimizations,
	requestIgnoreBatteryOptimizations,
};
