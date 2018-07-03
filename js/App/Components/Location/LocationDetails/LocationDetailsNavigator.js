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

import { NavigationHeader } from '../../../../BaseComponents';
import LocationDetailsContainer from './LocationDetailsContainer';

import Details from './Details';
import EditName from './EditName';
import EditTimeZoneContinent from './EditTimeZoneContinent';
import EditTimeZoneCity from './EditTimeZoneCity';
import EditGeoPosition from './EditGeoPosition';

const initialRouteName = 'Details';

type renderContainer = (Object) => Object;

const renderLocationDetailsContainer = (navigation: Object, screenProps: Object): renderContainer => (Component: Object): Object => (
	<LocationDetailsContainer navigation={navigation} screenProps={screenProps}>
		<Component/>
	</LocationDetailsContainer>
);

const RouteConfigs = {
	Details: {
		screen: ({ navigation, screenProps }: Object): Object => renderLocationDetailsContainer(navigation, screenProps)(Details),
	},
	EditName: {
		screen: ({ navigation, screenProps }: Object): Object => renderLocationDetailsContainer(navigation, screenProps)(EditName),
	},
	EditTimeZoneContinent: {
		screen: ({ navigation, screenProps }: Object): Object => renderLocationDetailsContainer(navigation, screenProps)(EditTimeZoneContinent),
	},
	EditTimeZoneCity: {
		screen: ({ navigation, screenProps }: Object): Object => renderLocationDetailsContainer(navigation, screenProps)(EditTimeZoneCity),
	},
	EditGeoPosition: {
		screen: ({ navigation, screenProps }: Object): Object => renderLocationDetailsContainer(navigation, screenProps)(EditGeoPosition),
	},
};

const StackNavigatorConfig = {
	initialRouteName,
	headerMode: 'float',
	navigationOptions: ({navigation}: Object): Object => {
		return {
			header: <NavigationHeader navigation={navigation}/>,
		};
	},
};

const LocationDetailsNavigator = createStackNavigator(RouteConfigs, StackNavigatorConfig);

export default LocationDetailsNavigator;
