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
import isEmpty from 'lodash/isEmpty';

import { hasTokenExpired } from '../Lib/LocalControl';

import {
	DEVICE_KEY,
	SENSOR_KEY,
} from '../Lib/dashboardUtils';
import {
	MET_ID,
	getSupportedWeatherProviders,
} from '../Lib/thirdPartyUtils';

export function parseDashboardForListView(dashboard: Object = {}, devices: Object = {}, sensors: Object = {}, gateways: Object = {}, app: Object = {}, user: Object = {}): Array<Object> {

	const { defaultSettings } = app;
	const { activeDashboardId } = defaultSettings;

	const { userId } = user;

	const {
		sensorIds = {},
		deviceIds = {},
		dbExtras = {},
		metWeatherById = {},
	} = dashboard;

	const { byId = {} } = gateways;
	if (isEmpty(byId)) {
		return [];
	}

	const userDbsAndDeviceIds = deviceIds[userId] || {};
	const deviceIdsInCurrentDb = userDbsAndDeviceIds[activeDashboardId] || [];

	let deviceItems = [], _deviceItems = {};
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
					objectType: DEVICE_KEY,
					key: deviceId,
					data,
				});
				_deviceItems = {
					..._deviceItems,
					[`${deviceId}${DEVICE_KEY}`]: {
						objectType: DEVICE_KEY,
						key: deviceId,
						data,
					},
				};
			}
		});
	}

	const userDbsAndSensorIds = sensorIds[userId] || {};
	const sensorIdsInCurrentDb = userDbsAndSensorIds[activeDashboardId] || [];

	let sensorItems = [], _sensorItems = {};
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
					objectType: SENSOR_KEY,
					key: sensorId,
					data,
				});
				_sensorItems = {
					..._sensorItems,
					[`${sensorId}${SENSOR_KEY}`]: {
						objectType: SENSOR_KEY,
						key: sensorId,
						data,
					},
				};
			}
		});
	}

	const userDbsAndMetWeatherById = metWeatherById[userId] || {};
	const metWeatherByIdInCurrentDb = userDbsAndMetWeatherById[activeDashboardId] || {};

	let metItems = [], _metItems = {};
	const PROVIDERS = getSupportedWeatherProviders();
	Object.keys(metWeatherByIdInCurrentDb).forEach((key: string) => {
		// TODO: get data from 'thirdParties' reducer so that will get
		// latest updated information.
		const _data = metWeatherByIdInCurrentDb[key] || {};
		const {
			id,
			selectedAttributes = {},
			meta = {},
			data = {},
		} = _data;
		if (data.instant && data.instant.details) {
			const attributes = Object.keys(selectedAttributes).map((selectedAttribute: Object): Object => {
				const {
					property,
				} = selectedAttributes[selectedAttribute];
				return {
					property,
					value: data.instant.details[property],
					unit: meta.units[property],
				};
			});
			const __data = {
				id,
				name: PROVIDERS[MET_ID].provider,
				data: attributes,
				meta,
			};
			metItems.push({
				objectType: MET_ID,
				key: id,
				data: __data,
			});
			_metItems = {
				..._metItems,
				[`${id}${MET_ID}`]: {
					objectType: MET_ID,
					key: id,
					data: __data,
				},
			};
		}
	});


	const { sortingDB } = defaultSettings;
	let orderedList = [...deviceItems, ...sensorItems, ...metItems];
	if (sortingDB === 'Alphabetical') {
		return orderBy(orderedList, [(item: Object): any => {
			let { name } = item.data;
			return name ? name.toLowerCase() : null;
		}], ['asc']);
	}

	const userDbExtras = dbExtras[userId] || {};
	const { customOrder } = userDbExtras[activeDashboardId] || {};

	if (!customOrder) {
		return orderedList;
	}

	let _orderedList = [];
	customOrder.forEach(({id}: Object, index: number) => {
		const sItem = _sensorItems[`${id}${SENSOR_KEY}`];
		const dItem = _deviceItems[`${id}${DEVICE_KEY}`];
		const metItem = _metItems[`${id}${MET_ID}`];
		if (sItem) {
			_orderedList.push(sItem);
		} else if (dItem) {
			_orderedList.push(dItem);
		} else if (metItem) {
			_orderedList.push(metItem);
		}
	});
	return _orderedList;
}
