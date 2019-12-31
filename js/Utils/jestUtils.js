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
const store = configureStore();

const messages = require('../App/Translations');

const rendererWithIntlAndRedux = (node) => {
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

export {
	rendererWithIntlAndRedux,
	DUMMY_DEVICE_433,
};
