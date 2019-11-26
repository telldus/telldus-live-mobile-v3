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

import AddSensorContainer from './AddSensorContainer';

import SelectLocationAddSensor from './SelectLocationAddSensor';
import SensorsListAddSensor from './SensorsListAddSensor';
import SetSensorName from './SetSensorName';

const initialRouteName = 'InitialScreenAddSensor';

type renderContainer = (Object, string) => Object;

const renderAddSensorContainer = (navigation: Object, screenProps: Object): renderContainer => (Component: Object, ScreenName: string): Object => (
	<AddSensorContainer navigation={navigation} screenProps={screenProps} ScreenName={ScreenName}>
		<Component/>
	</AddSensorContainer>
);

const RouteConfigs = {
	InitialScreenAddSensor: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddSensorContainer(navigation, screenProps)(
			navigation.getParam('selectLocation', false) ?
				SelectLocationAddSensor
				:
				SensorsListAddSensor
			, 'InitialScreenAddSensor'),
	},
	SensorsListAddSensor: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddSensorContainer(navigation, screenProps)(SensorsListAddSensor, 'SensorsListAddSensor'),
	},
	SetSensorName: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddSensorContainer(navigation, screenProps)(SetSensorName, 'SetSensorName'),
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

const AddSensorNavigator = createStackNavigator(RouteConfigs, StackNavigatorConfig);

export default AddSensorNavigator;
