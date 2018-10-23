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

import { ifIphoneX } from 'react-native-iphone-x-helper';
import DeviceInfo from 'react-native-device-info';
import { createBottomTabNavigator } from 'react-navigation-tabs';


import TabViews from './index';


const RouteConfigs = {
	Dashboard: {
		screen: TabViews.Dashboard,
	},
	Devices: {
		screen: TabViews.Devices,
	},
	Sensors: {
		screen: TabViews.Sensors,
	},
	Scheduler: {
		screen: TabViews.Scheduler,
	},
	Gateways: {
		screen: TabViews.Gateways,
	},
};

const TabNavigatorConfig = {
	initialRouteName: 'Dashboard',
	swipeEnabled: false,
	lazy: true,
	animationEnabled: false,
	tabBarOptions: {
		activeTintColor: '#e26901',
		style: {
			...ifIphoneX({height: 20}),
		},
		labelStyle: {
			fontSize: DeviceInfo.isTablet() ? 18 : 12,
		},
		allowFontScaling: false,
	},
};

const TabsView = createBottomTabNavigator(RouteConfigs, TabNavigatorConfig);

module.exports = TabsView;
