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

import { combineReducers } from 'redux';
import { REHYDRATE } from 'redux-persist/constants';

import includes from 'lodash/includes';
import omit from 'lodash/omit';
import pickBy from 'lodash/pickBy';
import difference from 'lodash/difference';
import differenceBy from 'lodash/differenceBy';

const allIds = (kind: string): Function => (state: Object = [], action: Object): Object => {
	if (action.type === 'persist/REHYDRATE') {
		if (action.payload.dashboard && action.payload.dashboard.deviceIds && kind === 'device') {
			console.log('rehydrating dashboard.deviceIds');
			return [
				...state,
				...action.payload.dashboard.deviceIds,
			];
		}
		if (action.payload.dashboard && action.payload.dashboard.sensorIds && kind === 'sensor') {
			console.log('rehydrating dashboard.sensorIds');
			return [
				...state,
				...action.payload.dashboard.sensorIds,
			];
		}
		return [...state];
	}
	if (action.type === 'RECEIVED_DEVICES' && kind === 'device') {
		let devices = action.payload.device.map((item: Object): number => {
			return parseInt(item.id, 10);
		});
		let removedDevices = difference(state, devices);
		return differenceBy(state, removedDevices);
	}
	if (action.type === 'RECEIVED_SENSORS' && kind === 'sensor') {
		let sensors = action.payload.sensor.map((item: Object): number => {
			return parseInt(item.id, 10);
		});
		let removedSensors = difference(state, sensors);
		return differenceBy(state, removedSensors);
	}
	if (action.type === 'ADD_TO_DASHBOARD' && action.kind === kind) {
		if (includes(state, action.id)) {
			return state;
		}
		return [
			...state,
			action.id,
		];
	}
	if (action.type === 'REMOVE_FROM_DASHBOARD' && action.kind === kind) {
		return state.filter((id: number): boolean => id !== action.id);
	}
	if (action.type === 'LOGGED_OUT') {
		return [];
	}
	return state;
};

const byId = (kind: string): Function => (state: Object = {}, action: Object): Object => {
	if (action.type === REHYDRATE) {
		if (action.payload.dashboard && action.payload.dashboard.devicesById
		    && kind === 'device') {
			console.log('rehydrating dashboard.devicesById');
			return {
				...state,
				...action.payload.dashboard.devicesById,
			};
		}
		if (action.payload.dashboard && action.payload.dashboard.sensorsById
		    && kind === 'sensor') {
			console.log('rehydrating dashboard.sensorsById');
			return {
				...state,
				...action.payload.dashboard.sensorsById,
			};
		}
		return { ...state };
	}
	if (action.type === 'RECEIVED_DEVICES' && kind === 'device') {
		let devices = action.payload.device.map((item: Object): Object => {
			return parseInt(item.id, 10);
		});
		let itemsToFilter = Object.keys(state);
		itemsToFilter = itemsToFilter.map((item: Object): Object => {
			return parseInt(item, 10);
		});
		let removedDevices = difference(itemsToFilter, devices);
		let newState = pickBy(state, (v: Object, k: string): boolean => {
			return removedDevices.indexOf(parseInt(k, 10)) === -1;
		});
		return newState;
	}
	if (action.type === 'RECEIVED_SENSORS' && kind === 'sensor') {
		let sensors = action.payload.sensor.map((item: Object): number => {
			return parseInt(item.id, 10);
		});
		let itemsToFilter = Object.keys(state);
		itemsToFilter = itemsToFilter.map((item: Object): number => {
			return parseInt(item, 10);
		});
		let removedSensors = difference(itemsToFilter, sensors);
		let newState = pickBy(state, (v: Object, k: string): boolean => {
			return removedSensors.indexOf(parseInt(k, 10)) === -1;
		});
		return newState;
	}
	if (action.type === 'ADD_TO_DASHBOARD' && action.kind === kind) {
		return {
			...state,
			[action.id]: true,
		};
	}
	if (action.type === 'REMOVE_FROM_DASHBOARD' && action.kind === kind) {
		return omit(state, action.id);
	}
	if (action.type === 'LOGGED_OUT') {
		return {};
	}

	return state;
};

const sensorDisplayTypeById = (state: Object = {}, action: Object): Object => {
	if (action.type === REHYDRATE) {
		if (action.payload.dashboard && action.payload.dashboard.sensorDisplayTypeById) {
			console.log('rehydrating dashboard.sensorDisplayTypeById');
			return {
				...state,
				...action.payload.dashboard.sensorDisplayTypeById,
			};
		}
		return { ...state };
	}

	switch (action.type) {
		case 'CHANGE_SENSOR_DISPLAY_TYPE':
			return {
				...state,
				[action.id]: action.displayType,
			};
		case 'REMOVE_FROM_DASHBOARD': // leave setting in, in case user adds sensor back again
		case 'LOGGED_OUT':
			return {};
		default:
			return state;
	}
};

export default combineReducers({
	devicesById: byId('device'),
	deviceIds: allIds('device'),
	sensorsById: byId('sensor'),
	sensorIds: allIds('sensor'),
	sensorDisplayTypeById,
});

export function parseDashboardForListView(dashboard: Object = {}, devices: Object = {}, sensors: Object = {}): Array {
	const deviceItems = dashboard.deviceIds.map((deviceId: number): Object => {
		return {
			objectType: 'device',
			childObject: devices.byId[deviceId],
		};
	});

	const sensorItems = dashboard.sensorIds.map((sensorId: number): Object => {
		return {
			objectType: 'sensor',
			childObject: sensors.byId[sensorId],
		};
	});

	return [...deviceItems, ...sensorItems];
}
