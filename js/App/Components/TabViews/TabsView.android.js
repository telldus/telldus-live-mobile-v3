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

import { MainTabBarAndroid } from '../../../BaseComponents';
import TabViews from './index';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ViewPagerAdapter from 'react-native-tab-view-viewpager-adapter';

import {
	prepareTabNavigator,
} from '../../Lib/NavigationService';

const ScreenConfigs = [
	{
		name: 'Dashboard',
		Component: TabViews.Dashboard,
	},
	{
		name: 'Devices',
		Component: TabViews.Devices,
	},
	{
		name: 'Sensors',
		Component: TabViews.Sensors,
	},
	{
		name: 'Scheduler',
		Component: TabViews.Scheduler,
	},
];

const NavigatorConfigs = {
	initialRouteName: 'Dashboard',
	initialRouteKey: 'Dashboard',
	swipeEnabled: false,
	lazy: true,
	animationEnabled: true,
	tabBar: (props: Object): Object => <MainTabBarAndroid {...props}/>,
	tabBarPosition: 'top',
	tabBarOptions: {
		scrollEnabled: true,
		allowFontScaling: false,
	},
	// NOTE: The default one has an issue:
	// From dahsboard did mount, when db is empty we
	// do navigate to devices tab, with the default pager
	// component, after navigation device tab contents
	// are rendered once, but after a flash it gets overridden
	// by the empty db message, which must be some bug
	// in the default pager component used by @react-navigation/material-top-tabs.
	pagerComponent: ViewPagerAdapter,
};

const Tab = createMaterialTopTabNavigator();

const TabsView = React.memo<Object>((props: Object): Object => {
	return prepareTabNavigator(Tab, {ScreenConfigs, NavigatorConfigs}, props);
});

module.exports = TabsView;
