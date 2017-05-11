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

import isArray from 'lodash/isArray';

export type State = ?Object;

const initialState = [];
const sensorInitialState = {};

function sensorReducer(state: State = sensorInitialState, action: Action): State {
	switch (action.type) {
		case 'RECEIVED_SENSORS':
			const newSensor = {
				battery: state.battery,
				clientId: parseInt(state.client, 10),
				editable: Boolean(state.editable),
				id: parseInt(state.id, 10),
				ignored: Boolean(state.ignored),
				keepHistory: Boolean(state.keepHistory),
				lastUpdated: state.lastUpdated,
				model: state.model,
				name: state.name,
				protocol: state.protocol,
				sensorId: parseInt(state.sensorId, 10),
			};
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
			return sensorInitialState;
		default:
			return state;
	}
}

export default function sensorsReducer(state: State = initialState, action: Action): State {
	if (action.type === 'RECEIVED_SENSORS') {
		return action.payload.sensor.map(sensorState =>
			sensorReducer(sensorState, action)
		);
	}
	if (action.type === 'LOGGED_OUT') {
		return {
			...initialState,
		};
	}
	if (action.type === 'SENSOR_UPDATE_VALUE') {
		return state.map(sensorState => {
			if (sensorState.id !== action.payload.sensorId) {
				return sensorState;
			}
			const _sensor = { ...sensorState };
			_sensor.lastUpdated = parseInt(action.payload.time, 10);
			_sensor.battery = action.payload.battery;
			action.payload.data.map(sensorData => {
				if (sensorData.type === 1) {
					_sensor.temperature = sensorData.value;
				} else if (sensorData.type === 2) {
					_sensor.humidity = sensorData.value;
				} else if (sensorData.type === 4) {
					_sensor.rainRate = sensorData.value;
				} else if (sensorData.type === 8) {
					_sensor.rainTotal = sensorData.value;
				} else if (sensorData.type === 32) {
					_sensor.windAverage = sensorData.value;
				} else if (sensorData.type === 64) {
					_sensor.windGust = sensorData.value;
				} else if (sensorData.type === 16) {
					_sensor.windDirection = sensorData.value;
				} else if (sensorData.type === 128) {
					_sensor.uv = sensorData.value;
				} else if (sensorData.type === 256 && sensorData.scale === 2) {
					_sensor.watt = sensorData.value;
				} else if (sensorData.type === 512) {
					_sensor.luminance = sensorData.value;
				}
			});
			return _sensor;
		});
	}
	return state;
}

// TODO: clean up this function
export function parseSensorsForListView({ sensors, gateways, dashboard }) {
	const sections = {};
	const sectionIds = [];
	if (!isArray(sensors)) {
		return { sections, sectionIds };
	}

	sensors.map(sensor => {
		const sectionId = sensor.clientId ? sensor.clientId : '';
		if (sectionIds.indexOf(sectionId) === -1) {
			sectionIds.push(sectionId);
			sections[sectionId] = [];
		}

		sensor.inDashboard = false;
		for (let i = 0; i < dashboard.sensors.length; ++i) {
			if (dashboard.sensors[i].id === sensor.id) {
				sensor.inDashboard = true;
				break;
			}
		}

		sections[sectionId].push(sensor);
	});

	const gatewayNameLookUp = gateways.reduce(function(acc, gateway) {
		acc[gateway.id] = gateway.name;
		return acc;
	}, {});

	sectionIds.sort((a, b) => {
		const gatewayA = gatewayNameLookUp[a];
		const gatewayB = gatewayNameLookUp[b];

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
