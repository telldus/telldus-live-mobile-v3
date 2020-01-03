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
import {act} from 'react-test-renderer';

import {
	rendererWithIntlAndRedux,
	setAppLayoutInStore,
	NAVIGATION_PROP,
	DUMMY_DEVICE_433,
	DEVICE_MANU_INFO_433,
	DUMMY_CLIENT,
	setDeviceListInStore,
	setGatewaysListInStore,
	setDeviceInfoInStore,
} from '../../../../../Utils/jestUtils';
import Include433 from '../Include433';

import { configureStore } from '../../../../Store/ConfigureStore';
import {
	initiateAdd433MHz,
} from '../../../../Actions';

const store = configureStore();

const intl = {
	formatMessage: jest.fn(),
};
const appLayout = {
	height: 100,
	width: 100,
};
const onDidMount = jest.fn();
const deviceName = 'Device name';
const navigation = {
	...NAVIGATION_PROP,
	getParam: (paramName, defaultValue) => {
		return navigation.state.params[paramName] || defaultValue;
	},
	state: {
		params: {
			gateway: {
				id: DUMMY_DEVICE_433.client,
			},
			deviceInfo: {
				...DEVICE_MANU_INFO_433,
			},
			deviceName,
		},
	},
};

const actions = {
	initiateAdd433MHz: jest.fn((id, deviceInfo, formatMessage) => {
		return store.dispatch(initiateAdd433MHz(id, deviceInfo, formatMessage));
	}),
};

describe('<Include433 />', () => {

	beforeAll(() => {
		setAppLayoutInStore();
		setDeviceListInStore();
		setGatewaysListInStore();
		setDeviceInfoInStore();
		store.dispatch({
			type: 'RECEIVED_GATEWAY_WEBSOCKET_ADDRESS',
			gatewayId: DUMMY_CLIENT.id,
			payload: {
				address: 123,
				instance: 123,
				port: 123,
			},
		});
	});

	it('Should initiateAdd433MHz and show activity indicator', () => {

		let component;
		act(() => {
			component = rendererWithIntlAndRedux(
				<Include433
					navigation={navigation}
					intl={intl}
					appLayout={appLayout}
					onDidMount={onDidMount}
					actions={actions}/>
			);
		});

		const args = [
			DUMMY_DEVICE_433.client,
			{
				...DEVICE_MANU_INFO_433,
				deviceName,
			},
			intl.formatMessage,
		];

		const root = component.root;
		const childInclude433 = root.findByType(Include433);
		const childInclude433Instance = childInclude433.instance;

		expect(childInclude433Instance.deleteSocketAndTimer).toBeInstanceOf(Function);

		expect(actions.initiateAdd433MHz).toBeCalledTimes(1);
		expect(actions.initiateAdd433MHz).toBeCalledWith(...args);

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
