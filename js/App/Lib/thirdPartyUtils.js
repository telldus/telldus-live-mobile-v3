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

let dayjs = require('dayjs');
let dayOfYear = require('dayjs/plugin/dayOfYear');
dayjs.extend(dayOfYear);

import i18n from '../Translations/common';

import { utils } from 'live-shared-data';
const { thirdPartyUtils } = utils;

const {
	NOW_KEY,
	TOMORROW_KEY,
	DAY_AFTER_TOMORROW_KEY,
} = thirdPartyUtils;

const getMetWeatherDataAttributes = (weatherData: Object, id: string, providerId: string, onlyAttributes?: boolean = true, {
	formatMessage,
	timeKey,
}: Object): Object => {
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

				const _time = dayjs(time);
				const _hour = _time.hour();

				const now = dayjs();
				const tom = now.add('1', 'd');

				// NOTE : Reduce dayOfYear calls as much as possible. Causes lag in iOS.
				if (!timeKey || timeKey === NOW_KEY) {
					const hour = now.hour();
					if (hour !== _hour) {
						continue;
					}
					const dayOfYearNow = now.dayOfYear();
					const _dayOfYear = _time.dayOfYear();
					const isNow = dayOfYearNow === _dayOfYear;
					if (isNow) {
						timeAndInfoListData.push({
							time,
							timeLabel: formatMessage(i18n.now),
							key: NOW_KEY,
							data: __data,
						});
					}
				}
				if (!timeKey || timeKey === NOW_KEY) {
					const hourTom = tom.hour();
					if (hourTom !== _hour) {
						continue;
					}
					const dayOfYearTom = tom.dayOfYear();
					const _dayOfYear = _time.dayOfYear();
					const isTomorrow = dayOfYearTom === _dayOfYear;
					if (isTomorrow) {
						timeAndInfoListData.push({
							time,
							timeLabel: formatMessage(i18n.tomorrow),
							key: TOMORROW_KEY,
							data: __data,
						});
					}
				}
				if (!timeKey || timeKey === NOW_KEY) {
					const dFTom = tom.add('1', 'd');
					const hourDFTom = dFTom.hour();
					if (hourDFTom !== _hour) {
						continue;
					}
					const dayOfYearDFTom = dFTom.dayOfYear();
					const _dayOfYear = _time.dayOfYear();
					const isDFTomorrow = dayOfYearDFTom === _dayOfYear;
					if (isDFTomorrow) {
						timeAndInfoListData.push({
							time,
							timeLabel: formatMessage(i18n.dAfterTomorrow),
							key: DAY_AFTER_TOMORROW_KEY,
							data: __data,
						});
					}
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
