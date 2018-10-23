
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

export type State = ?Object;

const defaultSensorSettings = (state: Object = {}, action: Object): State => {
	if (action.type === 'persist/REHYDRATE') {
		if (action.payload && action.payload.sensorsList && action.payload.sensorsList.defaultSensorSettings) {
			console.log('rehydrating sensorsList.defaultSensorSettings');
			return {
				...state,
				...action.payload.sensorsList.defaultSensorSettings,
			};
		}
		return state;
	}
	if (action.type === 'CHANGE_SENSOR_DEFAULT_DISPLAY_TYPE') {
		const { id, displayType } = action;
		const allSettings = state[id] ? state[id] : {};

		return {
			...state,
			[id]: {
				...allSettings,
				displayType,
			},
		};
	}
	if (action.type === 'CHANGE_SENSOR_DEFAULT_DISPLAY_TYPE_DB') {
		const { id, displayTypeDB } = action;
		const allSettings = state[id] ? state[id] : {};
		return {
			...state,
			[id]: {
				...allSettings,
				displayTypeDB,
			},
		};
	}
	if (action.type === 'CHANGE_SENSOR_DEFAULT_HISTORY_SETTINGS') {
		const { id, historySettings: newSettings } = action;
		let { historySettings, ...others } = state[id] ? state[id] : {};
		historySettings = { ...historySettings, ...newSettings };

		return {
			...state,
			[id]: {
				...others,
				historySettings,
			},
		};
	}
	return state;
};

export default combineReducers({
	defaultSensorSettings,
});

