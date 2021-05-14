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

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TabViews from './index';
import {
	TabBarWithTabVisibility,
} from '../../../BaseComponents';

import {
	prepareNavigator,
	shouldNavigatorUpdate,
} from '../../Lib/NavigationService';

// NOTE [IMP]: Changing the order or updating the tabs
// need to reflect in places like tab hide/show logic and so
// Eg: Lib/NavigationService/prepareVisibleTabs
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
	{
		name: 'MoreOptionsTab',
		Component: TabViews.MoreOptionsTab,
	},
];

const NavigatorConfigs = {
	swipeEnabled: false, // Check if exist in v5
	lazy: true,
	animationEnabled: false, // Check if exist in v5
	tabBar: (props: Object): Object => <TabBarWithTabVisibility {...props}/>,
	tabBarOptions: {
		allowFontScaling: false,
		tabStyle: {
			alignItems: 'stretch',
			justifyContent: 'space-between',
		},
		safeAreaInsets: {
			top: 0,
			bottom: 0,
			right: 0,
			left: 0,
		},
	},
};

const Tab = createBottomTabNavigator();

const TabsView = React.memo<Object>((props: Object): Object => {
	const {
		hiddenTabsCurrentUser = [],
		defaultStartScreenKey = 'Dashboard',
	} = props.screenProps;
	const _ScreenConfigs = ScreenConfigs.filter((sc: Object): boolean => hiddenTabsCurrentUser.indexOf(sc.name) === -1);
	const _NavigatorConfigs = {
		...NavigatorConfigs,
		initialRouteName: defaultStartScreenKey,
	};
	return prepareNavigator(Tab, {ScreenConfigs: _ScreenConfigs, NavigatorConfigs: _NavigatorConfigs}, props);
}, (prevProps: Object, nextProps: Object): boolean => shouldNavigatorUpdate(prevProps, nextProps, [
	'hideHeader',
	'showAttentionCapture',
	'showAttentionCaptureAddDevice',
	'addingNewLocation',
	'hiddenTabsCurrentUser',
	'defaultStartScreenKey',
]));

module.exports = (TabsView: Object);
