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

import chunk from 'lodash/chunk';
import SQLite from 'react-native-sqlite-storage';
let isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent;
SQLite.DEBUG(isDebuggingInChrome);
SQLite.enablePromise(true);


const databaseName = 'tellduslocalstorage.db';
const databaseVersion = '1.0';
const databaseDisplayName = 'TelldusDB';
const databaseSize = 200000;
let db;
const maxSize = 200;

export default class TelldusLocalStorage {

	constructor() {
	}

	loadDatabase = (): Promise<any> => {
		return SQLite.openDatabase(databaseName, databaseVersion, databaseDisplayName, databaseSize).then((DB: Object): Object => {
			db = DB;
			return DB;
		}).catch((error: Object) => {
			throw error;
		});
	}

	storeDeviceHistory(data: Object): Promise<any> {
		return this.loadDatabase().then((DB: Object): any => {
			let { history, deviceId } = data;
			let length = history.length;
			/**
			 * In some Android devices having too many local references accumulated, without being cleared, causes
			 * app to crash. To solve that splitting the history array to chunks with maximum size of 200.
			 * Doing so the variables created in methods populateDataDeviceHistory and prepareInsertQueryDeviceHistory
			 * through looping is reduced.
			 */
			if (length > maxSize) {
				let historyChunks = chunk(history, maxSize);
				let count = 0;
				for (let i = 0; i < historyChunks.length; i++) {
					this.populateDataDeviceHistory(historyChunks[i], deviceId);
					count = i;
				}
				return count;
			}
			this.populateDataDeviceHistory(history, deviceId);
			return 0;

		}).catch((error: Object) => {
			throw error;
		});
	}

	populateDataDeviceHistory = (data: Object, deviceId: string): Promise<any> => {

		let insertQuery = this.prepareInsertQueryDeviceHistory(data, deviceId);

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

	prepareInsertQueryDeviceHistory(history: Object, deviceId: string): Array<string> {
		let query = [];
		for (let key in history) {
			let { ts = 0, state = '', stateValue = '', origin = '', successStatus = '', title = '',
				description = '', color = '', icon = '', deviceClass = '' } = history[key];

			query.push(`${'REPLACE INTO DeviceHistory '
			+ '( ts, '
			+ 'deviceId, state,'
			+ 'stateValue, origin, '
			+ 'successStatus, title, '
			+ 'description, color, '
			+ 'icon, class) '
			+ 'VALUES ('}`
			+ `${ts}, `
			+ `${deviceId}, `
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
		return this.loadDatabase().then((DB: Object): Promise<any> => {
			return this.queryDeviceHistory(id);
		}).catch((error: Object) => {
			throw error;
		});
	}

	queryDeviceHistory = (id: number): Promise<any> => {
		return db.executeSql(`SELECT * FROM DeviceHistory WHERE ${id} = deviceId ORDER BY ts DESC`).then(([results]: Array<any>): Array<any> => {
			let len = results.rows.length, data = [];
			for (let i = 0; i < len; i++) {
				let row = results.rows.item(i);
				data.push(row);
			}
			return data;
		}).catch((error: Object) => {
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
		return this.loadDatabase().then((DB: Object): Promise<any> => {
			return this.queryLatestTimestamp(tableName, id);
		}).catch((error: Object) => {
			throw error;
		});
	}

	queryLatestTimestamp = (tableName: string, id: number): Promise<any> => {
		return db.executeSql(`SELECT MAX(ts) as tsMax from ${tableName} WHERE ${id} = deviceId`).then(([results]: Array<any>): Array<any> | null => {
			if (results.rows && results.rows.item(0)) {
				return results.rows.item(0);
			}
			return null;
		}).catch((error: Object) => {
			throw error;
		});
	}

	closeDatabase = () => {
		if (db) {
			db.close();
		}
	}

}

