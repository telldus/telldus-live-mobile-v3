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
			if (state.rainRate) {
				newSensor['rainRate'] = state.rainRate
			}
			if (state.rainTotal) {
				newSensor['rainTotal'] = state.rainTotal
			}
			if (state.uv) {
				newSensor['uv'] = state.uv
			}
			if (state.watt) {
				newSensor['watt'] = state.watt
			}
			if (state.luminance) {
				newSensor['luminance'] = state.luminance
			}
			if (state.windAvg) {
				newSensor['windAverage'] = state.windAvg
			}
			if (state.windGust) {
				newSensor['windGust'] = state.windGust
			}
			if (state.windDir) {
				newSensor['windDirection'] = state.windDir
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
	return state;
}

module.exports = sensors;
