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
import orderBy from 'lodash/orderBy';

export function parseDashboardForListView(dashboard: Object = {}, devices: Object = {}, sensors: Object = {}, gateways: Object = {}, app: Object = {}): Array<Object> {
	const deviceItems = dashboard.deviceIds.map((deviceId: number): Object => {
		let device = devices.byId[deviceId];
		let { clientId } = device;
		let gateway = gateways.byId[clientId];
		let data = gateway ? { ...device, isOnline: gateway.online } : { ...device, isOnline: false };

		return {
			objectType: 'device',
			key: deviceId,
			data,
		};
	});

	const sensorItems = dashboard.sensorIds.map((sensorId: number): Object => {
		let sensor = sensors.byId[sensorId];
		let { clientId } = sensor;
		let gateway = gateways.byId[clientId];
		let data = gateway ? { ...sensor, isOnline: gateway.online } : { ...sensor, isOnline: false };

		return {
			objectType: 'sensor',
			key: sensorId,
			data,
		};
	});
	const { defaultSettings = {} } = app;
	const { sortingDB } = defaultSettings;
	let orderedList = [...deviceItems, ...sensorItems];
	if (sortingDB === 'Alphabetical') {
		orderedList = orderBy(orderedList, [(item: Object): any => {
			let { name } = item.data;
			return name ? name.toLowerCase() : null;
		}], ['asc']);
	}
	return orderedList;
}
