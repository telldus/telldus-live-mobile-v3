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

import GeoFenceContainer from './GeoFenceContainer';

import AddEditGeoFence from './AddEditGeoFence';
import SelectArea from './SelectArea';
import ArrivingActions from './ArrivingActions';
import LeavingActions from './LeavingActions';
import ActiveTime from './ActiveTime';
import SetAreaName from './SetAreaName';
import EditGeoFence from './EditGeoFence';
import EditGeoFenceAreaFull from './EditGeoFenceAreaFull';

const initialRouteName = 'AddEditGeoFence';

import {
	prepareNavigator,
	shouldNavigatorUpdate,
} from '../../Lib/NavigationService';

const ScreenConfigs = [
	{
		name: 'AddEditGeoFence',
		Component: AddEditGeoFence,
		ContainerComponent: GeoFenceContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectArea',
		Component: SelectArea,
		ContainerComponent: GeoFenceContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'ArrivingActions',
		Component: ArrivingActions,
		ContainerComponent: GeoFenceContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'LeavingActions',
		Component: LeavingActions,
		ContainerComponent: GeoFenceContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'ActiveTime',
		Component: ActiveTime,
		ContainerComponent: GeoFenceContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SetAreaName',
		Component: SetAreaName,
		ContainerComponent: GeoFenceContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'EditGeoFence',
		Component: EditGeoFence,
		ContainerComponent: GeoFenceContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'EditGeoFenceAreaFull',
		Component: EditGeoFenceAreaFull,
		ContainerComponent: GeoFenceContainer,
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

const GeoFenceNavigator = React.memo<Object>((props: Object): Object => {
	return prepareNavigator(Stack, {ScreenConfigs, NavigatorConfigs}, props);
}, shouldNavigatorUpdate);

export default GeoFenceNavigator;
