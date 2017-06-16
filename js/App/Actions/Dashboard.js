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
 * @providesModule Actions_Dashboard
 */

// @flow

'use strict';

import type { Action, ThunkAction } from './types';

type Kind = 'device' | 'sensor';

function getSupportedDisplayTypes(item: Object): Array<string> {
	let displayTypes = [];

	if (item.humidity) {
		displayTypes.push('humidity');
	}
	if (item.luminance) {
		displayTypes.push('luminance');
	}
	if (item.rainRate || item.rainTotal) {
		displayTypes.push('rain');
	}
	if (item.temperature) {
		displayTypes.push('temperature');
	}
	if (item.uv) {
		displayTypes.push('uv');
	}
	if (item.watt) {
		displayTypes.push('watt');
	}
	if (item.windGust || item.windAverage || item.windDirection) {
		displayTypes.push('wind');
	}
	return displayTypes;
}

const addToDashboard = (kind: Kind, id: number): Action => ({
	type: 'ADD_TO_DASHBOARD',
	kind,
	id,
});

const removeFromDashboard = (kind : Kind, id: number) : Action => ({
	type: 'REMOVE_FROM_DASHBOARD',
	kind,
	id,
});

const changeSensorDisplayType = (): ThunkAction => (dispatch, getState) => {
	const { sensors, dashboard } = getState();
	const { sensorIds, sensorDisplayTypeById } = dashboard;

	sensorIds.forEach(sensorId => {
		const sensor = sensors.byId[sensorId];
		const supportedDisplayTypes = getSupportedDisplayTypes(sensor);

		const currentDisplayType = sensorDisplayTypeById[sensorId];
		const currentIndex = currentDisplayType
			? supportedDisplayTypes.indexOf(currentDisplayType)
			: 0;

		const nextIndex = currentIndex < supportedDisplayTypes.length - 1 ? currentIndex + 1 : 0;
		const nextDisplayType = supportedDisplayTypes[nextIndex];
		if (nextDisplayType !== currentDisplayType) {
			dispatch({
				type: 'CHANGE_SENSOR_DISPLAY_TYPE',
				id: sensorId,
				displayType: nextDisplayType,
			});
		}
	});
};

module.exports = {
	addToDashboard,
	removeFromDashboard,
	changeSensorDisplayType,
};
