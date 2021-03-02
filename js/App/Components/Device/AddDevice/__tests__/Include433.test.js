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
 *
 */


import React from 'react';
import {act} from 'react-test-renderer';
import { connect } from 'react-redux';

import {
	rendererWithIntlAndReduxProviders,
	setAppLayoutInStore,
	NAVIGATION_PROP,
	DUMMY_DEVICE_433,
	DEVICE_MANU_INFO_433,
	DUMMY_CLIENT,
	setDeviceListInStore,
	setGatewaysListInStore,
	setDeviceInfoInStore,
	getStore,
} from '../../../../../Utils/jestUtils';
import Include433 from '../Include433';

import * as Actions from '../../../../Actions';
import {
	AddDeviceContainer as UnConnectedAddDeviceContainer,
	mapDispatchToProps,
	mapStateToProps,
} from '../AddDeviceContainer';

const store = getStore();

const intl = {
	formatMessage: jest.fn(() => ''),
};
const appLayout = {
	height: 100,
	width: 100,
};
const onDidMount = jest.fn();
const deviceName = 'Device name';
const navigation = {
	...NAVIGATION_PROP,
};
const route = {
	params: {
		gateway: {
			id: DUMMY_DEVICE_433.client,
		},
		deviceInfo: {
			...DEVICE_MANU_INFO_433,
		},
		deviceName,
	},
};
const currentScreen = 'Include433';
const ScreenName = currentScreen;

let actions = {
	initiateAdd433MHz: jest.fn((id, deviceInfo, formatMessage) => {
		return Promise.resolve(() => {});
	}),
};

const initiate = () => {
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
};

const customMapStateToProps = (_store, _ownProps) => {
	return {
		...mapStateToProps(_store, _ownProps),
		currentScreen,
	};
};

jest.useFakeTimers();

describe('<Include433 />', () => {

	beforeAll(() => {
		actions.initiateAdd433MHz.mockReset();
		actions = {
			...actions,
			initiateAdd433MHz: jest.fn((id, deviceInfo, formatMessage) => {
				return store.dispatch(Actions.initiateAdd433MHz(id, deviceInfo, formatMessage));
			}),
		};
	});

	it('Should initiateAdd433MHz and show activity indicator', () => {

		let component;
		act(() => {
			initiate();
			component = rendererWithIntlAndReduxProviders(
				<Include433
					navigation={navigation}
					route={route}
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

describe('<Include433 /> with container component', () => {
	const deleteSocketAndTimer = jest.fn(() => {});

	const initiateAdd433MHz = jest.fn(() => {
		return deleteSocketAndTimer;
	});

	const customMapDispatchToProps = (dispatch) => {
		const {
			actions: actionsProp,
			...others
		} = mapDispatchToProps(dispatch);
		return {
			...others,
			actions: {
				...actionsProp,
				initiateAdd433MHz,
			},
		};
	};

	const ConnectedAddDeviceContainer = connect(customMapStateToProps, customMapDispatchToProps)(UnConnectedAddDeviceContainer);

	afterAll(() => {
		initiateAdd433MHz.mockReset();
		deleteSocketAndTimer.mockReset();
	});

	it('Should initiateAdd433MHz and show activity indicator with container', () => {

		let component;
		act(() => {
			initiate();

			store.dispatch(Actions.addDevice433Initiate());

			const screenProps = {
				appLayout,
				intl,
			};
			component = rendererWithIntlAndReduxProviders(
				<ConnectedAddDeviceContainer
					screenProps={screenProps}
					navigation={navigation}
					currentScreen={currentScreen}
					ScreenName={ScreenName}
					route={route}
					children={
						<Include433/>
					}
				/>
			);
		});

		const root = component.root;
		const childInclude433 = root.findByType(Include433);
		const childInclude433Instance = childInclude433.instance;

		expect(childInclude433Instance.deleteSocketAndTimer).toBeInstanceOf(jest.fn().constructor);

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});
});

describe('<Include433 /> on success with container component', () => {

	const deleteSocketAndTimer = jest.fn(() => {}).mockName('deleteSocketAndTimer');

	const dummyDeviceId = DUMMY_DEVICE_433.id;
	const initiateAdd433MHz = jest.fn(() => {
		return deleteSocketAndTimer;
	}).mockName('initiateAdd433MHz');

	const customMapDispatchToProps2 = (dispatch) => {
		const {
			actions: actionsProp,
			...others
		} = mapDispatchToProps(dispatch);
		return {
			...others,
			actions: {
				...actionsProp,
				initiateAdd433MHz,
			},
		};
	};

	const ConnectedAddDeviceContainer = connect(customMapStateToProps, customMapDispatchToProps2)(UnConnectedAddDeviceContainer);

	afterAll(() => {
		initiateAdd433MHz.mockReset();
		deleteSocketAndTimer.mockReset();
	});

	it('Should initiateAdd433MHz and show success screen with container, also call deleteSocketAndTimer when unmount', () => {

		let component;
		act(() => {
			initiate();

			// Mocking the add device success here
			store.dispatch(Actions.addDevice433Initiate());
			store.dispatch(Actions.addDevice433Success(dummyDeviceId));

			const screenProps = {
				appLayout,
				intl,
			};
			component = rendererWithIntlAndReduxProviders(
				<ConnectedAddDeviceContainer
					screenProps={screenProps}
					currentScreen={currentScreen}
					ScreenName={ScreenName}
					navigation={navigation}
					route={route}
					children={
						<Include433/>
					}
				/>
			);
		});

		const root = component.root;
		const childInclude433 = root.findByType(Include433);
		const childInclude433Instance = childInclude433.instance;

		expect(childInclude433Instance.deleteSocketAndTimer).toBeInstanceOf(jest.fn().constructor);

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();

		component.unmount();

		expect(deleteSocketAndTimer).toBeCalledTimes(1);
	});
});

describe('<Include433 /> on error with container component', () => {

	const deleteSocketAndTimer = jest.fn(() => {}).mockName('deleteSocketAndTimer');

	const initiateAdd433MHz = jest.fn(() => {
		return deleteSocketAndTimer;
	}).mockName('initiateAdd433MHz');

	const customMapDispatchToProps = (dispatch) => {
		const {
			actions: actionsProp,
			...others
		} = mapDispatchToProps(dispatch);
		return {
			...others,
			actions: {
				...actionsProp,
				initiateAdd433MHz,
			},
		};
	};

	const ConnectedAddDeviceContainer = connect(customMapStateToProps, customMapDispatchToProps)(UnConnectedAddDeviceContainer);

	afterAll(() => {
		initiateAdd433MHz.mockReset();
		deleteSocketAndTimer.mockReset();
	});

	it('Should initiateAdd433MHz and show error screen with container, also call deleteSocketAndTimer when unmount', () => {

		let component;
		act(() => {
			initiate();

			// Mocking the add device fail here
			store.dispatch(Actions.addDevice433Initiate());
			store.dispatch(Actions.addDevice433Failed('Error when add device 433MHz failed'));

			const screenProps = {
				appLayout,
				intl,
			};
			component = rendererWithIntlAndReduxProviders(
				<ConnectedAddDeviceContainer
					screenProps={screenProps}
					currentScreen={currentScreen}
					ScreenName={ScreenName}
					navigation={navigation}
					route={route}
					children={
						<Include433/>
					}
				/>
			);
		});

		const root = component.root;
		const childInclude433 = root.findByType(Include433);
		const childInclude433Instance = childInclude433.instance;

		expect(childInclude433Instance.deleteSocketAndTimer).toBeInstanceOf(jest.fn().constructor);

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();

		component.unmount();

		expect(deleteSocketAndTimer).toBeCalledTimes(1);
	});
});
