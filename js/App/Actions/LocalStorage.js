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

import TelldusLocalStorage from '../Lib/LocalStorage';
import type {
	DeviceHistoryQueryParams,
	SensorHistoryQueryParams,
} from '../Lib/LocalStorage';


export function storeHistory(type: string, data: Object): Promise<any> | any {
	let localStorage = new TelldusLocalStorage();
	if (type === 'device') {
		return localStorage.storeDeviceHistory(data);
	}
	if (type === 'sensor') {
		return localStorage.storeSensorHistory(data);
	}
}
// $FlowFixMe
export function getHistory(type: string, queryParam: DeviceHistoryQueryParams | SensorHistoryQueryParams): Promise<any> | any {
	let localStorage = new TelldusLocalStorage();
	if (type === 'device') {
		// $FlowFixMe
		return localStorage.getDeviceHistory(queryParam);
	}
	if (type === 'sensor') {
		// $FlowFixMe
		return localStorage.getSensorHistory(queryParam);
	}
}

export function getSensorTypes(id: number, formatMessage: Function): Promise<any> {
	let localStorage = new TelldusLocalStorage();
	return localStorage.getSensorTypes(id, formatMessage);
}

export function getLatestTimestamp(type: string, id: number): Promise<any> {
	let localStorage = new TelldusLocalStorage();
	return localStorage.getLatestTimestamp(type, id);
}

export function clearHistory(type: string, id: number): Promise<any> {
	let localStorage = new TelldusLocalStorage();
	return localStorage.clearHistory(type, id);
}

export function closeDatabase() {
	let localStorage = new TelldusLocalStorage();
	localStorage.closeDatabase();
}

export function storeGeoFenceEvent(data: Object): Promise<any> | any {
	let localStorage = new TelldusLocalStorage();
	return localStorage.storeGeoFenceEvent(data);
}

export function getGeoFenceEvents(): Promise<any> | any {
	let localStorage = new TelldusLocalStorage();
	return localStorage.queryGeoFenceEvents();
}

export function clearGeoFenceEvents(): Promise<any> | any {
	let localStorage = new TelldusLocalStorage();
	return localStorage.dropTableGeoFenceEvents();
}

