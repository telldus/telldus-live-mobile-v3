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
 *
 */

// @flow

'use strict';

export default function migrations(state: Object = {}): Promise<any> {
	const { tabs, ...withOutTabs } = state;

	let newState = state;
	// Remove redux store object 'tabs' if present.
	if (tabs) {
		newState = withOutTabs;
	}

	const { App, ...withOutApp } = newState;
	// Rename redux store object 'App' to 'app'.
	if (App) {
		newState = {
			...withOutApp,
			app: App,
		};
	}

	const { app } = newState;
	if (app && !app.defaultSettings) {
		newState = {
			...newState,
			app: {
				...app,
				defaultSettings: {
					dimmerSensitivity: 5,
					sortingDB: 'Chronological',
				},
			},
		};
	}

	const { gateways, sensorsList } = newState;
	if (gateways) {
		// Insert the attribute/property 'localKey' to each gateways object if not already present.
		const newGateways = insertLocalKeyAttribute(gateways);
		newState = {
			...newState,
			gateways: newGateways,
		};
	}

	if (sensorsList && sensorsList.defaultTypeById) {
		const defaultSensorSettings = migrateToDefaultSensorSettings(sensorsList.defaultTypeById);
		newState = {
			...newState,
			sensorsList: {
				defaultSensorSettings,
			},
		};
	}

	return Promise.resolve(newState);
}


const insertLocalKeyAttribute = (gateways: Object): Object => {
	const { byId } = gateways;
	let newById = {};
	for (let key in byId) {
		let gateway = byId[key];
		if (gateway && !gateway.localKey) {
			gateway = {
				...gateway,
				localKey: {
					key: null,
					ttl: null,
					uuid: null,
					address: null,
					port: null,
					macAddress: null,
					supportLocal: false,
				},
			};
		}
		newById[key] = gateway;
	}
	return {
		...gateways,
		byId: newById,
	};
};


const migrateToDefaultSensorSettings = (defaultTypeById: Object): Object => {
	let defaultSensorSettings = {};
	for (let key in defaultTypeById) {
		defaultSensorSettings[key] = {
			displayType: defaultTypeById[key],
			displayTypeDB: null,
			historySettings: {},
		};
	}
	return defaultSensorSettings;
};
