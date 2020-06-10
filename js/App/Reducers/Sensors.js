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
import partition from 'lodash/partition';
import isEmpty from 'lodash/isEmpty';

import { hasTokenExpired } from '../Lib/LocalControl';
import Theme from '../Theme';

function prepareSectionRow(paramOne: Array<any> | Object, gateways: Array<any> | Object): Array<any> {
	let modifiedData = [];
	paramOne.map((item: Object, index: number) => {
		const { clientId, name } = item;
		if (name) {
			let gateway = gateways[clientId];
			if (gateway) {
				const { localKey, online, websocketOnline, timezone } = gateway;
				const {
					address,
					key,
					ttl,
					supportLocal,
				} = localKey || {};
				const tokenExpired = hasTokenExpired(ttl);
				const supportLocalControl = !!(address && key && ttl && !tokenExpired && supportLocal);
				modifiedData.push({
					...item,
					isOnline: online,
					websocketOnline,
					supportLocalControl,
					gatewayTimezone: timezone,
				});
			} else {
				modifiedData.push({
					...item,
					isOnline: false,
					websocketOnline: false,
					supportLocalControl: false,
				});
			}
		}
	});
	let result = groupBy(modifiedData, (items: Object): Array<any> => {
		let gateway = gateways[items.clientId];
		return gateway && gateway.id;
	});
	result = reduce(result, (acc: Array<any>, next: Object, index: number): Array<any> => {
		acc.push({
			header: index,
			data: next,
		});
		return acc;
	}, []);
	return orderBy(result, [(item: Object): any => {
		const { name = '' } = gateways[item.header] || {};
		return name.toLowerCase();
	}], ['asc']);
}

export function parseSensorsForListView(sensors: Object = {}, gateways: Object = {}): Object {
	let visibleList = [], hiddenList = [];
	let isGatwaysEmpty = isEmpty(gateways);
	let isSensorsEmpty = isEmpty(sensors);
	if (!isGatwaysEmpty && !isSensorsEmpty) {
		let orderedList = orderBy(sensors, [(sensor: Object): any => {
			let { name = '' } = sensor;
			name = typeof name !== 'string' ? '' : name;
			return name.toLowerCase();
		}], ['asc']);
		let [hidden, visible] = partition(orderedList, (sensor: Object): Object => {
			return sensor.ignored;
		});
		if (visible && visible.length > 0) {
			visibleList = prepareSectionRow(visible, gateways);
		}
		if (hidden && hidden.length > 0) {
			hiddenList = prepareSectionRow(hidden, gateways);
		}
	}
	const toggleHiddenButtonRow = {
		header: Theme.Core.buttonRowKey,
		data: [{
			buttonRow: true,
			id: Theme.Core.buttonRowKey,
		}],
	};
	visibleList.push(toggleHiddenButtonRow);
	return { visibleList, hiddenList };
}

