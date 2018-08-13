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
 */

// @flow

'use strict';
import type { ThunkAction } from './Types';

// Dashboard actions that are shared by both Web and Mobile.
import { actions } from 'live-shared-data';
const { Dashboard } = actions;

function getSupportedDisplayTypes(data: Object): Array<string> {
	return Object.keys(data);
}

const changeSensorDisplayTypeDB = (): ThunkAction => (dispatch: Function, getState: Function) => {
	const { sensors, dashboard, sensorsList } = getState();
	const { sensorIds } = dashboard;
	const { defaultSensorSettings } = sensorsList;

	sensorIds.forEach((sensorId: number) => {
		const sensor = sensors.byId[sensorId];
		const supportedDisplayTypes = getSupportedDisplayTypes(sensor.data);
		const { displayTypeDB = supportedDisplayTypes[0] } = defaultSensorSettings[sensorId] ? defaultSensorSettings[sensorId] : {};

		const max = supportedDisplayTypes.length;
		const currentTypeIndex = supportedDisplayTypes.indexOf(displayTypeDB);
		const nextTypeIndex = currentTypeIndex + 1;
		const nextType = nextTypeIndex > (max - 1) ? supportedDisplayTypes[0] : supportedDisplayTypes[nextTypeIndex];
		if (displayTypeDB !== nextType) {
			dispatch({
				type: 'CHANGE_SENSOR_DEFAULT_DISPLAY_TYPE_DB',
				id: sensorId,
				displayTypeDB: nextType,
			});
		}
	});
};

module.exports = {
	...Dashboard,
	changeSensorDisplayTypeDB,
};
