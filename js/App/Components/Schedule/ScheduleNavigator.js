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

import {
	prepareNavigator,
	shouldNavigatorUpdate,
} from '../../Lib/NavigationService';

const initialRouteName = 'Device';

const ScreenConfigs = [
	{
		name: 'Device',
		Component: Device,
		ContainerComponent: ScheduleScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'Edit',
		Component: Edit,
		ContainerComponent: ScheduleScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'Action',
		Component: Action,
		ContainerComponent: ScheduleScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'ActionDim',
		Component: ActionDim,
		ContainerComponent: ScheduleScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'Time',
		Component: Time,
		ContainerComponent: ScheduleScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'Days',
		Component: Days,
		ContainerComponent: ScheduleScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'Summary',
		Component: Summary,
		ContainerComponent: ScheduleScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'ActionRGB',
		Component: ActionRGB,
		ContainerComponent: ScheduleScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'ActionThermostat',
		Component: ActionThermostat,
		ContainerComponent: ScheduleScreen,
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

const ScheduleNavigator = React.memo<Object>((props: Object): Object => {
	return prepareNavigator(Stack, {ScreenConfigs, NavigatorConfigs}, props);
}, shouldNavigatorUpdate);

export default (ScheduleNavigator: Object);
