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

'use strict';

import type { Action } from 'Actions/Types';
import { REHYDRATE } from 'redux-persist/constants';

import { combineReducers } from 'redux';

export type State = ?Object;

// TODO: reducing of single item happens both in byId and reduceSensor. resolve to only reduceSensor
function reduceSensor(state = {}, action: Action): State {
	switch (action.type) {
		case 'RECEIVED_SENSORS':
			// properties originated from server
			const newSensor = {
				id: parseInt(state.id, 10), // unique id
				sensorId: parseInt(state.sensorId, 10), // TODO: is this ever used?
				battery: state.battery,
				clientId: parseInt(state.client, 10),
				editable: Boolean(state.editable),
				ignored: Boolean(state.ignored),
				keepHistory: Boolean(state.keepHistory),
				lastUpdated: state.lastUpdated,
				model: state.model,
				name: state.name,
				protocol: state.protocol,
			};

			// properties originated on client
			// newSensor.isInDashboard = state.isInDashboard; // TODO: uncomment as soon as reduceSensor correctly reduces

			if (state.temp) {
				newSensor.temperature = state.temp;
			}
			if (state.humidity) {
				newSensor.humidity = state.humidity;
			}
			if (state.rrate) {
				newSensor.rainRate = state.rrate;
			}
			if (state.rtot) {
				newSensor.rainTotal = state.rtot;
			}
			if (state.uv) {
				newSensor.uv = state.uv;
			}
			if (state.watt) {
				newSensor.watt = state.watt;
			}
			if (state.lum) {
				newSensor.luminance = state.lum;
			}
			if (state.wavg) {
				newSensor.windAverage = state.wavg;
			}
			if (state.wgust) {
				newSensor.windGust = state.wgust;
			}
			if (state.wdir) {
				newSensor.windDirection = state.wdir;
			}
			return newSensor;
		case 'LOGGED_OUT':
			return {};
		default:
			return state;
	}
}

const allIds = (state = [], action: Action): State => {
	if (action.type === REHYDRATE) {
		if (action.payload.sensors && action.payload.sensors.allIds) {
			console.log('rehydrating sensors.allIds');
			return [
				...state,
				...action.payload.sensors.allIds,
			];
		}
		return [ ...state ];
	}
	if (action.type === 'RECEIVED_SENSORS') {
		// overwrites entire state
		return action.payload.sensor.map(sensorState => sensorState.id);
	}
	if (action.type === 'LOGGED_OUT') {
		return [];
	}
	return state;
};

const byId = (state = {}, action: Action): State => {
	if (action.type === REHYDRATE) {
		if (action.payload.sensors && action.payload.sensors.byId) {
			console.log('rehydrating sensors.byId');
			return {
				...state,
				...action.payload.sensors.byId,
			};
		}
		return { ...state };
	}
	if (action.type === 'RECEIVED_SENSORS') {
		// overwrites entire state
		return action.payload.sensor.reduce((acc, sensorState) => {
			acc[sensorState.id] = {
				...state[sensorState.id],
				...reduceSensor(sensorState, action),
			};
			return acc;
		}, {});
	}
	if (action.type === 'LOGGED_OUT') {
		return {};
	}
	if (action.type === 'SENSOR_UPDATE_VALUE') {
		const sensor = { ...state[action.payload.id] };

		// TODO: move this to reduceSensor()
		sensor.lastUpdated = parseInt(action.payload.time, 10);
		sensor.battery = action.payload.battery;
		action.payload.data.map(sensorData => {
			if (sensorData.type === 1) {
				sensor.temperature = sensorData.value;
			} else if (sensorData.type === 2) {
				sensor.humidity = sensorData.value;
			} else if (sensorData.type === 4) {
				sensor.rainRate = sensorData.value;
			} else if (sensorData.type === 8) {
				sensor.rainTotal = sensorData.value;
			} else if (sensorData.type === 32) {
				sensor.windAverage = sensorData.value;
			} else if (sensorData.type === 64) {
				sensor.windGust = sensorData.value;
			} else if (sensorData.type === 16) {
				sensor.windDirection = sensorData.value;
			} else if (sensorData.type === 128) {
				sensor.uv = sensorData.value;
			} else if (sensorData.type === 256 && sensorData.scale === 2) {
				sensor.watt = sensorData.value;
			} else if (sensorData.type === 512) {
				sensor.luminance = sensorData.value;
			}
		});

		return {
			...state,
			[action.payload.id]: sensor,
		};
	}

	if (action.type === 'ADD_TO_DASHBOARD' && action.kind === 'sensor') {
		return {
			...state,
			[action.id]: {
				...state[action.id],
				isInDashboard: true,
			},
		};
	}
	if (action.type === 'REMOVE_FROM_DASHBOARD' && action.kind === 'sensor') {
		return {
			...state,
			[action.id]: {
				...state[action.id],
				isInDashboard: false,
			},
		};
	}

	return state;
};

export default combineReducers({
	allIds,
	byId,
});

export function parseSensorsForListView(sensors = {}, gateways = {}, editMode = false) {
	const sections = sensors.allIds.reduce((acc, sensorId) => {
		acc[sensors.byId[sensorId].clientId] = [];
		return acc;
	}, {});
	const sectionIds = Object.keys(sections).map(id => parseInt(id, 10));

	sensors.allIds.forEach(sensorId => {
		const sensor = sensors.byId[sensorId];
		sections[sensor.clientId].push({
			sensor,
			editMode,
		});
	});

	sectionIds.sort((a, b) => {
		// might be that sensors get rendered before gateways are fetched
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
	return { sections, sectionIds };
}
