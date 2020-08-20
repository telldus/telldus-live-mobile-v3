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
import {
	getSensorScalesOnDb,
	SENSOR_KEY,
} from '../Lib/dashboardUtils';
import {
	MET_ID,
} from '../Lib/thirdPartyUtils';

// Dashboard actions that are shared by both Web and Mobile.
import { actions } from 'live-shared-data';
const { Dashboard } = actions;

function getSupportedDisplayTypes(data: Object = {}): Array<string> {
	return Object.keys(data);
}

const changeSensorDisplayTypeDB = (id?: number, kind?: string = SENSOR_KEY): ThunkAction => (dispatch: Function, getState: Function) => {
	const { sensors, dashboard, sensorsList, app: {defaultSettings}, user: { userId } } = getState();

	const { defaultSensorSettings } = sensorsList;

	const { dbCarousel, activeDashboardId } = defaultSettings || {};

	const {
		sensorIds = {},
		sensorsById = {},
		metWeatherById = {},
	} = dashboard;
	const userDbsAndSensorIds = sensorIds[userId] || {};
	const sensorIdsInCurrentDb = userDbsAndSensorIds[activeDashboardId] || [];

	const userDbsAndSensorsById = sensorsById[userId] || {};
	const sensorsByIdInCurrentDb = userDbsAndSensorsById[activeDashboardId] || {};

	const userDbsAndMetWeatherById = metWeatherById[userId] || {};
	const metWeatherByIdInCurrentDb = userDbsAndMetWeatherById[activeDashboardId] || {};

	if (dbCarousel) {
		sensorIdsInCurrentDb.forEach((sensorId: number) => {
			const sensor = sensors.byId[sensorId];
			const sensorInCurrentDb = sensorsByIdInCurrentDb[sensorId];
			const data = getSensorScalesOnDb(sensorInCurrentDb) || sensor.data;
			dispatch(prepareAndUpdate(sensorId, data, defaultSensorSettings));
		});
		Object.keys(metWeatherByIdInCurrentDb).forEach((key: string) => {
			const metWeather = metWeatherByIdInCurrentDb[key];
			const data = metWeather.selectedAttributes;
			dispatch(prepareAndUpdate(parseInt(key, 10), data, defaultSensorSettings));
		});
	} else if (id) {
		if (kind === MET_ID) {
			const metWeather = metWeatherByIdInCurrentDb[id];
			const data = metWeather.selectedAttributes;
			dispatch(prepareAndUpdate(id, data, defaultSensorSettings));
		} else {
			const sensor = sensors.byId[id];
			const sensorInCurrentDb = sensorsByIdInCurrentDb[id];
			const data = getSensorScalesOnDb(sensorInCurrentDb) || sensor.data;
			dispatch(prepareAndUpdate(id, data, defaultSensorSettings));
		}
	}
};

const prepareAndUpdate = (sensorId: number, sensorData: Object, defaultSensorSettings: Object): ThunkAction => (dispatch: Function, getState: Function) => {
	const supportedDisplayTypes = getSupportedDisplayTypes(sensorData);
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
};

module.exports = {
	...Dashboard,
	changeSensorDisplayTypeDB,
};
