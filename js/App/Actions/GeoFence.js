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

function setupGeoFence(): ThunkAction {
	return (dispatch: Function, getState: Function) => {

		const { user: { firebaseRemoteConfig = {} } } = getState();
		const { geoFenceFeature = JSON.stringify({enable: false}) } = firebaseRemoteConfig;
		const { enable } = JSON.parse(geoFenceFeature);

		if (!enable) {
			return;
		}

		BackgroundGeolocation.onGeofence((geofence: Object) => {
			Toast.showWithGravity(`onGeofence ${AppState.currentState || ''} ${geofence.action}`, Toast.LONG, Toast.TOP);
			if (AppState.currentState === 'active') {
				dispatch(handleFence(geofence));
			} else {
				BackgroundGeolocation.startBackgroundTask().then((taskId: number) => {
					dispatch(handleFence(geofence)).then(() => {
						BackgroundGeolocation.stopBackgroundTask(taskId);
					});
				}).catch((error: Object) => {
					// Be sure to catch errors:  never leave you background-task hanging.
					BackgroundGeolocation.stopBackgroundTask();
				});
			}
		});

		BackgroundGeolocation.ready({
			// Geolocation Config
			desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
			distanceFilter: 10,
			// Activity Recognition
			stopTimeout: 1,
			// Application config
			debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
			logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
			stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
			startOnBoot: true, // <-- Auto start tracking when device is powered-up.
			// HTTP / SQLite config
			batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
			autoSync: false, // <-- [Default: true] Set true to sync each location to server as it arrives.
			// Android: Foreground service
			foregroundService: true,
			notification: {
				title: 'Telldus Live! Mobile',
				text: 'GeoFence Tracking',
				smallIcon: 'drawable/icon_notif', // <-- defaults to app icon
				largeIcon: 'drawable/icon_notif',
			},
		}, async (state: Object) => {
			if (!state.enabled) {
				state = await BackgroundGeolocation.startGeofences();
			}
			if (state.enabled) {
				try {
					let location = await BackgroundGeolocation.getCurrentPosition({
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
				} catch (e) {
					// Ignore
				}
			}
		});
	};
}


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
	return (dispatch: Function, getState: Function): Promise<any> => {
		const { devices = {}, schedules = {}, events = {} } = actions;

		if (!userId) {
			return Promise.resolve('done');
		}

		const { user: { accounts = {} } } = getState();
		const { accessToken } = accounts[userId.trim().toLowerCase()];

		if (!accessToken) {
			return Promise.resolve('done');
		}

		for (let id in devices) {
			dispatch(handleActionDevice(devices[id], accessToken));
		}
		for (let id in events) {
			dispatch(handleActionEvent(events[id], accessToken));
		}
		for (let id in schedules) {
			dispatch(handleActionSchedule(schedules[id], accessToken));
		}
		// NOTE: Not using Promise.all to resolve as BG task started using BackgroundGeolocation.startBackgroundTask
		// Will only last for 30secs in Android and 180secs in iOS. If any promise gets stuck we do not want the
		// preceeding requests/actions to be not fires/ignored.
		return Promise.resolve('done');
	};
}

function handleActionDevice(action: Object, accessToken: Object): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		const { deviceId, method, stateValues = {} } = action;
		if (!deviceId) {
			return Promise.resolve('done');
		}

		const methodsSharedSetState = [1, 2, 4, 16, 128, 256, 512];
		if (methodsSharedSetState.indexOf(method) !== -1) {
			const dimValue = stateValues[16];
			return dispatch(deviceSetState(deviceId, method, dimValue, accessToken));
		} else if (method === 1024) {
			const rgbValue = stateValues[1024];
			const rgb = colorsys.hexToRgb(rgbValue);
			const { r, g, b } = rgb;
			return dispatch(deviceSetStateRGB(deviceId, r, g, b, accessToken));
		} else if (method === 2048) {
			const {
				changeMode,
				scale,
				mode,
				temp,
			} = action;
			return dispatch(deviceSetStateThermostat(deviceId, mode, temp, scale, changeMode, mode === 'off' ? 2 : 1, accessToken));
		}
		return Promise.resolve('done');
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

function addGeofence(override?: boolean = false): ThunkAction {
	return async (dispatch: Function, getState: Function): Promise<any> => {

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
			title: cTitle = '',
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

		const data: TYPE_ADD_GEO_FENCE_DATA = {
			identifier: `${userId}-${cTitle}`,
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

		let hasFenceBySameName = false;
		const geofences = await dispatch(getCurrentAccountsFences());

		if (!override && (geofences && geofences.length > 0)) {
			for (let i = 0; i < geofences.length; i++) {
				const {
					extras: {
						title = '',
					},
				} = geofences[i];
				if (title.trim().toLowerCase() === cTitle.trim().toLowerCase()) {
					hasFenceBySameName = true;
					break;
				}
			}
		}

		if (hasFenceBySameName) {
			return Promise.reject({
				code: ERROR_CODE_FENCE_ID_EXIST,
				message: 'Fence by the same name already exist',
			});
		}

		return BackgroundGeolocation.addGeofence(data).then((success: any): Object => {
			return success;
		}).catch((error: any) => {
			throw error;
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

module.exports = {
	setupGeoFence,
	addGeofence,
	getGeofences,
	ERROR_CODE_FENCE_ID_EXIST,
	getCurrentAccountsFences,
	removeGeofence,
};
