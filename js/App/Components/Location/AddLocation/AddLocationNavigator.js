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

import AddLocationContainer from './AddLocationContainer';

import LocationDetected from './LocationDetected';
import LocationActivationManual from './LocationActivationManual';
import LocationName from './LocationName';
import TimeZoneContinent from './TimeZoneContinent';
import TimeZoneCity from './TimeZoneCity';
import TimeZone from './TimeZone';
import Success from './Success';
import Position from './Position';
import CopyDevicesAndSchedules from './CopyDevicesAndSchedules';

import {
	prepareNavigator,
	shouldNavigatorUpdate,
} from '../../../Lib/NavigationService';

const initialRouteName = 'LocationDetected';

const ScreenConfigs = [
	{
		name: 'LocationDetected',
		Component: LocationDetected,
		ContainerComponent: AddLocationContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'LocationActivationManual',
		Component: LocationActivationManual,
		ContainerComponent: AddLocationContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'LocationName',
		Component: LocationName,
		ContainerComponent: AddLocationContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'TimeZoneContinent',
		Component: TimeZoneContinent,
		ContainerComponent: AddLocationContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'TimeZoneCity',
		Component: TimeZoneCity,
		ContainerComponent: AddLocationContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'TimeZone',
		Component: TimeZone,
		ContainerComponent: AddLocationContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'Position',
		Component: Position,
		ContainerComponent: AddLocationContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'Success',
		Component: Success,
		ContainerComponent: AddLocationContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'CopyDevicesAndSchedules',
		Component: CopyDevicesAndSchedules,
		ContainerComponent: AddLocationContainer,
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

const AddLocationNavigator: Object = React.memo<Object>((props: Object): Object => {
	return prepareNavigator(Stack, {ScreenConfigs, NavigatorConfigs}, props);
}, shouldNavigatorUpdate);
export default AddLocationNavigator;
