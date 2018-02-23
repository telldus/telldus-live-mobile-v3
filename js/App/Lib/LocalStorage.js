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
SQLite.DEBUG(true);
SQLite.enablePromise(true);


const database_name = 'tellduslocalstorage.db';
const database_version = '1.0';
const database_displayname = 'TelldusDB';
const database_size = 200000;


export default class TelldusLocalStorage {

	constructor() {
	}

	loadDatabase = () => {
		return SQLite.openDatabase(database_name, database_version, database_displayname, database_size).then((DB) => {
			return DB;
		}).catch((error) => {
			throw error;
		});
	}

	storeDeviceHistory(data: Object) {
		return this.loadDatabase().then(DB => {
			return this.createTable(DB, data);
		}).catch(error => {
		});
	}

	createTable = (tx: Object, data: Object) => {

		let insertQuery = this.prepareInserQueryDeviceHistory(data);

		return tx.sqlBatch([
			'CREATE TABLE IF NOT EXISTS Device_History( '
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
			['CREATE UNIQUE INDEX IF NOT EXISTS IndexIdXdevice ON Device_History(ts, deviceId, state, origin);'],
			['CREATE INDEX IF NOT EXISTS IndexDeviceId ON Device_History(deviceId);'],
			...insertQuery,
		  ]);
	}

	prepareInserQueryDeviceHistory(data: Object) {
		let query = [];
		for (let key in data.history) {
			let { ts = 0, state = '', stateValue = '', origin = '', successStatus = '', title = '',
				description = '', color = '', icon = '', deviceClass = '' } = data.history[key];
			origin = 'Telldus Live! mobile - Development';
			query.push(`${'REPLACE INTO Device_History '
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

	getDeviceHistory() {
		return this.loadDatabase().then(DB => {
			return this.queryDeviceHistory(DB);
		}).catch(error => {
			throw error;
		});
	}

	queryDeviceHistory = (tx: Object) => {
		return tx.executeSql('SELECT * FROM Device_History').then(([results]) => {
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

}

