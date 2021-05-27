
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

const onGeofenceInit: Array<Object> = [];

export const initialState = {
	onGeofence: onGeofenceInit,
	config: {
		distanceFilter: 5,
		stopTimeout: 5,
		stopOnTerminate: false,
		startOnBoot: true,
		enableHeadless: true,
		geofenceModeHighAccuracy: true,
		preventSuspend: true,
		showNotificationOnActionFail: true,
		locationUpdateInterval: 1000,
		geofenceProximityRadius: 400,
		debug: false,
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
	if (action.type === 'DEBUG_GF_SET_CHECKPOINT') {
		const {
			checkpoint,
			eventUUID,
			...others
		} = action.payload;

		const {
			onGeofence = [],
		} = state;
		let newOnGeofence = [];
		onGeofence.map((events: Object) => {
			const {
				location = {},
			} = events;
			const {
				uuid,
			} = location;
			if (eventUUID === uuid) {
				newOnGeofence.push({
					...events,
					checkpoints: {
						...events.checkpoints,
						[checkpoint]: {
							...others,
							checkpoint,
						},
					},
				});
			} else {
				newOnGeofence.push(events);
			}
		});

		return {
			...state,
			onGeofence: newOnGeofence,
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
	if (action.type === 'CLEAR_ON_GEOFENCE_LOG') {
		return {
			...state,
			onGeofence: [],
		};
	}
	return state;
};

export default geoFence;

