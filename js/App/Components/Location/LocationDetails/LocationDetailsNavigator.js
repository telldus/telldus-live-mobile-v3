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
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

import LocationDetailsContainer from './LocationDetailsContainer';

import DetailsNavigator from './DetailsNavigator';
import EditName from './EditName';
import EditTimeZoneContinent from './EditTimeZoneContinent';
import EditTimeZoneCity from './EditTimeZoneCity';
import EditGeoPosition from './EditGeoPosition';
import TestLocalControl from './TestLocalControl';
import RequestSupport from './RequestSupport';

import {
	prepareNavigator,
	shouldNavigatorUpdate,
} from '../../../Lib/NavigationService';

const initialRouteName = 'Details';

const ScreenConfigs = [
	{
		name: 'Details',
		Component: DetailsNavigator,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'EditName',
		Component: EditName,
		ContainerComponent: LocationDetailsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'EditTimeZoneContinent',
		Component: EditTimeZoneContinent,
		ContainerComponent: LocationDetailsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'EditTimeZoneCity',
		Component: EditTimeZoneCity,
		ContainerComponent: LocationDetailsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'EditGeoPosition',
		Component: EditGeoPosition,
		ContainerComponent: LocationDetailsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'TestLocalControl',
		Component: TestLocalControl,
		ContainerComponent: LocationDetailsContainer,
		options: {
			headerShown: false,
			cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
		},
	},
	{
		name: 'RequestSupport',
		Component: RequestSupport,
		ContainerComponent: LocationDetailsContainer,
		options: {
			headerShown: false,
			cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
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

const LocationDetailsNavigator = React.memo<Object>((props: Object): Object => {
	return prepareNavigator(Stack, {ScreenConfigs, NavigatorConfigs}, props);
}, shouldNavigatorUpdate);

export default (LocationDetailsNavigator: Object);
