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

import GeoFenceContainer from './GeoFenceContainer';

import AddEditGeoFence from './AddEditGeoFence';
import SelectArea from './SelectArea';
import ArrivingActions from './ArrivingActions';
import LeavingActions from './LeavingActions';
import ActiveTime from './ActiveTime';
import SetAreaName from './SetAreaName';
import EditGeoFence from './EditGeoFence';

const initialRouteName = 'AddEditGeoFence';

type renderContainer = (Object, string) => Object;

const renderGeoFenceContainer = (navigation: Object, screenProps: Object): renderContainer => (Component: Object, ScreenName: string): Object => (
	<GeoFenceContainer navigation={navigation} screenProps={screenProps} ScreenName={ScreenName}>
		<Component/>
	</GeoFenceContainer>
);


const RouteConfigs = {
	AddEditGeoFence: {
		screen: ({ navigation, screenProps }: Object): Object => renderGeoFenceContainer(navigation, screenProps)(AddEditGeoFence, 'AddEditGeoFence'),
	},
	SelectArea: {
		screen: ({ navigation, screenProps }: Object): Object => renderGeoFenceContainer(navigation, screenProps)(SelectArea, 'SelectArea'),
	},
	ArrivingActions: {
		screen: ({ navigation, screenProps }: Object): Object => renderGeoFenceContainer(navigation, screenProps)(ArrivingActions, 'ArrivingActions'),
	},
	LeavingActions: {
		screen: ({ navigation, screenProps }: Object): Object => renderGeoFenceContainer(navigation, screenProps)(LeavingActions, 'LeavingActions'),
	},
	ActiveTime: {
		screen: ({ navigation, screenProps }: Object): Object => renderGeoFenceContainer(navigation, screenProps)(ActiveTime, 'ActiveTime'),
	},
	SetAreaName: {
		screen: ({ navigation, screenProps }: Object): Object => renderGeoFenceContainer(navigation, screenProps)(SetAreaName, 'SetAreaName'),
	},
	EditGeoFence: {
		screen: ({ navigation, screenProps }: Object): Object => renderGeoFenceContainer(navigation, screenProps)(EditGeoFence, 'EditGeoFence'),
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

const GeoFenceNavigator = createStackNavigator(RouteConfigs, StackNavigatorConfig);

export default GeoFenceNavigator;
