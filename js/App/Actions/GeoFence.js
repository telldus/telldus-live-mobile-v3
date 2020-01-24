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

import type { ThunkAction } from './Types';
import {
	setCurrentLocation,
} from './Fences';

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


module.exports = {
	initializeWatcher,
	checkPermissionAndInitializeWatcher,
};
