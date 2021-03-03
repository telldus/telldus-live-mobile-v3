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

import { actions } from 'live-shared-data';
const { ThirdParties } = actions;

const {
	getWeatherInfo,
} = ThirdParties;

import type { ThunkAction } from './Types';

import {
	getSupportedWeatherProviders,
	MET_ID,
	MET_WEATHER_EXPIRE_TIME,
} from '../Lib/thirdPartyUtils';

const updateAllMetWeatherDbTiles = (): ThunkAction => {
	return (dispatch: Function, getState: Function): any => {
		const {
			app,
			user,
			dashboard,
			thirdParties = {},
		} = getState();
		const { defaultSettings = {} } = app;
		const { userId } = user;
		const { metWeatherById } = dashboard;

		const { activeDashboardId } = defaultSettings;

		const userDbsAndMetWeatherById = metWeatherById[userId] || {};
		const metWeatherByIdInCurrentDb = userDbsAndMetWeatherById[activeDashboardId] || {};

		const {
			weather = {},
		} = thirdParties;

		const { url } = getSupportedWeatherProviders()[MET_ID];
		Object.keys(metWeatherByIdInCurrentDb).map((metDbId: string) => {
			const {
				latitude,
				longitude,
				timeKey,
				selectedType,
			} = metWeatherByIdInCurrentDb[metDbId];

			const currentDBIdWeatherData = weather[metDbId] || {};
			if (currentDBIdWeatherData.providerId === MET_ID || selectedType === MET_ID) {
				const ts = new Date().getTime();
				const diff = currentDBIdWeatherData.lastFetchTimestamp ? Math.floor((ts - currentDBIdWeatherData.lastFetchTimestamp) / 60000) : MET_WEATHER_EXPIRE_TIME + 1;
				if (diff > MET_WEATHER_EXPIRE_TIME || userDbsAndMetWeatherById.hasLoggedOut) {
					dispatch(getWeatherInfo(url, {
						lon: longitude,
						lat: latitude,
					}, {
						id: metDbId,
						providerId: MET_ID,
						forecastDay: timeKey,
					}));
				}
			}
		});
	};
};

module.exports = {
	...ThirdParties,
	updateAllMetWeatherDbTiles,
};
