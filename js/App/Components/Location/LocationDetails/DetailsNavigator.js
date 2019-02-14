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

import ZWaveSettings from './ZWaveSettings';
import Details from './Details';
import Theme from '../../../Theme';
import { View } from '../../../../BaseComponents';
import LocationDetailsHeaderPoster from './LocationDetailsHeaderPoster';

const DetailsNavigator = createMaterialTopTabNavigator(
	{
		LOverview: {
			screen: Details,
		},
		ZWaveSettings: {
			screen: ZWaveSettings,
		},
	},
	{
		initialRouteName: 'LOverview',
		initialRouteKey: 'LOverview',
		tabBarPosition: 'top',
		swipeEnabled: false,
		lazy: true,
		animationEnabled: true,
		tabBarComponent: ({ style, tabStyle, labelStyle, indicatorStyle, ...rest }: Object): Object => {
			let { screenProps, navigation } = rest, tabHeight,
				tabWidth = 0, fontSize = 0, paddingVertical = 0;

			const { transports = '' } = navigation.getParam('location', {});
			const items = transports.split(',');
			const supportZWave = items.indexOf('zwave') !== -1;

			if (screenProps && screenProps.appLayout) {
				const { width, height } = screenProps.appLayout;
				const isPortrait = height > width;
				const deviceWidth = isPortrait ? width : height;

				tabWidth = supportZWave ? width / 2 : width;
				fontSize = deviceWidth * 0.03;
				paddingVertical = 10 + (fontSize * 0.5);
			}
			tabHeight = supportZWave ? undefined : 0;
			return (
				<View style={{flex: 0}}>
					<LocationDetailsHeaderPoster {...rest}/>
					<MaterialTopTabBar {...rest}
						style={{
							...style,
							height: tabHeight,
						}}
						tabStyle={{
							...tabStyle,
							width: tabWidth,
							height: tabHeight,
							paddingVertical,
						}}
						labelStyle={{
							...labelStyle,
							fontSize,
							height: tabHeight,
						}}
						indicatorStyle={{
							...indicatorStyle,
							height: tabHeight,
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
				backgroundColor: '#fff',
				...Theme.Core.shadow,
				justifyContent: 'center',
			},
			tabStyle: {
				alignItems: 'center',
				justifyContent: 'center',
			},
			upperCaseLabel: false,
			scrollEnabled: false,
			activeTintColor: Theme.Core.brandSecondary,
			inactiveTintColor: Theme.Core.inactiveTintColor,
			showIcon: false,
			allowFontScaling: false,
		},
	}
);

export default DetailsNavigator;
