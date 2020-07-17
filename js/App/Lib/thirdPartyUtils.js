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

import moment from 'moment';

import { utils } from 'live-shared-data';
const { thirdPartyUtils } = utils;

const {
	NOW_KEY,
	TOMORROW_KEY,
	DAY_AFTER_TOMORROW_KEY,
} = thirdPartyUtils;

const getMetWeatherDataAttributes = (weatherData: Object, id: string, providerId: string, onlyAttributes?: boolean = true, {formatMessage}: Object): Object => {
	const weatherCurrentClient = weatherData[id];

	let attributesListData = [], timeAndInfoListData = [];

	const { data = {} } = weatherCurrentClient;
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

				const _moment = moment(time);
				const _hour = _moment.hour();
				const _dayOfYear = _moment.dayOfYear();

				const now = moment();
				const hour = now.hour();
				const dayOfYear = now.dayOfYear();

				const tom = now.add('1', 'd');
				const hourTom = tom.hour();
				const dayOfYearTom = tom.dayOfYear();

				const dFTom = tom.add('1', 'd');
				const hourDFTom = dFTom.hour();
				const dayOfYearDFTom = dFTom.dayOfYear();

				const isNow = dayOfYear === _dayOfYear && hour === _hour;
				const isTomorrow = dayOfYearTom === _dayOfYear && hourTom === _hour;
				const isDFTomorrow = dayOfYearDFTom === _dayOfYear && hourDFTom === _hour;

				if (isNow) {
					timeAndInfoListData.push({
						time,
						timeLabel: 'Now', // TODO: Translate
						key: NOW_KEY,
						data: __data,
					});
				} else if (isTomorrow) {
					timeAndInfoListData.push({
						time,
						timeLabel: 'Tomorrow', // TODO: Translate
						key: TOMORROW_KEY,
						data: __data,
					});
				} else if (isDFTomorrow) {
					timeAndInfoListData.push({
						time,
						timeLabel: 'Day after tomorrow', // TODO: Translate
						key: DAY_AFTER_TOMORROW_KEY,
						data: __data,
					});
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
