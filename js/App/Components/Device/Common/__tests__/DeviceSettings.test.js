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
import { configureStore } from '../../../../Store/ConfigureStore';
import {act} from 'react-test-renderer';

import {
	rendererWithIntlAndRedux,
	DUMMY_DEVICE_433,
} from '../../../../../Utils/jestUtils';

import DeviceSettings from '../DeviceSettings';
import {
	getDeviceSettings,
	getDeviceVendorInfo433MHz,
} from '../../../../Lib';
import {
	setAppLayout,
	deviceInfoSuccess,
	setWidgetParamHouse,
	setWidgetParamUnit,
} from '../../../../Actions';

let {height, width} = Dimensions.get('window');

const store = configureStore();

const {
	id,
	protocol,
	model,
} = DUMMY_DEVICE_433;

let info = getDeviceVendorInfo433MHz(protocol, model);
const {
	widget,
} = info.deviceInfo;

const deviceId = id, widgetId = widget;

const setting = getDeviceSettings(parseInt(widgetId, 10), () => '');

describe('<DeviceSettings /> - snapshot', () => {
	it('renders DeviceSettings, with initializeValueFromStore', () => {
		let component;
		act(() => {
			store.dispatch(setAppLayout({
				height,
				width,
			}));

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
			store.dispatch(deviceInfoSuccess(DUMMY_DEVICE_433));

			component = rendererWithIntlAndRedux(
				<DeviceSettings
					settings={setting}
					deviceId={deviceId}
					widgetId={widgetId}
					initializeValueFromStore/>
			);
		});

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});
});

describe('<DeviceSettings /> - snapshot', () => {
	it('renders DeviceSettings, without initializeValueFromStore', () => {
		let component;
		act(() => {
			store.dispatch(setAppLayout({
				height,
				width,
			}));

			// NOTE: Setting initial value here to prevent random selection, random selection
			// will make it impossible to use toMatchSnapshot.
			// setWidgetParamHouse, setWidgetParamUnit, is done based on DUMMY_DEVICE_433's
			// 'widget'(number). Do not update it.
			// Incase if 'protocol' or 'model' of DUMMY_DEVICE_433 is changed
			// use corresponding methods below.
			store.dispatch(setWidgetParamHouse('13'));
			store.dispatch(setWidgetParamUnit('5'));

			component = rendererWithIntlAndRedux(
				<DeviceSettings
					settings={setting}/>
			);
		});

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
