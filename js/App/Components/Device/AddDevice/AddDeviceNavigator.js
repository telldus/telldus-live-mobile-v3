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

const initialRouteName = 'InitialScreen';

type renderContainer = (Object) => Object;

const renderAddDeviceContainer = (navigation: Object, screenProps: Object): renderContainer => (Component: Object): Object => (
	<AddDeviceContainer navigation={navigation} screenProps={screenProps}>
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
		),
	},
	SelectDeviceType: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddDeviceContainer(navigation, screenProps)(SelectDeviceType),
	},
	IncludeDevice: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddDeviceContainer(navigation, screenProps)(IncludeDevice),
	},
};

const StackNavigatorConfig = {
	initialRouteName,
	headerMode: 'none',
	cardStyle: {
		shadowColor: 'transparent',
		shadowOpacity: 0,
		elevation: 0,
	},
};

const AddDeviceNavigator = createStackNavigator(RouteConfigs, StackNavigatorConfig);

export default AddDeviceNavigator;
