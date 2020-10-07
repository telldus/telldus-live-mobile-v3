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

import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import reduce from 'lodash/reduce';
import isEmpty from 'lodash/isEmpty';
let dayjs = require('dayjs');

import {
	MET_ID,
	getSupportedWeatherProviders,
} from './thirdPartyUtils';

import { utils } from 'live-shared-data';
const { dashboardUtils } = utils;


const prepareWeather = (weatherData: Object = {}, gateways: Object = {}): Array<Object> => {
	const weatherDataKeys = Object.keys(weatherData);
	let listData = [];
	const PROVIDERS = getSupportedWeatherProviders();
	weatherDataKeys.forEach((wKey: string) => {
		const weatherProviders = weatherData[wKey];
		let _data = [];
		const weatherProvidersKeys = Object.keys(weatherProviders);
		weatherProvidersKeys.forEach((wPKey: string) => {
			const PROVIDER = PROVIDERS[wPKey];
			if (PROVIDER) {
				if (MET_ID === wPKey) {
					const { data = {} } = weatherProviders[wPKey];
					const { properties = {} } = data;
					const { meta, timeseries } = properties;
					if (meta && timeseries) {
						for (let i = 0; i < timeseries.length; i++) {
							const { time, data: __data } = timeseries[i];
							const _moment = dayjs(time);
							const dayOfYear1 = _moment.dayOfYear();
							const hour1 = _moment.hour();
							const momentNow = dayjs();
							const dayOfYearNow = momentNow.dayOfYear();
							const hourNow = momentNow.hour();
							if (dayOfYear1 === dayOfYearNow && hour1 === hourNow) {
								if (__data.instant.details) {
									Object.keys(__data.instant.details).forEach((key: string, index: number) => {
										_data = [
											..._data,
											{
												id: `${wKey}${wPKey}${key}`,
												name: key,
											},
										];
									});
								}
								break;
							}
						}
					}
				}
			}
		});
		listData.push({
			header: wKey,
			data: _data,
		});
	});
	return listData;
};

const prepareSensorsDevicesForAddToDbList = (gateways: Object = {}, items: Object = {}, type: 'device' | 'sensor', {
	sensorIdsInCurrentDb,
	deviceIdsInCurrentDb,
}: Object): Array<Object> => {
	let isGatwaysEmpty = isEmpty(gateways);
	if (isGatwaysEmpty) {
		return [];
	}

	let orderedList = orderBy(items, [(item: Object): any => {
		let { name = '' } = item;
		name = typeof name !== 'string' ? '' : name;
		return name.toLowerCase();
	}], ['asc']);
	if (type === 'sensor') {
		orderedList = orderedList.filter(({name, id}: Object): boolean => {
			return (typeof name === 'string') && sensorIdsInCurrentDb.indexOf(id) === -1;
		});
	} else if (type === 'device') {
		orderedList = orderedList.filter(({name, id}: Object): boolean => {
			return deviceIdsInCurrentDb.indexOf(id) === -1;
		});
	}

	let result = groupBy(orderedList, (item: Object): Array<any> => {
		let gateway = gateways[item.clientId];
		return gateway && gateway.id;
	});
	result = reduce(result, (acc: Array<any>, next: Array<Object>, index: number): Array<any> => {
		acc.push({
			data: next,
			header: index,
		});
		return acc;
	}, []);

	return orderBy(result, [(item: Object): any => {
		const { name = '' } = gateways[item.header] || {};
		return name.toLowerCase();
	}], ['asc']);
};

module.exports = {
	...dashboardUtils,
	prepareSensorsDevicesForAddToDbList,
	prepareWeather,
};
