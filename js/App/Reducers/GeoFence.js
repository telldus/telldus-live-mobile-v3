
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
 */

// @flow

'use strict';

export type State = ?Object;

export const initialState = {
	onGeofence: [],
	config: {
		distanceFilter: 5,
		stopTimeout: 5,
		stopOnTerminate: false,
		startOnBoot: true,
		enableHeadless: true,
		geofenceModeHighAccuracy: false,
		preventSuspend: false,
	},
};

const geoFence = (state: Object = initialState, action: Object): State => {
	if (action.type === 'persist/REHYDRATE') {
		if (action.payload && action.payload.geoFence) {
			console.log('rehydrating geoFence');
			return {
				...state,
				...action.payload.geoFence,
			};
		}
		return state;
	}
	if (action.type === 'DEBUG_GF_EVENT_ONGEOFENCE') {
		const {
			onGeofence = [],
		} = state;

		return {
			...state,
			onGeofence: onGeofence.concat(action.payload),
		};
	}
	if (action.type === 'UPDATE_GEOFENCE_CONFIG') {
		const {
			config = {},
		} = state;

		return {
			...state,
			config: {
				...config,
				...action.payload,
			},
		};
	}
	return state;
};

export default geoFence;

