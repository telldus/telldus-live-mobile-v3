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
import { Easing, Animated } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';

import AddDeviceNavigator from './Device/AddDevice/AddDeviceNavigator';
import { Header } from '../../BaseComponents';
import { SettingsScreen } from './Settings';
import ScheduleNavigator from './Schedule/ScheduleNavigator';
import SensorDetailsNavigator from './SensorDetails/SensorDetailsNavigator';
import DeviceDetailsNavigator from './DeviceDetails/DeviceDetailsNavigator';
import AddLocationNavigator from './Location/AddLocation/AddLocationNavigator';
import LocationDetailsNavigator from './Location/LocationDetails/LocationDetailsNavigator';
import TabsView from './TabViews/TabsView';

const RouteConfigs = {
	Tabs: {
		screen: TabsView,
		navigationOptions: ({screenProps, ...others}: Object): Object => {
			const { hideHeader } = screenProps;
			if (hideHeader) { // Android Landscape mode - Custom Header - so return null.
				return {
					headerStyle: {
						height: 0,
						width: 0,
						borderBottomWidth: 0,
					},
					header: null,
				};
			}
			return {
				header: <Header {...others} {...screenProps}/>,
			};
		},
	},
	Settings: {
		// In addition to 'header: null' If header style is not manually set so, it cause some empty space to show in iPhoneX
		screen: SettingsScreen,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			header: null,
		},
	},
	DeviceDetails: {
		screen: DeviceDetailsNavigator,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			header: null,
		},
	},
	SensorDetails: {
		screen: SensorDetailsNavigator,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			header: null,
		},
	},
	Schedule: {
		screen: ScheduleNavigator,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			header: null,
		},
	},
	AddLocation: {
		screen: AddLocationNavigator,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			header: null,
		},
	},
	LocationDetails: {
		screen: LocationDetailsNavigator,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			header: null,
		},
	},
	AddDevice: {
		screen: AddDeviceNavigator,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
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
	headerMode: 'screen',
	transitionConfig: (): Object => ({
		transitionSpec: {
		  duration: 600,
		  easing: Easing.out(Easing.poly(4)),
		  timing: Animated.timing,
		  useNativeDriver: true,
		},
		screenInterpolator: (sceneProps: Object): Object => {
			const { layout, position, scene } = sceneProps;
			const { index } = scene;

			const height = layout.initHeight;
			const translateY = position.interpolate({
				inputRange: [index - 1, index, index + 1],
				outputRange: [height, 0, 0],
			});

			const opacity = position.interpolate({
				inputRange: [index - 1, index - 0.99, index],
				outputRange: [0, 1, 1],
			});

			return { opacity, transform: [{ translateY }] };

		},
	  }),
};

const Navigator = createStackNavigator(RouteConfigs, StackNavigatorConfig);

export default createAppContainer(Navigator);
