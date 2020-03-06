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
import { createStackNavigator } from '@react-navigation/stack';
import { createCompatNavigatorFactory } from '@react-navigation/compat';

import AddDeviceContainer from './AddDeviceContainer';

import SelectLocation from './SelectLocation';
import SelectDeviceType from './SelectDeviceType';
import IncludeDevice from './IncludeDevice';
import DeviceName from './DeviceName';
import AlreadyIncluded from './AlreadyIncluded';
import NoDeviceFound from './NoDeviceFound';
import ExcludeScreen from './ExcludeScreen';
import IncludeFailed from './IncludeFailed';
import CantEnterInclusion from './CantEnterInclusion';
import SelectBrand433 from './SelectBrand433';
import SelectModel433 from './SelectModel433';
import Include433 from './Include433';
import SetDeviceName433 from './SetDeviceName433';

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
	IncludeFailed: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddDeviceContainer(navigation, screenProps)(IncludeFailed, 'IncludeFailed'),
	},
	CantEnterInclusion: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddDeviceContainer(navigation, screenProps)(CantEnterInclusion, 'CantEnterInclusion'),
	},
	SelectBrand433: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddDeviceContainer(navigation, screenProps)(SelectBrand433, 'SelectBrand433'),
	},
	SelectModel433: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddDeviceContainer(navigation, screenProps)(SelectModel433, 'SelectModel433'),
	},
	Include433: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddDeviceContainer(navigation, screenProps)(Include433, 'Include433'),
	},
	SetDeviceName433: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddDeviceContainer(navigation, screenProps)(SetDeviceName433, 'SetDeviceName433'),
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

const AddDeviceNavigator = createCompatNavigatorFactory(createStackNavigator)(RouteConfigs, StackNavigatorConfig);

export default AddDeviceNavigator;
