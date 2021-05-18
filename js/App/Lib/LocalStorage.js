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

import { getSensorInfo } from './SensorUtils';

const databaseName = 'tellduslocalstorage.db';
const databaseVersion = '1.1';
const databaseDisplayName = 'TelldusDB';
const databaseSize = 200000;
let db;
const maxSize = 200;

export type SensorHistoryQueryParams = {
	id: number,
	type: string,
	scale: string,
	from: string,
	to: string,
};

export type DeviceHistoryQueryParams = number;

export default class TelldusLocalStorage {

	constructor() {
		// TODO: See if db version can be detected.
		this.performUpdateActions();
	}

	performUpdateActions: Function = async () => {
		await this.dropOldDeviceHistoryTable();
	}

	dropOldDeviceHistoryTable: Function = (): Promise<any> => {
		return this.loadDatabase().then((DB: Object): any => {
			return db.executeSql('DROP TABLE IF EXISTS DeviceHistory');
		}).catch((error: Object) => {
		});
	}

	loadDatabase: Function = (): Promise<any> => {
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

	populateDataDeviceHistory: Function = (data: Object, deviceId: string): Promise<any> => {

		let insertQuery = this.prepareInsertQueryDeviceHistory(data, deviceId);

		return db.sqlBatch([
			'CREATE TABLE IF NOT EXISTS DeviceHistory1_1( '
			+ 'id INTEGER PRIMARY KEY AUTOINCREMENT, '
			+ 'ts INTEGER, '
			+ 'deviceId INTEGER, '
			+ 'state INTEGER, '
			+ 'stateValue VARCHAR(350), '
			+ 'origin VARCHAR(150), '
			+ 'successStatus INTEGER, '
			+ 'title VARCHAR(50), '
			+ 'description VARCHAR(150), '
			+ 'color VARCHAR(50), '
			+ 'icon VARCHAR(50), '
			+ 'class VARCHAR(50)'
			+ '); ',
			['CREATE UNIQUE INDEX IF NOT EXISTS IndexIdXdevice ON DeviceHistory1_1(ts, deviceId, state, origin);'],
			['CREATE INDEX IF NOT EXISTS IndexDeviceId ON DeviceHistory1_1(deviceId);'],
			...insertQuery,
		  ]);
	}

	prepareInsertQueryDeviceHistory(history: Object, deviceId: string): Array<string> {
		let query = [];
		for (let key in history) {
			let { ts = 0, state = '', stateValue = '', origin = '', successStatus = '', title = '',
				description = '', color = '', icon = '', deviceClass = '' } = history[key];

			stateValue = stateValue.toString();
			stateValue = stateValue.replace(/"/g, '\'').replace(/ /g, '').trim();

			query.push(`${'REPLACE INTO DeviceHistory1_1 '
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
			+ `"${stateValue}", `
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

	getDeviceHistory(id: DeviceHistoryQueryParams): Promise<any> {
		return this.loadDatabase().then((DB: Object): Promise<any> => {
			return this.queryDeviceHistory(id);
		}).catch((error: Object) => {
			throw error;
		});
	}

	queryDeviceHistory: Function = (id: number): Promise<any> => {
		return db.executeSql(`SELECT * FROM DeviceHistory1_1 WHERE ${id} = deviceId ORDER BY ts DESC`).then(([results]: Array<any>): Array<any> => {
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

	// SENSOR

	storeSensorHistory(data: Object): Promise<any> {
		return this.loadDatabase().then((DB: Object): any => {
			let { history, sensorId } = data;
			let length = history.length;
			/**
			 * In some Android devices having too many local references accumulated, without being cleared, causes
			 * app to crash. To solve that splitting the history array to chunks with maximum size of 200.
			 * Doing so the variables created in methods populateDataSensorHistory and prepareInsertQuerySensorHistory
			 * through looping is reduced.
			 */
			if (length > maxSize) {
				let historyChunks = chunk(history, maxSize);
				let count = 0;
				for (let i = 0; i < historyChunks.length; i++) {
					this.populateDataSensorHistory(historyChunks[i], sensorId);
					count = i;
				}
				return count;
			}
			this.populateDataSensorHistory(history, sensorId);
			return 0;

		}).catch((error: Object) => {
			throw error;
		});
	}

	populateDataSensorHistory: Function = (data: Object, sensorId: string): Promise<any> => {

		let insertQuery = this.prepareInsertQuerySensorHistory(data, sensorId);
		return db.sqlBatch([
			'CREATE TABLE IF NOT EXISTS SensorHistory( '
			+ 'id INTEGER PRIMARY KEY AUTOINCREMENT, '
			+ 'ts INTEGER, '
			+ 'sensorId INTEGER, '
			+ 'type VARCHAR(150), '
			+ 'value REAL, '
			+ 'scale VARCHAR(50)'
			+ '); ',
			['CREATE UNIQUE INDEX IF NOT EXISTS IndexIdXSensor ON SensorHistory(ts, sensorId, type, scale);'],
			['CREATE INDEX IF NOT EXISTS IndexSensorId ON SensorHistory(sensorId);'],
			...insertQuery,
		  ]);
	}

	prepareInsertQuerySensorHistory(history: Object, sensorId: string): Array<string> {
		let query = [];
		for (let key in history) {
			let { ts = 0, data = [] } = history[key];
			data.map((item: Object, index: number) => {
				let { name, value, scale } = item;

				query.push(`${'REPLACE INTO SensorHistory '
					+ '( ts, '
					+ 'sensorId,'
					+ 'type, '
					+ 'value, '
					+ 'scale) '
					+ 'VALUES ('}`
					+ `${ts}, `
					+ `${sensorId}, `
					+ `"${name}", `
					+ `${value}, `
					+ `"${scale}"`
					+ ')');

			});
		}
		return query;
	}

	getSensorHistory(queryParams: SensorHistoryQueryParams): Promise<any> {
		return this.loadDatabase().then((DB: Object): Promise<any> => {
			return this.querySensorHistory(queryParams);
		}).catch((error: Object) => {
			throw error;
		});
	}

	querySensorHistory: Function = ({ id, type, scale, from, to }: SensorHistoryQueryParams): Promise<any> => {
		return db.executeSql(`SELECT ts, value FROM SensorHistory WHERE ${id} = sensorId AND "${type}" = type`
		+ ` AND "${scale}" = scale AND ts >= ${from} AND ts <= ${to} ORDER BY ts DESC`).then(([results]: Array<any>): Array<any> => {
			let len = results.rows.length, data = [];
			for (let i = 0; i < len; i++) {
				let { value, ts } = results.rows.item(i);
				let row = { ts, value: parseFloat(value) };
				data.push(row);
			}
			return data;
		}).catch((error: Object) => {
			throw error;
		});
	}

	getSensorTypes: Function = (id: number, formatMessage: Function): Promise<any> => {
		return this.loadDatabase().then((DB: Object): Promise<any> => {
			return this.querySensorTypes(id, formatMessage);
		}).catch((error: Object) => {
			throw error;
		});
	}

	// 'formatMessage' is passed in this manner and data 'row' is manipulated this manner to avoid
	// an extra iteration over the data again after query.
	querySensorTypes: Function = (id: number, formatMessage?: Function): Promise<any> => {
		return db.executeSql(`SELECT DISTINCT type, scale FROM SensorHistory WHERE ${id} = sensorId`).then(([results]: Array<any>): Array<any> => {
			let len = results.rows.length, data = [];
			for (let i = 0; i < len; i++) {
				const { type, scale } = results.rows.item(i);
				if (type !== 'wdir') {// excluding wind direction sensor
					const { label, unit, icon } = getSensorInfo(type, scale, 0, false, formatMessage);
					const postFix = unit ? ` (${unit})` : '';
					let row = { type, scale, value: `${label}${postFix}`, icon};
					data.push(row);
				}
			}
			return data;
		}).catch((error: Object) => {
			throw error;
		});
	}


	// COMMON
	getLatestTimestamp: Function = (type: string, id: number): Promise<any> => {
		let tableName = '', uniqueParam = '';
		if (type === 'device') {
			tableName = 'DeviceHistory1_1';
			uniqueParam = 'deviceId';
		} else if (type === 'sensor') {
			tableName = 'SensorHistory';
			uniqueParam = 'sensorId';
		}
		return this.loadDatabase().then((DB: Object): Promise<any> => {
			return this.queryLatestTimestamp(tableName, uniqueParam, id);
		}).catch((error: Object) => {
			throw error;
		});
	}

	queryLatestTimestamp: Function = (tableName: string, uniqueParam: string, id: number): Promise<any> => {
		return db.executeSql(`SELECT MAX(ts) as tsMax from ${tableName} WHERE ${id} = ${uniqueParam}`).then(([results]: Array<any>): Array<any> | null => {
			if (results.rows && results.rows.item(0)) {
				return results.rows.item(0);
			}
			return null;
		}).catch((error: Object) => {
			throw error;
		});
	}

	clearHistory(type: string, id: number): Promise<any> {
		let tableName = '', uniqueParam = '';
		if (type === 'device') {
			tableName = 'DeviceHistory1_1';
			uniqueParam = 'deviceId';
		} else if (type === 'sensor') {
			tableName = 'SensorHistory';
			uniqueParam = 'sensorId';
		}

		return this.loadDatabase().then((DB: Object): Promise<any> => {
			return db.executeSql(`DELETE from ${tableName} WHERE ${uniqueParam} = ${id}`).then((res: any): any => {
				return res;
			}).catch((error: Object) => {
				throw error;
			});
		}).catch((error: Object) => {
			throw error;
		});
	}

	storeGeoFenceEvent(data: Object): Promise<any> {
		return this.loadDatabase().then((DB: Object): any => {
			const {
				action,
				extras = {},
				identifier,
				inAppTime,
				location = {},
			} = data;

			const {
				timestamp,
			} = location;

			const {
				title,
			} = extras;

			const insertQuery = `${'REPLACE INTO GeoFenceEvents '
			+ '( identifier, '
			+ 'action,'
			+ 'title, '
			+ 'timestamp, '
			+ 'inAppTime) '
			+ 'VALUES ('}`
			+ `"${identifier}", `
			+ `"${action}", `
			+ `"${title}", `
			+ `"${timestamp}", `
			+ `"${inAppTime}")`;

			return db.sqlBatch([
				'CREATE TABLE IF NOT EXISTS GeoFenceEvents( '
				+ 'id INTEGER PRIMARY KEY AUTOINCREMENT, '
				+ 'identifier VARCHAR(100), '
				+ 'action VARCHAR(30), '
				+ 'title VARCHAR(150), '
				+ 'timestamp VARCHAR(50), '
				+ 'inAppTime VARCHAR(50)'
				+ '); ',
				['CREATE UNIQUE INDEX IF NOT EXISTS UIndexIdentifier ON GeoFenceEvents(identifier, timestamp, inAppTime);'],
				['CREATE INDEX IF NOT EXISTS IndexIdentifier ON GeoFenceEvents(identifier);'],
				insertQuery,
			  ]);
		}).catch((error: Object) => {
			throw error;
		});
	}

	queryGeoFenceEvents: Function = (): Promise<any> => {
		return this.loadDatabase().then((DB: Object): Promise<any> => {
			return db.executeSql('SELECT * FROM GeoFenceEvents ORDER BY inAppTime DESC').then(([results]: Array<any>): Array<any> => {
				let len = results.rows.length, data = [];
				for (let i = 0; i < len; i++) {
					let row = results.rows.item(i);
					data.push(row);
				}
				return data;
			}).catch((error: Object) => {
				throw error;
			});
		}).catch((error: Object) => {
			throw error;
		});
	}

	dropTableGeoFenceEvents: Function = (): Promise<any> => {
		return this.loadDatabase().then((DB: Object): any => {
			return db.executeSql('DROP TABLE IF EXISTS GeoFenceEvents');
		}).catch((error: Object) => {
		});
	}

	closeDatabase: Function = () => {
		if (db) {
			db.close();
		}
	}

}

