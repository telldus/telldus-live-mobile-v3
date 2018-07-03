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
 */

// @flow

'use strict';
import React from 'react';
import { createStackNavigator } from 'react-navigation';

import { SettingsScreen } from './Settings';
import ScheduleNavigator from './Schedule/ScheduleNavigator';
import DeviceDetailsNavigator from './DeviceDetails/DeviceDetailsNavigator';
import AddLocationNavigator from './Location/AddLocation/AddLocationNavigator';
import LocationDetailsNavigator from './Location/LocationDetails/LocationDetailsNavigator';
import TabsView from './TabViews/TabsView';

import { DeviceDetailsHeaderPoster } from './DeviceDetails/SubViews';

const RouteConfigs = {
	Tabs: {
		screen: TabsView,
		navigationOptions: {
			header: null,
		},
	},
	Settings: {
		screen: SettingsScreen,
		navigationOptions: {
			header: null,
		},
	},
	DeviceDetails: {
		screen: DeviceDetailsNavigator,
		navigationOptions: (props: Object): Object => {
			return {
				header: <DeviceDetailsHeaderPoster {...props}/>,
			};
		},
	},
	Schedule: {
		screen: ScheduleNavigator,
		navigationOptions: {
			header: null,
		},
	},
	AddLocation: {
		screen: AddLocationNavigator,
		navigationOptions: {
			header: null,
		},
	},
	LocationDetails: {
		screen: LocationDetailsNavigator,
		navigationOptions: {
			header: null,
		},
	},
};

const StackNavigatorConfig = {
	initialRouteName: 'Tabs',
	cardStyle: {
		shadowColor: 'transparent',
		shadowOpacity: 0,
		elevation: 0,
	},
};

const Navigator = createStackNavigator(RouteConfigs, StackNavigatorConfig);

export default Navigator;
