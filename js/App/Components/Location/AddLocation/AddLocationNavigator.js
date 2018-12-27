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
import { createStackNavigator } from 'react-navigation';

import AddLocationContainer from './AddLocationContainer';

import LocationDetected from './LocationDetected';
import LocationActivationManual from './LocationActivationManual';
import LocationName from './LocationName';
import TimeZoneContinent from './TimeZoneContinent';
import TimeZoneCity from './TimeZoneCity';
import TimeZone from './TimeZone';
import Success from './Success';
import Position from './Position';

const initialRouteName = 'LocationDetected';

type renderContainer = (Object, string) => Object;

const renderAddLocationContainer = (navigation: Object, screenProps: Object): renderContainer => (Component: Object, ScreenName: string): Object => (
	<AddLocationContainer navigation={navigation} screenProps={screenProps} ScreenName={ScreenName}>
		<Component/>
	</AddLocationContainer>
);


const RouteConfigs = {
	LocationDetected: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddLocationContainer(navigation, screenProps)(LocationDetected, 'LocationDetected'),
	},
	LocationActivationManual: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddLocationContainer(navigation, screenProps)(LocationActivationManual, 'LocationActivationManual'),
	},
	LocationName: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddLocationContainer(navigation, screenProps)(LocationName, 'LocationName'),
	},
	TimeZoneContinent: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddLocationContainer(navigation, screenProps)(TimeZoneContinent, 'TimeZoneContinent'),
	},
	TimeZoneCity: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddLocationContainer(navigation, screenProps)(TimeZoneCity, 'TimeZoneCity'),
	},
	TimeZone: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddLocationContainer(navigation, screenProps)(TimeZone, 'TimeZone'),
	},
	Position: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddLocationContainer(navigation, screenProps)(Position, 'Position'),
	},
	Success: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddLocationContainer(navigation, screenProps)(Success, 'Success'),
	},
};

const StackNavigatorConfig = {
	initialRouteName,
	headerMode: 'none',
	cardStyle: {
		shadowColor: 'transparent',
		shadowOpacity: 0,
		elevation: 0,
	},
};

const AddLocationNavigator = createStackNavigator(RouteConfigs, StackNavigatorConfig);

export default AddLocationNavigator;
