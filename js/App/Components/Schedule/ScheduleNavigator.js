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
 * @providesModule ScheduleNavigator
 */

'use strict';

import React from 'react';
import { StackNavigator } from 'react-navigation';
import ScheduleScreen from './ScheduleScreen';

import Device from './Device';
import Action from './Action';
import ActionDim from './ActionDim';
import Time from './Time';
import Days from './Days';
import Summary from './Summary';
import Edit from './Edit';

const renderScheduleScreen = navigation => Component => (
	<ScheduleScreen navigation={navigation}>
		<Component/>
	</ScheduleScreen>
);

const RouteConfigs = {
	Device: {
		screen: ({ navigation }) => renderScheduleScreen(navigation)(Device),
	},
	Action: {
		screen: ({ navigation }) => renderScheduleScreen(navigation)(Action),
	},
	ActionDim: {
		screen: ({ navigation }) => renderScheduleScreen(navigation)(ActionDim),
	},
	Time: {
		screen: ({ navigation }) => renderScheduleScreen(navigation)(Time),
	},
	Days: {
		screen: ({ navigation }) => renderScheduleScreen(navigation)(Days),
	},
	Summary: {
		screen: ({ navigation }) => renderScheduleScreen(navigation)(Summary),
	},
	Edit: {
		screen: ({ navigation }) => renderScheduleScreen(navigation)(Edit),
	},
};

const StackNavigatorConfig = {
	initialRouteName: 'Device',
	headerMode: 'none',
};

const ScheduleNavigator = StackNavigator(RouteConfigs, StackNavigatorConfig);

module.exports = ScheduleNavigator;
