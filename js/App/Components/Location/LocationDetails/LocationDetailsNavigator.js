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
import { Easing, Animated } from 'react-native';
import { createStackNavigator } from 'react-navigation';

import LocationDetailsContainer from './LocationDetailsContainer';

import DetailsNavigator from './DetailsNavigator';
import EditName from './EditName';
import EditTimeZoneContinent from './EditTimeZoneContinent';
import EditTimeZoneCity from './EditTimeZoneCity';
import EditGeoPosition from './EditGeoPosition';
import TestLocalControl from './TestLocalControl';

const initialRouteName = 'Details';

type renderContainer = (Object, string) => Object;

const renderLocationDetailsContainer = (navigation: Object, screenProps: Object): renderContainer => (Component: Object, ScreenName: string): Object => (
	<LocationDetailsContainer navigation={navigation} screenProps={screenProps} ScreenName={ScreenName}>
		<Component/>
	</LocationDetailsContainer>
);

const RouteConfigs = {
	Details: {
		screen: DetailsNavigator,
	},
	EditName: {
		screen: ({ navigation, screenProps }: Object): Object => renderLocationDetailsContainer(navigation, screenProps)(EditName, 'EditName'),
	},
	EditTimeZoneContinent: {
		screen: ({ navigation, screenProps }: Object): Object => renderLocationDetailsContainer(navigation, screenProps)(EditTimeZoneContinent, 'EditTimeZoneContinent'),
	},
	EditTimeZoneCity: {
		screen: ({ navigation, screenProps }: Object): Object => renderLocationDetailsContainer(navigation, screenProps)(EditTimeZoneCity, 'EditTimeZoneCity'),
	},
	EditGeoPosition: {
		screen: ({ navigation, screenProps }: Object): Object => renderLocationDetailsContainer(navigation, screenProps)(EditGeoPosition, 'EditGeoPosition'),
	},
	TestLocalControl: {
		screen: TestLocalControl,
	},
};

const StackNavigatorConfig = {
	initialRouteName,
	initialRouteKey: initialRouteName,
	headerMode: 'none',
	cardStyle: {
		shadowColor: 'transparent',
		shadowOpacity: 0,
		elevation: 0,
	},
	transitionConfig: (): Object => ({
		transitionSpec: {
		  duration: 600,
		  easing: Easing.out(Easing.poly(4)),
		  timing: Animated.timing,
		  useNativeDriver: true,
		},
		screenInterpolator: (sceneProps: Object): Object => {
			const { layout, position, scene } = sceneProps;
			const { index, route } = scene;
			if (route.routeName === 'TestLocalControl') {
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
			}
			const width = layout.initWidth;
			const translateX = position.interpolate({
				inputRange: [index - 1, index, index + 1],
				outputRange: [width, 0, 0],
			});

			const opacity = position.interpolate({
				inputRange: [index - 1, index - 0.99, index],
				outputRange: [0, 1, 1],
			});

			return { opacity, transform: [{ translateX }] };
		},
	  }),
};

const LocationDetailsNavigator = createStackNavigator(RouteConfigs, StackNavigatorConfig);

export default LocationDetailsNavigator;
