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

import React from 'react';
jest.mock('react-dom');
import renderer from 'react-test-renderer';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';

import { configureStore } from '../App/Store/ConfigureStore';
const store = configureStore().store;
import {
	setAppLayout,
	deviceInfoSuccess,
} from '../App/Actions';

const messages = require('../App/Translations');

const rendererWithIntlAndReduxProviders = (node) => {
	return renderer.create(
		<Provider store={store}>
			<IntlProvider locale="en" messages={messages}>
				{node}
			</IntlProvider>
		</Provider>);
};

const DUMMY_DEVICE_433 = {
	'id': '5928354',
	'clientDeviceId': '630',
	'name': '32e',
	'state': 2,
	'statevalue': null,
	'stateValues': [],
	'methods': 35,
	'metadataHash': 'bf21a9e8fbc5a3846fb05b4fa0859e0917b2202f',
	'parametersHash': 'beeb00208f9b7bc435f8434a084f489323b0cc21',
	'type': 'device',
	'client': '422192',
	'clientName': 'Three',
	'online': '1',
	'editable': 1,
	'ignored': 0,
	'transport': '433',
	'protocol': 'arctech', // Do not change
	'model': 'selflearning-switch:telldus-remote', // Do not change
	'parameter': [
		{
			'name': 'devicetype',
			'value': '0000000C-0001-1000-2005-ACCA54000000',
		},
		{
			'name': 'house',
			'value': 12,
		},
		{
			'name': 'unit',
			'value': 4,
		},
	],
};

const DEVICE_MANU_INFO_433 = {
	'model': 'selflearning-switch:telldus-remote',
	'protocol': 'arctech',
	'widget': '8',
	'image': 'proove_remote',
	'configuration': 'false',
	'postConfig': 'proove-sending-remote',
	'scannable': 'true',
	'type': 'tx',
	'devicetype': '0000000c-0001-1000-2005-acca54000000',
	'lang': [
		{
			'lang': 'en',
			'modelName': 'Remote Control',
		},
		{
			'lang': 'sv',
			'modelName': 'Fjärrkontroll',
		},
	],
	'modelName': 'Remote Control',
};

const DUMMY_CLIENT = {
	'id': '422192',
	'uuid': '88669026-4417-4a34-9a0b-666355a763ee',
	'name': 'Three',
	'online': '1',
	'editable': 1,
	'extensions': 3,
	'version': '1.2.0',
	'type': 'TellStick ZNet Lite v2',
	'ip': '43.229.90.244',
	'longitude': 13.19321,
	'latitude': 55.70584,
	'sunrise': 1578036960,
	'sunset': 1578062820,
	'timezone': 'Asia\/Kolkata',
	'tzoffset': 19800,
	'transports': 'zwave,433,group',
};

const setAppLayoutInStore = () => {
	store.dispatch(setAppLayout({
		height: 313,
		width: 750,
	}));
};

const NAVIGATION_PROP = {
};

const setDeviceListInStore = () => {
	const devices = {
		device: [
			DUMMY_DEVICE_433,
		],
	};
	store.dispatch({
		type: 'RECEIVED_DEVICES',
		payload: {
			...devices,
		},
	});
};

const setGatewaysListInStore = () => {
	const clients = {
		client: [
			DUMMY_CLIENT,
		],
	};
	store.dispatch({
		type: 'RECEIVED_GATEWAYS',
		payload: {
			...clients,
		},
	});
};

const setDeviceInfoInStore = () => {
	deviceInfoSuccess(DUMMY_DEVICE_433);
};

const getStore = () => {
	return store;
};

export {
	rendererWithIntlAndReduxProviders,
	DUMMY_DEVICE_433,
	setAppLayoutInStore,
	NAVIGATION_PROP,
	DEVICE_MANU_INFO_433,
	DUMMY_CLIENT,
	setDeviceListInStore,
	setGatewaysListInStore,
	setDeviceInfoInStore,
	getStore,
};
