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

import ZWaveSettings from './ZWaveSettings';
import Details from './Details';
import AdministrationTab from './AdministrationTab';
import Theme from '../../../Theme';
import {
	View,
	TabBar,
} from '../../../../BaseComponents';
import LocationDetailsHeaderPoster from './LocationDetailsHeaderPoster';

import {
	prepareNavigator,
	shouldNavigatorUpdate,
} from '../../../Lib/NavigationService';

import {
	withTheme,
} from '../../../Components/HOC/withTheme';

import i18n from '../../../Translations/common';

const ScreenConfigs = [
	{
		name: 'Overview',
		Component: Details,
		options: {
			tabBarLabel: ({ focused }: Object): Object => (
				<TabBar
					icon="home"
					focused={focused}
					label={i18n.overviewHeader}
					accessibilityLabel={i18n.locationOverviewTab}/>
			),
		},
	},
	{
		name: 'AdministrationTab',
		Component: AdministrationTab,
		options: {
			tabBarLabel: ({ focused }: Object): Object => (
				<TabBar
					icon="home"
					focused={focused}
					label={i18n.administration}
					accessibilityLabel={i18n.administration}/>
			),
		},
	},
	{
		name: 'ZWaveSettings',
		Component: ZWaveSettings,
		options: {
			tabBarLabel: ({ focused }: Object): Object => (
				<TabBar
					icon="settings"
					focused={focused}
					label={'Z-Wave'}
					accessibilityLabel={i18n.zWaveSettingsTab}/>
			),
		},
	},
];

const ThemedTabBar = withTheme(React.memo<Object>((props: Object): Object => {
	const {
		posterProps,
		tabBarProps = {},
	} = props;

	const {
		indicatorStyle,
	} = tabBarProps;

	return (
		<View style={{flex: 0}}>
			<LocationDetailsHeaderPoster {...posterProps}/>
			<MaterialTopTabBar
				{...tabBarProps}
				indicatorStyle={{
					...indicatorStyle,
					height: 0,
				}}
			/>
		</View>
	);
}));

const NavigatorConfigs = {
	initialRouteName: 'Overview',
	initialRouteKey: 'Overview',
	tabBarPosition: 'top',
	swipeEnabled: false,
	lazy: true,
	animationEnabled: true,
	backBehavior: 'history',
	tabBar: ({ style, tabStyle, labelStyle, indicatorStyle, ...rest }: Object): Object => {
		let { screenProps, route } = rest, tabHeight,
			tabWidth = 0, fontSize = 0, paddingVertical = 0;

		const {
			location = {},
		} = route.params || {};
		const { transports = '' } = location;
		const items = transports.split(',');
		const supportZWave = items.indexOf('zwave') !== -1;

		if (screenProps && screenProps.appLayout) {
			const { width, height } = screenProps.appLayout;
			const isPortrait = height > width;
			const deviceWidth = isPortrait ? width : height;

			tabWidth = supportZWave ? width / 3 : width / 2;
			fontSize = deviceWidth * 0.03;
			paddingVertical = 10 + (fontSize * 0.5);
		}
		return (
			<ThemedTabBar
				posterProps={{
					...rest,
				}}
				tabBarProps={{
					...rest,
					style: {
						...style,
						height: tabHeight,
					},
					tabStyle: {
						...tabStyle,
						width: tabWidth,
						height: tabHeight,
						paddingVertical,
					},
					labelStyle: {
						...labelStyle,
						fontSize,
						height: tabHeight,
					},
					indicatorStyle: {
						height: tabHeight,
					},
				}}
			/>
		);
	},
	tabBarOptions: {
		style: {
			...Theme.Core.shadow,
			justifyContent: 'center',
		},
		tabStyle: {
			alignItems: 'center',
			justifyContent: 'center',
		},
		upperCaseLabel: false,
		scrollEnabled: false,
		showIcon: false,
		allowFontScaling: false,
	},
};

const Tab = createMaterialTopTabNavigator();

const DetailsNavigator = React.memo<Object>((props: Object): Object => {
	return prepareNavigator(Tab, {ScreenConfigs, NavigatorConfigs}, props);
}, shouldNavigatorUpdate);

export default (DetailsNavigator: Object);
