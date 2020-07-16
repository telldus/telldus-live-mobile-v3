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

const getMetWeatherDataAttributes = (weatherData: Object, gatewayId: string, providerId: string, onlyAttributes?: boolean = true): Object => {
	const weatherCurrentClient = weatherData[gatewayId];
	const weatherCurrentClientProvider = weatherCurrentClient[providerId];

	let attributesListData = [], timeAndInfoListData = [];

	const { data = {} } = weatherCurrentClientProvider;
	const { properties = {} } = data;
	const { meta, timeseries } = properties;
	if (meta && timeseries) {
		Object.keys(meta.units).forEach((property: string) => {
			attributesListData.push({
				property,
			});
		});
		if (!onlyAttributes) {
			for (let i = 0; i < timeseries.length; i++) {
				const { time, data: __data } = timeseries[i];
				timeAndInfoListData.push({
					time,
					data: __data,
				});
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
