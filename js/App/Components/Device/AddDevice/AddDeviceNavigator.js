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

import React from 'react';
import { createStackNavigator } from 'react-navigation';

import AddDeviceContainer from './AddDeviceContainer';

import SelectLocation from './SelectLocation';
import SelectDeviceType from './SelectDeviceType';
import IncludeDevice from './IncludeDevice';
import DeviceName from './DeviceName';
import AlreadyIncluded from './AlreadyIncluded';
import NoDeviceFound from './NoDeviceFound';
import ExcludeScreen from './ExcludeScreen';

const initialRouteName = 'InitialScreen';

type renderContainer = (Object, string) => Object;

const renderAddDeviceContainer = (navigation: Object, screenProps: Object): renderContainer => (Component: Object, ScreenName: string): Object => (
	<AddDeviceContainer navigation={navigation} screenProps={screenProps} ScreenName={ScreenName}>
		<Component/>
	</AddDeviceContainer>
);


const RouteConfigs = {
	InitialScreen: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddDeviceContainer(navigation, screenProps)(
			navigation.getParam('selectLocation', false) ?
				SelectLocation
				:
				SelectDeviceType
			, 'InitialScreen'),
	},
	SelectDeviceType: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddDeviceContainer(navigation, screenProps)(SelectDeviceType, 'SelectDeviceType'),
	},
	IncludeDevice: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddDeviceContainer(navigation, screenProps)(IncludeDevice, 'IncludeDevice'),
	},
	DeviceName: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddDeviceContainer(navigation, screenProps)(DeviceName, 'DeviceName'),
	},
	AlreadyIncluded: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddDeviceContainer(navigation, screenProps)(AlreadyIncluded, 'AlreadyIncluded'),
	},
	NoDeviceFound: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddDeviceContainer(navigation, screenProps)(NoDeviceFound, 'NoDeviceFound'),
	},
	ExcludeScreen: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddDeviceContainer(navigation, screenProps)(ExcludeScreen, 'ExcludeScreen'),
	},
};

const StackNavigatorConfig = {
	initialRouteName,
	initialRouteKey: initialRouteName,
	headerMode: 'none',
	cardStyle: {
		shadowColor: 'transparent',
		shadowOpacity: 0,
		elevation: 0,
	},
};

const AddDeviceNavigator = createStackNavigator(RouteConfigs, StackNavigatorConfig);

export default AddDeviceNavigator;
