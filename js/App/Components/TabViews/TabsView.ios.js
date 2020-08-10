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
	MainTabBarIOS,
} from '../../../BaseComponents';

import {
	prepareNavigator,
	shouldNavigatorUpdate,
} from '../../Lib/NavigationService';

import i18n from '../../Translations/common';

const ScreenConfigs = [
	{
		name: 'Dashboard',
		Component: TabViews.Dashboard,
		options: (): Object => {
			return {
				tabBarLabel: ({ color, focused }: Object): Object => (
					<MainTabBarIOS
						iconHint={'dashboard'}
						labelIntl={i18n.dashboard}
						focused={focused}
						screenName={'Dashboard'}
						tabBarAccesibilityLabelIntl={i18n.dashboardTab}
					/>
				),
			};
		},
	},
	{
		name: 'Devices',
		Component: TabViews.Devices,
		options: (): Object => {
			return {
				tabBarLabel: ({ color, focused }: Object): Object => (
					<MainTabBarIOS
						iconHint={'devices'}
						labelIntl={i18n.devices}
						focused={focused}
						screenName={'Devices'}
						tabBarAccesibilityLabelIntl={i18n.devicesTab}
					/>
				),
			};
		},
	},
	{
		name: 'Sensors',
		Component: TabViews.Sensors,
		options: (): Object => {
			return {
				tabBarLabel: ({ color, focused }: Object): Object => (
					<MainTabBarIOS
						iconHint={'sensors'}
						labelIntl={i18n.sensors}
						focused={focused}
						screenName={'Sensors'}
						tabBarAccesibilityLabelIntl={i18n.sensorsTab}
					/>
				),
			};

		},
	},
	{
		name: 'Scheduler',
		Component: TabViews.Scheduler,
		options: (): Object => {
			return {
				tabBarLabel: ({ color, focused }: Object): Object => (
					<MainTabBarIOS
						iconHint={'scheduler'}
						labelIntl={i18n.scheduler}
						focused={focused}
						screenName={'Scheduler'}
						tabBarAccesibilityLabelIntl={i18n.schedulerTab}
					/>
				),
			};
		},
	},
	{
		name: 'MoreOptionsTab',
		Component: TabViews.MoreOptionsTab,
		options: (): Object => {
			return {
				tabBarLabel: ({ color, focused }: Object): Object => (
					<MainTabBarIOS
						iconName={'overflow'}
						labelIntl={i18n.more}
						focused={focused}
						screenName={'MoreOptionsTab'}
						tabBarAccesibilityLabelIntl={i18n.more}
					/>
				),
			};
		},
	},
];

const NavigatorConfigs = {
	initialRouteName: 'Dashboard',
	initialRouteKey: 'Dashboard', // Check if exist in v5
	swipeEnabled: false, // Check if exist in v5
	lazy: true,
	animationEnabled: false, // Check if exist in v5
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
	return prepareNavigator(Tab, {ScreenConfigs, NavigatorConfigs}, props);
}, (prevProps: Object, nextProps: Object): boolean => shouldNavigatorUpdate(prevProps, nextProps, [
	'hideHeader',
	'showAttentionCapture',
	'showAttentionCaptureAddDevice',
	'addingNewLocation',
]));

module.exports = TabsView;
