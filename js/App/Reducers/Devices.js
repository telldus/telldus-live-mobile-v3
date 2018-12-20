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

import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import reduce from 'lodash/reduce';
import partition from 'lodash/partition';
import isEmpty from 'lodash/isEmpty';

import { hasTokenExpired } from '../Lib/LocalControl';

function prepareSectionRow(paramOne: Array<any> | Object, gateways: Array<any> | Object): Array<any> {
	let modifiedData = paramOne.map((item: Object, index: number): Object => {
		let gateway = gateways[item.clientId];
		if (gateway) {
			const { localKey, online, websocketOnline } = gateway;
			const {
				address,
				key,
				ttl,
				supportLocal,
			} = localKey;
			const tokenExpired = hasTokenExpired(ttl);
			const supportLocalControl = !!(address && key && ttl && !tokenExpired && supportLocal);
			return { ...item, isOnline: online, websocketOnline, supportLocalControl };
		}
		return { ...item, isOnline: false, websocketOnline: false, supportLocalControl: false };
	});
	let result = groupBy(modifiedData, (items: Object): Array<any> => {
		let gateway = gateways[items.clientId];
		return gateway && gateway.name;
	});
	result = reduce(result, (acc: Array<any>, next: Object, index: number): Array<any> => {
		acc.push({
			key: index,
			data: next,
		});
		return acc;
	}, []);
	return orderBy(result, [(item: Object): any => {
		let { key = '' } = item;
		return key.toLowerCase();
	}], ['asc']);
}

export function parseDevicesForListView(devices: Object = {}, gateways: Object = {}): Object {
	let visibleList = [], hiddenList = [];
	let isGatwaysEmpty = isEmpty(gateways);
	let isDevicesEmpty = isEmpty(devices);
	if (!isGatwaysEmpty && !isDevicesEmpty) {
		let orderedList = orderBy(devices, [(device: Object): any => {
			let { name = '' } = device;
			return name.toLowerCase();
		}], ['asc']);
		let [hidden, visible] = partition(orderedList, (device: Object): Object => {
			return device.ignored;
		});
		if (visible && visible.length > 0) {
			visibleList = prepareSectionRow(visible, gateways);
		}
		if (hidden && hidden.length > 0) {
			hiddenList = prepareSectionRow(hidden, gateways);
		}
	}
	return { visibleList, hiddenList };
}
