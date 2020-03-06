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
 *
 * @flow
 */

'use strict';

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createCompatNavigatorFactory } from '@react-navigation/compat';

import ScheduleScreen from './ScheduleScreen';

import Device from './Device';
import Action from './Action';
import ActionDim from './ActionDim';
import Time from './Time';
import Days from './Days';
import Summary from './Summary';
import Edit from './Edit';
import ActionThermostat from './ActionThermostat';
import ActionRGB from './ActionRGB';

const initialRouteName = 'InitialScreen';

const renderScheduleScreen = (navigation: Object, screenProps: Object): Function => (Component: Object, ScreenName: string): Object => (
	<ScheduleScreen navigation={navigation} screenProps={screenProps} ScreenName={ScreenName}>
		<Component/>
	</ScheduleScreen>
);

const RouteConfigs = {
	InitialScreen: {
		screen: ({ navigation, screenProps }: Object): Object => renderScheduleScreen(navigation, screenProps)(
			navigation.getParam('editMode', false) ?
				Edit
				:
				Device, 'InitialScreen'),
	},
	Action: {
		screen: ({ navigation, screenProps }: Object): Object => renderScheduleScreen(navigation, screenProps)(Action, 'Action'),
	},
	ActionDim: {
		screen: ({ navigation, screenProps }: Object): Object => renderScheduleScreen(navigation, screenProps)(ActionDim, 'ActionDim'),
	},
	Time: {
		screen: ({ navigation, screenProps }: Object): Object => renderScheduleScreen(navigation, screenProps)(Time, 'Time'),
	},
	Days: {
		screen: ({ navigation, screenProps }: Object): Object => renderScheduleScreen(navigation, screenProps)(Days, 'Days'),
	},
	Summary: {
		screen: ({ navigation, screenProps }: Object): Object => renderScheduleScreen(navigation, screenProps)(Summary, 'Summary'),
	},
	ActionRGB: {
		screen: ({ navigation, screenProps }: Object): Object => renderScheduleScreen(navigation, screenProps)(ActionRGB, 'ActionRGB'),
	},
	ActionThermostat: {
		screen: ({ navigation, screenProps }: Object): Object => renderScheduleScreen(navigation, screenProps)(ActionThermostat, 'ActionThermostat'),
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

const ScheduleNavigator = createCompatNavigatorFactory(createStackNavigator)(RouteConfigs, StackNavigatorConfig);

export default ScheduleNavigator;
