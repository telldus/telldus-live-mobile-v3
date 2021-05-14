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

import AddDeviceContainer from './AddDeviceContainer';

import SelectLocation from './SelectLocation';
import SelectDeviceType from './SelectDeviceType';
import SelectBrand433 from './SelectBrand433';
import SelectModel433 from './SelectModel433';
import Include433 from './Include433';
import SetDeviceName433 from './SetDeviceName433';

import {
	prepareNavigator,
	shouldNavigatorUpdate,
} from '../../../Lib/NavigationService';

const initialRouteName = 'SelectLocation';

const ScreenConfigs = [
	{
		name: 'SelectLocation',
		Component: SelectLocation,
		ContainerComponent: AddDeviceContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectDeviceType',
		Component: SelectDeviceType,
		ContainerComponent: AddDeviceContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectBrand433',
		Component: SelectBrand433,
		ContainerComponent: AddDeviceContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectModel433',
		Component: SelectModel433,
		ContainerComponent: AddDeviceContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'Include433',
		Component: Include433,
		ContainerComponent: AddDeviceContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SetDeviceName433',
		Component: SetDeviceName433,
		ContainerComponent: AddDeviceContainer,
		options: {
			headerShown: false,
		},
	},
];

const NavigatorConfigs = {
	initialRouteName,
	initialRouteKey: initialRouteName,
	headerMode: 'none',
	cardStyle: {
		shadowColor: 'transparent',
		shadowOpacity: 0,
		elevation: 0,
	},
};

const Stack = createStackNavigator();

const AddDeviceNavigator: Object = React.memo<Object>((props: Object): Object => {
	return prepareNavigator(Stack, {ScreenConfigs, NavigatorConfigs}, props);
}, shouldNavigatorUpdate);
export default AddDeviceNavigator;
