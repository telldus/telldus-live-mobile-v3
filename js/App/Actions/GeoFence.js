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
import BackgroundGeolocation from 'react-native-background-geolocation';
import { AppState } from 'react-native';
import Toast from 'react-native-simple-toast';

import {
	deviceSetState,
	deviceSetStateThermostat,
	deviceSetStateRGB,
} from './Devices';
import {
	getScheduleOptions,
	saveSchedule,
} from './Schedule';
import {
	getEventOptions,
	setEvent,
} from './Events';

import type { ThunkAction } from './Types';
import {
	setCurrentLocation,
} from './Fences';
import GeoFenceUtils from '../Lib/GeoFenceUtils';

const ERROR_CODE_FENCE_ID_EXIST = 'FENCE_ID_EXISTS';
const ERROR_CODE_FENCE_NO_ACTION = 'FENCE_NO_ACTION';
const ERROR_CODE_TIMED_OUT = 'FENCE_TIMED_OUT';

const ERROR_CODE_GF_RC_DISABLED = 'GF_REMOTE_CONFIG_DISABLED';

import type { Action } from './Types';

function setupGeoFence(): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {

		const {
			user: { firebaseRemoteConfig = {} },
			geoFence = {},
		} = getState();
		const { geoFenceFeature = JSON.stringify({enable: false}) } = firebaseRemoteConfig;
		const { enable } = JSON.parse(geoFenceFeature);

		if (!enable) {
			return Promise.reject({
				code: ERROR_CODE_GF_RC_DISABLED,
			});
		}

		const {
			distanceFilter = 5,
			stopTimeout = 5,
			stopOnTerminate = false,
			startOnBoot = true,
			enableHeadless = true,
			geofenceModeHighAccuracy = true,
			preventSuspend = false,
		} = geoFence.config || {};

		BackgroundGeolocation.onGeofence((geofence: Object) => {
			Toast.showWithGravity(`onGeofence ${AppState.currentState || ''} ${geofence.action}`, Toast.LONG, Toast.TOP);
			dispatch(debugGFOnGeofence({
				...geofence,
				AppState: AppState.currentState,
				inAppTime: Date.now(),
			}));
			// if (AppState.currentState === 'active') {
			dispatch(handleFence(geofence));
			// } else {
			// 	BackgroundGeolocation.startBackgroundTask().then((taskId: number) => {
			// 		dispatch(handleFence(geofence)).then(() => {
			// 			BackgroundGeolocation.stopBackgroundTask(taskId);
			// 		});
			// 	}).catch((error: Object) => {
			// 		// Be sure to catch errors:  never leave you background-task hanging.
			// 		BackgroundGeolocation.stopBackgroundTask();
			// 	});
			// }
		});

		return BackgroundGeolocation.ready({
			// Geolocation Config
			desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
			distanceFilter,
			// Activity Recognition
			stopTimeout,
			// Application config
			debug: __DEV__, // <-- enable this hear sounds for background-geolocation life-cycle.
			logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
			stopOnTerminate, // <-- Allow the background-service to continue tracking when user closes the app.
			startOnBoot, // <-- Auto start tracking when device is powered-up.
			// HTTP / SQLite config
			batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
			autoSync: false, // <-- [Default: true] Set true to sync each location to server as it arrives.
			// Android
			enableHeadless,
			geofenceModeHighAccuracy,
			notification: {
				smallIcon: 'drawable/icon_notif', // <-- defaults to app icon
				largeIcon: 'drawable/icon_notif',
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

	const paramss = JSON.stringify(params);
	Toast.showWithGravity(`GeoFenceHeadlessTask ${name} ${paramss}`, Toast.LONG, Toast.TOP);
	if (name === 'geofence') {
		const {
			location = {},
		} = params;
		const {
			uuid,
		} = location;

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
		} = fence;
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
			let actions = null;
			if (action === 'ENTER') {
				actions = arriving;
			} else if (action === 'EXIT') {
				actions = leaving;
			}

			if (actions) {
				return dispatch(handleActions(actions, userId));
			}
			return Promise.resolve('done');
		}
		return Promise.resolve('done');
	};
}

function handleActions(actions: Object, userId: string): ThunkAction {
	return async (dispatch: Function, getState: Function): Promise<any> => {
		const { devices = {}, schedules = {}, events = {} } = actions;

		if (!userId) {
			return Promise.resolve('done');
		}

		const { user: { accounts = {} } } = getState();
		const { accessToken } = accounts[userId.trim().toLowerCase()];

		if (!accessToken) {
			return Promise.resolve('done');
		}

		let promises = [];

		for (let id in devices) {
			promises.push(dispatch(handleActionDevice(devices[id], accessToken)));
		}
		for (let id in events) {
			promises.push(dispatch(handleActionEvent(events[id], accessToken)));
		}
		for (let id in schedules) {
			promises.push(dispatch(handleActionSchedule(schedules[id], accessToken)));
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

function handleActionDevice(action: Object, accessToken: Object): ThunkAction {
	return async (dispatch: Function, getState: Function): Promise<any> => {
		const { deviceId, method, stateValues = {} } = action;
		if (!deviceId) {
			return Promise.resolve('done');
		}

		let promises = [];

		const methodsSharedSetState = [1, 2, 4, 16, 128, 256, 512];
		if (methodsSharedSetState.indexOf(method) !== -1) {
			const dimValue = stateValues[16];
			promises.push(dispatch(deviceSetState(deviceId, method, dimValue, accessToken)));
		} else if (method === 1024) {
			const rgbValue = stateValues[1024];
			const rgb = colorsys.hexToRgb(rgbValue);
			const { r, g, b } = rgb;
			promises.push(dispatch(deviceSetStateRGB(deviceId, r, g, b, accessToken)));
		} else if (method === 2048) {
			const {
				changeMode,
				scale,
				mode,
				temp,
			} = action;
			promises.push(dispatch(deviceSetStateThermostat(deviceId, mode, temp, scale, changeMode, mode === 'off' ? 2 : 1, accessToken)));
		}
		return await Promise.all(promises.map((promise: Promise<any>): Promise<any> => {
			return promise.then((res: Object): Object => {
				return res;
			}).catch((err: Object): Object => {
				return err;
			});
		}));
	};
}

function handleActionEvent(action: Object, accessToken: Object): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		const {
			id,
			...options
		} = getEventOptions(action);
		return dispatch(setEvent(id, options, accessToken));
	};
}

function handleActionSchedule(action: Object, accessToken: Object): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		const options = getScheduleOptions(action);
		return dispatch(saveSchedule(options, accessToken));
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
				fences:
		{
			fence,
		},
				user: {
					userId,
				},
			} = getState();
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
				notifyOnDwell: true,
				loiteringDelay: 10000,
			};

			BackgroundGeolocation.addGeofence(data).then((success: any): Object => {
				try {
					dispatch(startGeofences());
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
				userId: userIdC = '',
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

	ERROR_CODE_FENCE_ID_EXIST,
	ERROR_CODE_FENCE_NO_ACTION,
	ERROR_CODE_TIMED_OUT,

	debugGFOnGeofence,
	clearAllOnGeoFencesLog,
};
