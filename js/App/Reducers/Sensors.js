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

import type { Action } from '../actions/types';

export type State = ?object;

const initialState = [];
const sensorInitialState = {};

function sensor(state: State = sensorInitialState, action: Action): State {
	switch (action.type) {
		case 'RECEIVED_SENSORS':
			var newSensor = {
				battery: state.battery,
				clientId: parseInt(state.client),
				editable: Boolean(state.editable),
				id: parseInt(state.id),
				ignored: Boolean(state.ignored),
				keepHistory: Boolean(state.keepHistory),
				lastUpdated: state.lastUpdated,
				model: state.model,
				name: state.name,
				protocol: state.protocol,
				sensorId: parseInt(state.sensorId),
			};
			if (state.temp) {
				newSensor['temperature'] = state.temp
			}
			if (state.humidity) {
				newSensor['humidity'] = state.humidity
			}
			if (state.rrate) {
				newSensor['rainRate'] = state.rrate
			}
			if (state.rtot) {
				newSensor['rainTotal'] = state.rtot
			}
			if (state.uv) {
				newSensor['uv'] = state.uv
			}
			if (state.watt) {
				newSensor['watt'] = state.watt
			}
			if (state.lum) {
				newSensor['luminance'] = state.lum
			}
			if (state.wavg) {
				newSensor['windAverage'] = state.wavg
			}
			if (state.wgust) {
				newSensor['windGust'] = state.wgust
			}
			if (state.wdir) {
				newSensor['windDirection'] = state.wdir
			}
			return newSensor;
		case 'LOGGED_OUT':
			return sensorInitialState;
		default:
			return state;
	}
}

function sensors(state: State = initialState, action: Action): State {
	if (action.type === 'RECEIVED_SENSORS') {
		return action.payload.sensor.map(sensorState =>
			sensor(sensorState, action)
		);
	}
	if (action.type === 'LOGGED_OUT') {
		return {
			...initialState
		};
	}
	if (action.type === 'SENSOR_UPDATE_VALUE') {
		return state.map(sensorState => {
			if (sensorState.id === action.payload.sensorId) {
				var sensor = { ...sensorState };
				sensor.lastUpdated = parseInt(action.payload.time);
				sensor.battery = action.payload.battery;
				action.payload.data.map(sensorData => {
					if (sensorData.type == 1) {
						sensor['temperature'] = sensorData.value;
					} else if (sensorData.type == 2) {
						sensor['humidity'] = sensorData.value;
					} else if (sensorData.type == 4) {
						sensor['rainRate'] = sensorData.value;
					} else if (sensorData.type == 8) {
						sensor['rainTotal'] = sensorData.value;
					} else if (sensorData.type == 32) {
						sensor['windAverage'] = sensorData.value;
					} else if (sensorData.type == 64) {
						sensor['windGust'] = sensorData.value;
					} else if (sensorData.type == 16) {
						sensor['windDirection'] = sensorData.value;
					} else if (sensorData.type == 128) {
						sensor['uv'] = sensorData.value;
					} else if (sensorData.type == 256 && sensorData.scale == 2) {
						sensor['watt'] = sensorData.value;
					} else if (sensorData.type == 512) {
						sensor['luminance'] = sensorData.value;
					}
				});
				return sensor;
			} else {
				return sensorState;
			}
		});
	}
	return state;
}

module.exports = sensors;
