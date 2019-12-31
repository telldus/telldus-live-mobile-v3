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
 * Telldus Live! app is distributed in the hope this it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Telldus Live! app.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


import React from 'react';
import {
	Dimensions,
} from 'react-native';
import * as redux from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as intl from 'react-intl';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

import { rendererWithIntl } from '../../../../../Utils/jestUtils';

import DeviceSettings from '../DeviceSettings';
import {
	getDeviceSettings,
} from '../../../../Lib';

let {height, width} = Dimensions.get('window');

const store = mockStore();

const deviceId = 101, widgetId = 1;

const spy = jest.spyOn(redux, 'useSelector');

const spyDispatch = jest.spyOn(redux, 'useDispatch');
spyDispatch.mockReturnValue(store.dispatch);

const spyUseIntl = jest.spyOn(intl, 'useIntl');
spyUseIntl.mockImplementation(() => {
	return {
		formatMessage: jest.fn(() => ''),
	};
});

const setting = getDeviceSettings(widgetId, () => '');

describe('<DeviceSettings /> - snapshot', () => {

	it('renders DeviceSettings for widget 10, without initializeValueFromStore', () => {
		spy.mockReturnValue(
			{
				layout: {
					height,
					width,
				},
				addDevice433: {
					widgetParams433Device: {},
				},
			}
		);

		const component = rendererWithIntl(
			<DeviceSettings
				settings={setting}/>
		);

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it('renders DeviceSettings for widget 10, with initializeValueFromStore', () => {

		spy.mockReturnValue(
			{
				layout: {
					height,
					width,
				},
				addDevice433: {
					widgetParams433Device: {},
				},
				parameter: [
					{
						name: 'house',
						value: 12,
					},
					{
						name: 'unit',
						value: 4,
					},
				],
			}
		);

		const component = rendererWithIntl(
			<DeviceSettings
				settings={setting}
				deviceId={deviceId}
				widgetId={widgetId}
				initializeValueFromStore/>
		);

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});
});

