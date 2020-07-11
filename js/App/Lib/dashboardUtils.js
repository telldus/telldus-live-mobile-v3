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

import { utils } from 'live-shared-data';
const { dashboardUtils } = utils;

const prepareSensorsDevicesForAddToDbList = (gateways: Object = {}, items: Object = {}, type: 'device' | 'sensor'): Array<Object> => {
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
		orderedList = orderedList.filter(({name}: Object): boolean => typeof name === 'string');
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
};
