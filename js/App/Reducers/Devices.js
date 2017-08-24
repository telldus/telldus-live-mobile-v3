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
 * @providesModule Reducers_Devices
 */

// @flow

'use strict';
import type { Action } from 'Actions_Types';
import { combineReducers } from 'redux';
import { REHYDRATE } from 'redux-persist/constants';

import { methods } from '../../Config.js';

import getPowerParts from '../Lib/getPowerParts';

export function getSupportedMethods(methodsAggregate: number): Object {
	const methodNumbers = getPowerParts(methodsAggregate);
	const methodHashmap = methodNumbers.reduce((memo, methodNumber) => {
		memo[methods[methodNumber]] = true;
		return memo;
	}, {});

	return methodHashmap;
}

export function getDeviceStateMethod(deviceStateNumber: number): string {
	return methods[parseInt(deviceStateNumber, 10)];
}

function reduceDevice(state:Object = {}, action:Action): Object {
	switch (action.type) {
		case 'RECEIVED_DEVICES':
			// TODO: nothing seems to be reduced here?
			return {
				// properties originated from server
				clientId: parseInt(state.client, 10),
				id: parseInt(state.id, 10),
				type: state.type,
				name: state.name,
				value: state.statevalue,
				ignored: Boolean(state.ignored),
				isErrorMessage: false,
				// clientDeviceId: parseInt(state.clientDeviceId, 10),
				// editable: Boolean(state.editable),
				// state: parseInt(state.state, 10),
				// online: Boolean(state.online),
				// ignored: Boolean(state.ignored),
				// methods: state.methods,
				// protocol: state.protocol,

				// properties originated on client
				// isInDashboard: state.isInDashboard, // TODO: uncomment as soon as reduceDevice correctly reduces
				isInState: getDeviceStateMethod(state.state),
				supportedMethods: getSupportedMethods(state.methods),
			};

		case 'DEVICE_SET_STATE':
			return {
				...state,
				isInState: getDeviceStateMethod(action.payload.method),
				value: action.payload.value,
				methodRequested: '',
			};

		case 'REQUEST_DEVICE_ACTION':
			return {
				...state,
				methodRequested: getDeviceStateMethod(action.payload.method),
				isErrorMessage: false,
			};

		case 'SET_DIMMER_VALUE':
			return {
				...state,
				isInState: 'DIM', // otherwise DimmerButton will render with state TURNOFF
				value: action.payload.value,
			};

		case 'ADD_TO_DASHBOARD':
			return {
				...state,
				isInDashboard: true,
			};

		case 'REMOVE_FROM_DASHBOARD':
			return {
				...state,
				isInDashboard: false,
			};

		case 'REQUEST_TURNON':
			return {
				...state,
				methodRequested: 'TURNON',
				isErrorMessage: false,
			};

		case 'REQUEST_TURNOFF':
			return {
				...state,
				methodRequested: 'TURNOFF',
				isErrorMessage: false,
			};
		case 'DEVICE_UNREACHABLE':
			return {
				...state,
				isErrorMessage: action.payload.message,
			};
		case 'DEVICE_RESET_STATE':
			return {
				...state,
				isErrorMessage: false,
				methodRequested: '',
				isInState: getDeviceStateMethod(action.state),
			};

		case 'DEVICE_HISTORY':
			/* currently not checking if old data present or not.
			   should change as, fetch using timestamp and if there are more timestamps/intervals
			   those subsequest results must be appended to the previous[latest data with respect to time] ones. */

			/* sorting the data w.r.t. date (latest first). */
			let data = action.payload.history.sort((a, b) => {
				return b.ts - a.ts;
			});
			return {
				...state,
				history: {
					timestamp: action.payload.timestamp,
					data,
				},
			};

		default:
			return state;
	}
}

function byId(state = {}, action) {
	if (action.type === REHYDRATE) {
		if (action.payload.devices && action.payload.devices.byId) {
			console.log('rehydrating devices.byId');
			return {
				...state,
				...action.payload.devices.byId,
			};
		}
		return { ...state };
	}
	if (action.type === 'RECEIVED_DEVICES') {
		return action.payload.device.reduce((acc, deviceState) => {
			acc[deviceState.id] = {
				...state[deviceState.id],
				// TODO: pass in received state as action.payload (see gateways reducer)
				...reduceDevice(deviceState, action),
			};
			return acc;
		}, {});
	}
	if (action.type === 'DEVICE_SET_STATE') {
		return {
			...state,
			[action.payload.deviceId]: reduceDevice(state[action.payload.deviceId], action),
		};
	}
	if (action.type === 'REQUEST_DEVICE_ACTION') {
		return {
			...state,
			[action.payload.deviceId]: reduceDevice(state[action.payload.deviceId], action),
		};
	}
	if (action.type === 'SET_DIMMER_VALUE') {
		return {
			...state,
			[action.payload.deviceId]: reduceDevice(state[action.payload.deviceId], action),
		};
	}
	if (action.type === 'ADD_TO_DASHBOARD' && action.kind === 'device') {
		return {
			...state,
			[action.id]: reduceDevice(state[action.id], action),
		};
	}
	if (action.type === 'REMOVE_FROM_DASHBOARD' && action.kind === 'device') {
		return {
			...state,
			[action.id]: reduceDevice(state[action.id], action),
		};
	}
	if (action.type === 'LOGGED_OUT') {
		return {};
	}
	if (action.type === 'REQUEST_TURNON' || action.type === 'REQUEST_TURNOFF') {
		return {
			...state,
			[action.payload.deviceId]: reduceDevice(state[action.payload.deviceId], action),
		};
	}
	if (action.type === 'DEVICE_HISTORY') {
		return {
			...state,
			[action.payload.deviceId]: reduceDevice(state[action.payload.deviceId], action),
		};
	}
	if (action.type === 'DEVICE_UNREACHABLE') {
		return {
			...state,
			[action.payload.deviceId]: reduceDevice(state[action.payload.deviceId], action),
		};
	}
	if (action.type === 'DEVICE_RESET_STATE') {
		return {
			...state,
			[action.deviceId]: reduceDevice(state[action.deviceId], action),
		};
	}

	return state;
}

const allIds = (state = [], action) => {
	if (action.type === REHYDRATE) {
		if (action.payload.devices && action.payload.devices.allIds) {
			console.log('rehydrating devices.allIds');
			return [
				...state,
				...action.payload.devices.allIds,
			];
		}
		return [...state];
	}
	if (action.type === 'RECEIVED_DEVICES') {
		// overwrites entire state
		// exclude ignored devices
		return action.payload.device
		             .filter(deviceState => !deviceState.ignored)
		             .map(deviceState => deviceState.id);
	}
	if (action.type === 'LOGGED_OUT') {
		return [];
	}
	return state;
};

export default combineReducers({
	allIds,
	byId,
});

export function parseDevicesForListView(devices:Object = {}, gateways:Object = {}, editMode:boolean = false) {
	const sections = devices.allIds.reduce((acc, deviceId) => {
		acc[devices.byId[deviceId].clientId] = [];
		return acc;
	}, {});
	const sectionIds = Object.keys(sections).map(id => parseInt(id, 10));

	devices.allIds.forEach(deviceId => {
		const device = devices.byId[deviceId];
		sections[device.clientId].push({
			device,
			editMode,
		});
	});

	sectionIds.sort((a, b) => {
		// might be that devices get rendered before gateways are fetched
		const gatewayA = gateways.byId[a] ? gateways.byId[a].name : a;
		const gatewayB = gateways.byId[b] ? gateways.byId[b].name : b;

		if (gatewayA < gatewayB) {
			return -1;
		}
		if (gatewayA > gatewayB) {
			return 1;
		}
		return 0;
	});
	return {
		sections,
		sectionIds,
	};
}
