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

import { utils } from 'live-shared-data';
const { thirdPartyUtils } = utils;

import moment from 'moment';

const getMetWeatherDataAttributes = (weatherData: Object, gatewayId: string, providerId: string, onlyAttributes?: boolean = true): Object => {
	const weatherCurrentClient = weatherData[gatewayId];
	const weatherCurrentClientProvider = weatherCurrentClient[providerId];

	let attributesListData = [], timeAndInfoListData = [];

	const { data = {} } = weatherCurrentClientProvider;
	const { properties = {} } = data;
	const { meta, timeseries } = properties;
	if (meta && timeseries) {
		for (let i = 0; i < timeseries.length; i++) {
			const { time, data: __data } = timeseries[i];
			const _moment = moment(time);
			timeAndInfoListData.push({
				time,
				data: __data,
			});
			const dayOfYear1 = _moment.dayOfYear();
			const hour1 = _moment.hour();
			const momentNow = moment();
			const dayOfYearNow = momentNow.dayOfYear();
			const hourNow = momentNow.hour();
			if (dayOfYear1 === dayOfYearNow && hour1 === hourNow) {
				if (__data.instant.details) {
					Object.keys(__data.instant.details).forEach((key: string, index: number) => {
						attributesListData.push({
							property: key,
						});
					});
				}
				if (onlyAttributes) {
					break;
				}
			}
		}
	}
	return {
		attributesListData,
		timeAndInfo: {
			meta,
			listData: timeAndInfoListData,
		},
	};
};

module.exports = {
	...thirdPartyUtils,
	getMetWeatherDataAttributes,
};
