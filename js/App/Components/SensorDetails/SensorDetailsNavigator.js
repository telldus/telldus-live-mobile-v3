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
import { createMaterialTopTabNavigator, MaterialTopTabBar } from '@react-navigation/material-top-tabs';

import History from './HistoryTab';
import Overview from './OverviewTab';
import Settings from './SettingsTab';
import Theme from '../../Theme';
import {
	View,
	TabBar,
} from '../../../BaseComponents';
import { SensorDetailsHeaderPoster } from './SubViews';

import {
	prepareNavigator,
	shouldNavigatorUpdate,
} from '../../Lib/NavigationService';

import i18n from '../../Translations/common';

const ScreenConfigs = [
	{
		name: 'SOverview',
		Component: Overview,
		options: {
			tabBarLabel: ({ color }: Object): Object => (
				<TabBar
					icon="home"
					tintColor={color}
					label={i18n.overviewHeader}
					accessibilityLabel={i18n.deviceOverviewTab}/>
			),
		},
	},
	{
		name: 'SHistory',
		Component: History,
		options: {
			tabBarLabel: ({ color }: Object): Object => (
				<TabBar
					icon="history"
					tintColor={color}
					label={i18n.historyHeader}
					accessibilityLabel={i18n.deviceHistoryTab}/>
			),
		},
	},
	{
		name: 'SSettings',
		Component: Settings,
		options: {
			tabBarLabel: ({ color }: Object): Object => (
				<TabBar
					icon="settings"
					tintColor={color}
					label={i18n.settingsHeader}
					accessibilityLabel={i18n.deviceSettingsTab}/>
			),
		},
	},
];

const NavigatorConfigs = {
	initialRouteName: 'SOverview',
	initialRouteKey: 'SOverview',
	tabBarPosition: 'top',
	swipeEnabled: false,
	lazy: true,
	animationEnabled: true,
	tabBar: ({ tabStyle, labelStyle, ...rest }: Object): Object => {
		let { screenProps } = rest,
			tabWidth = 0, fontSize = 0, paddingVertical = 0;
		if (screenProps && screenProps.appLayout) {
			const { width, height } = screenProps.appLayout;
			const isPortrait = height > width;
			const deviceWidth = isPortrait ? width : height;

			tabWidth = width / 3;
			fontSize = deviceWidth * 0.03;
			paddingVertical = 10 + (fontSize * 0.5);
		}
		return (
			<View style={{flex: 0}}>
				<SensorDetailsHeaderPoster {...rest}/>
				<MaterialTopTabBar {...rest}
					tabStyle={{
						...tabStyle,
						width: tabWidth,
						paddingVertical,
					}}
					labelStyle={{
						...labelStyle,
						fontSize,
					}}
				/>
			</View>
		);
	},
	tabBarOptions: {
		indicatorStyle: {
			backgroundColor: '#fff',
		},
		style: {
			...Theme.Core.shadow,
			justifyContent: 'center',
		},
		tabStyle: {
			alignItems: 'center',
			justifyContent: 'center',
		},
		upperCaseLabel: false,
		scrollEnabled: true,
		activeTintColor: Theme.Core.brandSecondary,
		inactiveTintColor: Theme.Core.inactiveTintColor,
		showIcon: false,
		allowFontScaling: false,
	},
};

const Tab = createMaterialTopTabNavigator();

const SensorDetailsNavigator = React.memo<Object>((props: Object): Object => {
	return prepareNavigator(Tab, {ScreenConfigs, NavigatorConfigs}, props);
}, shouldNavigatorUpdate);

export default SensorDetailsNavigator;
