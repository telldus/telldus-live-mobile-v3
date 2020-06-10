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
import { hasTokenExpired } from '../Lib/LocalControl';
import isEmpty from 'lodash/isEmpty';

export function parseDashboardForListView(dashboard: Object = {}, devices: Object = {}, sensors: Object = {}, gateways: Object = {}, app: Object = {}, user: Object = {}): Array<Object> {

	const { defaultSettings } = app;
	const { activeDashboardId } = defaultSettings;

	const { userId } = user;

	const { sensorIds = {}, deviceIds = {} } = dashboard;

	const userDbsAndSensorIds = sensorIds[userId] || {};
	const sensorIdsInCurrentDb = userDbsAndSensorIds[activeDashboardId] || [];

	const userDbsAndDeviceIds = deviceIds[userId] || {};
	const deviceIdsInCurrentDb = userDbsAndDeviceIds[activeDashboardId] || [];

	const { byId = {} } = gateways;
	if (isEmpty(byId)) {
		return [];
	}

	let deviceItems = [];
	if (devices && !isEmpty(devices.byId)) {
		deviceIdsInCurrentDb.map((deviceId: number) => {
			let device = devices.byId[deviceId];
			if (device) {
				let { clientId } = device;
				let gateway = gateways.byId[clientId];

				let data = {};
				if (gateway) {
					const { localKey = {}, online, websocketOnline } = gateway;
					const {
						address,
						key,
						ttl,
						supportLocal,
					} = localKey;
					const tokenExpired = hasTokenExpired(ttl);
					const supportLocalControl = !!(address && key && ttl && !tokenExpired && supportLocal);
					data = { ...device, isOnline: online, supportLocalControl, websocketOnline };
				} else {
					data = { ...device, isOnline: false, websocketOnline: false, supportLocalControl: false };
				}

				deviceItems.push({
					objectType: 'device',
					key: deviceId,
					data,
				});
			}
		});
	}

	let sensorItems = [];
	if (sensors && !isEmpty(sensors.byId)) {
		sensorIdsInCurrentDb.map((sensorId: number) => {
			let sensor = sensors.byId[sensorId] || {};
			let { clientId, name } = sensor;

			if (name) {
				let gateway = gateways.byId[clientId];

				let data = {};
				if (gateway) {
					const { localKey = {}, online, websocketOnline, timezone } = gateway;
					const {
						address,
						key,
						ttl,
						supportLocal,
					} = localKey;
					const tokenExpired = hasTokenExpired(ttl);
					const supportLocalControl = !!(address && key && ttl && !tokenExpired && supportLocal);
					data = {
						...sensor,
						isOnline: online,
						supportLocalControl,
						websocketOnline,
						gatewayTimezone: timezone,
					};
				} else {
					data = {
						...sensor,
						isOnline: false,
						websocketOnline: false,
						supportLocalControl: false,
					};
				}

				sensorItems.push({
					objectType: 'sensor',
					key: sensorId,
					data,
				});
			}
		});
	}
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
