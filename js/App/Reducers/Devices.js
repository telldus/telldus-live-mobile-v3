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
 * @providesModule Reducers/Devices
 */

'use strict';

const initialState = [];
const deviceInitialState = {};

import getPowerParts from '../Lib/getPowerParts';

import { methods } from '../../Config.js';

function getSupportedMethods(methodsAggregate: Number): Array {
	const methodNumbers = getPowerParts(methodsAggregate);
	const methodHashmap = methodNumbers.reduce((memo, methodNumber) => {
		memo[methods[methodNumber]] = true;
		return memo;
	}, {});
	return methodHashmap;
}

function getDeviceStateMethod(deviceStateNumber: number): String {
	return methods[parseInt(deviceStateNumber, 10)];
}

function reduceDevice(state = deviceInitialState, action) {
	switch (action.type) {
	case 'RECEIVED_DEVICES':
			// TODO: nothing seems to be reduced here?
		return {
			clientId: parseInt(state.client, 10),
			id: parseInt(state.id, 10),
			type: state.type,
			name: state.name,
			isInState: getDeviceStateMethod(state.state),
			supportedMethods: getSupportedMethods(state.methods),
			value: state.statevalue,
				// clientDeviceId: parseInt(state.clientDeviceId, 10),
				// editable: Boolean(state.editable),
				// state: parseInt(state.state, 10),
				// online: Boolean(state.online),
				// ignored: Boolean(state.ignored),
				// methods: state.methods,
				// protocol: state.protocol,
		};
	case 'LOGGED_OUT':
		return deviceInitialState;
	default:
		return state;
	}
}

export default function reduceDevices(state = initialState, action) {
	if (action.type === 'RECEIVED_DEVICES') {
		return action.payload.device.map(deviceState =>
			reduceDevice(deviceState, action)
		);
	}
	if (action.type === 'LOGGED_OUT') {
		return {
			...initialState
		};
	}

	if (action.type === 'DEVICE_SET_STATE') {
		const devicesState = state.map(deviceState => {
			if (deviceState.id !== action.deviceId) {
				return deviceState;
			}
			const newDeviceState = {
				...deviceState,
				isInState: getDeviceStateMethod(action.method),
				value: action.value,
			};
			return newDeviceState;
		});

		return devicesState;
	}

	if (action.type === 'DEVICE_TURN_ON') {
		const devicesState = state.map(deviceState => {
			if (deviceState.id !== action.deviceId) {
				return deviceState;
			}
			const newDeviceState = {
				...deviceState,
				isInState: 'TURNON',
			};
			return newDeviceState;
		});

		return devicesState;
	}

	if (action.type === 'DEVICE_DIM') {
		const devicesState = state.map(deviceState => {
			if (deviceState.id !== action.deviceId) {
				return deviceState;
			}
			const newDeviceState = {
				...deviceState,
				isInState: 'DIM',
			};
			return newDeviceState;
		});

		return devicesState;
	}

	if (action.type === 'SET_DIMMER_VALUE') {
		const devicesState = state.map(deviceState => {
			if (deviceState.id !== action.deviceId) {
				return deviceState;
			}
			const newDeviceState = {
				...deviceState,
				value: action.value,
				isInState: 'DIM', // otherwise DimmerButton will render with state TURNOFF
			};
			return newDeviceState;
		});

		return devicesState;
	}

	return state;
}

export function parseDevicesForListView(devices = [], gateways = [], dashboard = {}) {
	const items = {};
	const sectionIds = [];

	if (devices) {
		devices.map((item) => {
			let sectionId = item.clientId ? item.clientId : '';
			if (sectionIds.indexOf(sectionId) === -1) {
				sectionIds.push(sectionId);
				items[sectionId] = [];
			}

			if (dashboard.devices.indexOf(item.id) >= 0) {
				item.inDashboard = true;
			} else {
				item.inDashboard = false;
			}

			items[sectionId].push(item);
		});
	}
	sectionIds.sort((a, b) => {
		try {
			const gatewayA = gateways.find((gateway) => gateway.id === a);
			const gatewayB = gateways.find((gateway) => gateway.id === b);
			if (gatewayA.name < gatewayB.name) {
				return -1;
			}
			if (gatewayA.name > gatewayB.name) {
				return 1;
			}
			return 0;
		} catch (e) {
			return 0;
		}
	});
	return {items, sectionIds};
}
