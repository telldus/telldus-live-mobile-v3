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

import {
	Platform,
	PermissionsAndroid,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
const colorsys = require('colorsys');

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

function checkPermissionAndInitializeWatcher(): ThunkAction {
	return (dispatch: Function, getState: Function) => {
		if (Platform.OS === 'android') {
			PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
				.then((granted: boolean) => {
					if (granted === PermissionsAndroid.RESULTS.GRANTED || granted === true) {
						dispatch(initializeWatcher());
					}
				}).catch((error: Object) => {
				});
		} else {
			Geolocation.setRNConfiguration({
				skipPermissionRequests: true,
				authorizationLevel: 'always',
			});
			Geolocation.requestAuthorization();
			dispatch(initializeWatcher());
		}
	};
}

function initializeWatcher(): ThunkAction {
	return (dispatch: Function, getState: Function) => {
		Geolocation.getCurrentPosition(
			(position: Object) => {
				const {
					latitude,
					longitude,
				} = position.coords || {};
				dispatch(setCurrentLocation({
					latitude,
					longitude,
				}));
			},
			(error: Object) => {
			},
			{
				enableHighAccuracy: true,
				timeout: 15000,
				maximumAge: 10000,
			},
		);
		Geolocation.watchPosition(
			(position: Object) => {
				dispatch(checkFences(position.coords));
				const {
					latitude,
					longitude,
				} = position.coords || {};
				dispatch(setCurrentLocation({
					latitude,
					longitude,
				}));
			},
			(error: Object) => {
			},
			{
				enableHighAccuracy: true,
				distanceFilter: 5,
			},
		);
	};
}

function checkFences(newLocation: Object): ThunkAction {
	return (dispatch: Function, getState: Function) => {
		const { fences: { fences, location: oldLocation } } = getState();
		if (oldLocation) {
			fences.forEach((fence: Object) => {
				const {fromHr, fromMin, toHr, toMin} = fence;
				if (fence.isAlwaysActive || GeoFenceUtils.isActive(fromHr, fromMin, toHr, toMin)) {
					let inFence = (GeoFenceUtils.getDistanceFromLatLonInKm(fence.latitude, fence.longitude, newLocation.latitude, newLocation.longitude) < fence.radius);
					let wasInFence = (GeoFenceUtils.getDistanceFromLatLonInKm(fence.latitude, fence.longitude, oldLocation.latitude, oldLocation.longitude) < fence.radius);
					let actions = null;
					if (inFence && !wasInFence) { // arrive fence
						actions = fence.arriving;
					} else if (!inFence && wasInFence) { // leave fence
						actions = fence.leaving;
					}

					if (actions) {
						dispatch(handleActions(actions));
					}
				}
			});
		}
	};
}

function handleActions(actions: Object): ThunkAction {
	return (dispatch: Function, getState: Function) => {
		const { devices = {}, schedules = {}, events = {} } = actions;
		for (let id in devices) {
			dispatch(handleActionDevice(devices[id]));
		}
		for (let id in events) {
			dispatch(handleActionEvent(events[id]));
		}
		for (let id in schedules) {
			dispatch(handleActionSchedule(schedules[id]));
		}
	};
}

function handleActionDevice(action: Object): ThunkAction {
	return (dispatch: Function, getState: Function) => {
		const { deviceId, method, stateValues = {} } = action;
		if (!deviceId) {
			return;
		}

		const methodsSharedSetState = [1, 2, 4, 16, 128, 256, 512];
		if (methodsSharedSetState.indexOf(method) !== -1) {
			const dimValue = stateValues[16];
			dispatch(deviceSetState(deviceId, method, dimValue));
		} else if (method === 1024) {
			const rgbValue = stateValues[1024];
			const rgb = colorsys.hexToRgb(rgbValue);
			const { r, g, b } = rgb;
			dispatch(deviceSetStateRGB(deviceId, r, g, b));
		} else if (method === 2048) {
			const {
				changeMode,
				scale,
				mode,
				temp,
			} = action;
			dispatch(deviceSetStateThermostat(deviceId, mode, temp, scale, changeMode, mode === 'off' ? 2 : 1));
		}
	};
}

function handleActionEvent(action: Object): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		const {
			id,
			...options
		} = getEventOptions(action);
		return dispatch(setEvent(id, options));
	};
}

function handleActionSchedule(action: Object): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		const options = getScheduleOptions(action);
		return dispatch(saveSchedule(options));
	};
}

module.exports = {
	initializeWatcher,
	checkPermissionAndInitializeWatcher,
};