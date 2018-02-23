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

	constructor(data: Object) {
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
		// tx.executeSql('DROP TABLE IF EXISTS Device_History;');

		let insertQuery = this.prepareInserQueryDeviceHistory(data);

		return tx.sqlBatch([
			'CREATE TABLE IF NOT EXISTS Device_History( '
			+ 'ts INTEGER, '
			+ 'deviceId INTEGER, '
			+ 'state INTEGER, '
			+ 'stateValue INTEGER, '
			+ 'origin VARCHAR(150), '
			+ 'successStatus INTEGER, '
			+ 'batteryLow VARCHAR(50), '
			+ 'tamper VARCHAR(50), '
			+ 'alarms VARCHAR(50), '
			+ 'thermostatModeChanges VARCHAR(50), '
			+ 'thermostatSetPointChanges VARCHAR(50), '
			+ 'wakeup VARCHAR(50), '
			+ 'title VARCHAR(50), '
			+ 'description VARCHAR(150), '
			+ 'color VARCHAR(50), '
			+ 'icon VARCHAR(50), '
			+ 'class VARCHAR(50),'
			+ 'PRIMARY KEY (ts, deviceId, state, origin)); ',
			...insertQuery,
		  ]);
	}

	prepareInserQueryDeviceHistory(data: Object) {
		let query = [];
		for (let key in data.history) {
			let { ts = 0, state = '', stateValue = '', origin = '', successStatus = '',
				batteryLow = '', tamper = '', alarms = '', thermostatModeChanges = '',
				thermostatSetPointChanges = '', wakeup = '', title = '',
				description = '', color = '', icon = '' } = data.history[key];
			let deviceClass = data.history[key] && data.history[key].class ? data.history[key].class : '';
			origin = 'Telldus Live! mobile - Development';
			query.push(`${'REPLACE INTO Device_History '
			+ '(ts, deviceId, state, stateValue, origin, successStatus, batteryLow, tamper, '
			+ 'alarms, thermostatModeChanges, thermostatSetPointChanges, wakeup, title, description, color, icon, class) '
			+ 'VALUES ('}`
			+ `${ts}, `
			+ `${data.deviceId}, `
			+ `${state}, `
			+ `${stateValue}, `
			+ `"${origin}"` + ', '
			+ `${successStatus}, `
			+ `"${batteryLow}"` + ', '
			+ `"${tamper}"` + ', '
			+ `"${alarms}"` + ', '
			+ `"${thermostatModeChanges}"` + ', '
			+ `"${thermostatSetPointChanges}"` + ', '
			+ `"${wakeup}"` + ', '
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

