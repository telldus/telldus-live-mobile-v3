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

import SQLite from 'react-native-sqlite-storage';
let isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent;
SQLite.DEBUG(isDebuggingInChrome);
SQLite.enablePromise(true);


const databaseName = 'tellduslocalstorage.db';
const databaseVersion = '1.0';
const databaseDisplayName = 'TelldusDB';
const databaseSize = 200000;
let db;


export default class TelldusLocalStorage {

	constructor() {
	}

	loadDatabase = (): Promise<any> => {
		return SQLite.openDatabase(databaseName, databaseVersion, databaseDisplayName, databaseSize).then((DB) => {
			db = DB;
			return DB;
		}).catch((error) => {
			throw error;
		});
	}

	storeDeviceHistory(data: Object): Promise<any> {
		return this.loadDatabase().then(DB => {
			return this.createTable(data);
		}).catch(error => {
			throw error;
		});
	}

	createTable = (data: Object): Promise<any> => {

		let insertQuery = this.prepareInserQueryDeviceHistory(data);

		return db.sqlBatch([
			'CREATE TABLE IF NOT EXISTS DeviceHistory( '
			+ 'id INTEGER PRIMARY KEY AUTOINCREMENT, '
			+ 'ts INTEGER, '
			+ 'deviceId INTEGER, '
			+ 'state INTEGER, '
			+ 'stateValue INTEGER, '
			+ 'origin VARCHAR(150), '
			+ 'successStatus INTEGER, '
			+ 'title VARCHAR(50), '
			+ 'description VARCHAR(150), '
			+ 'color VARCHAR(50), '
			+ 'icon VARCHAR(50), '
			+ 'class VARCHAR(50)'
			+ '); ',
			['CREATE UNIQUE INDEX IF NOT EXISTS IndexIdXdevice ON DeviceHistory(ts, deviceId, state, origin);'],
			['CREATE INDEX IF NOT EXISTS IndexDeviceId ON DeviceHistory(deviceId);'],
			...insertQuery,
		  ]);
	}

	prepareInserQueryDeviceHistory(data: Object): Array<string> {
		let query = [];
		for (let key in data.history) {
			let { ts = 0, state = '', stateValue = '', origin = '', successStatus = '', title = '',
				description = '', color = '', icon = '', deviceClass = '' } = data.history[key];

			query.push(`${'REPLACE INTO DeviceHistory '
			+ '( ts, '
			+ 'deviceId, state,'
			+ 'stateValue, origin, '
			+ 'successStatus, title, '
			+ 'description, color, '
			+ 'icon, class) '
			+ 'VALUES ('}`
			+ `${ts}, `
			+ `${data.deviceId}, `
			+ `${state}, `
			+ `${stateValue}, `
			+ `"${origin}"` + ', '
			+ `${successStatus}, `
			+ `"${title}"` + ', '
			+ `"${description}"` + ', '
			+ `"${color}"` + ', '
			+ `"${icon}"` + ', '
			+ `"${deviceClass}"` + ')');
		}
		return query;
	}

	getDeviceHistory(id: number): Promise<any> {
		return this.loadDatabase().then(DB => {
			return this.queryDeviceHistory(id);
		}).catch(error => {
			throw error;
		});
	}

	queryDeviceHistory = (id: number): Promise<any> => {
		return db.executeSql(`SELECT * FROM DeviceHistory WHERE ${id} = deviceId ORDER BY ts DESC`).then(([results]) => {
			let len = results.rows.length, data = [];
			for (let i = 0; i < len; i++) {
				let row = results.rows.item(i);
				data.push(row);
			}
			return data;
		}).catch((error) => {
			throw error;
		});
	}

	getLatestTimestamp = (type: string, id: number): Promise<any> => {
		let tableName;
		if (type === 'device') {
			tableName = 'DeviceHistory';
		} else if (type === 'sensor') {
			tableName = 'SensorHistory';
		}
		return this.loadDatabase().then(DB => {
			return this.queryLatestTimestamp(tableName, id);
		}).catch(error => {
			throw error;
		});
	}

	queryLatestTimestamp = (tableName: string, id: number): Promise<any> => {
		return db.executeSql(`SELECT MAX(ts) as tsMax from ${tableName} WHERE ${id} = deviceId`).then(([results]) => {
			if (results.rows && results.rows.item(0)) {
				return results.rows.item(0);
			}
			return null;
		}).catch(error => {
			throw error;
		});
	}

	closeDatabase = () => {
		if (db) {
			db.close();
		}
	}

}

