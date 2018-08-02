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
import { createMaterialTopTabNavigator, MaterialTopTabBar } from 'react-navigation-tabs';

import History from './HistoryTab';
import Overview from './OverviewTab';
import Settings from './SettingsTab';
import Theme from '../../Theme';

const SensorDetailsNavigator = createMaterialTopTabNavigator(
	{
		Overview: {
			screen: Overview,
		},
		History: {
			screen: History,
		},
		Settings: {
			screen: Settings,
		},
	},
	{
		initialRouteName: 'Overview',
		tabBarPosition: 'top',
		swipeEnabled: false,
		lazy: true,
		animationEnabled: true,
		tabBarComponent: ({ tabStyle, labelStyle, ...rest }: Object): Object => {
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
			);
		},
		tabBarOptions: {
			indicatorStyle: {
				backgroundColor: '#fff',
			},
			style: {
				backgroundColor: '#fff',
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
		},
	}
);

export default SensorDetailsNavigator;
