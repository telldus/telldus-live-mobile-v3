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
 *
 * @flow
 */

'use strict';

import React from 'react';
import { StackNavigator } from 'react-navigation';

import ScheduleScreen from './ScheduleScreen';
import { View, SafeAreaView } from '../../../BaseComponents';
import { NavigationHeader } from '../DeviceDetails/SubViews';

import {getRouteName} from '../../Lib';

import Device from './Device';
import Action from './Action';
import ActionDim from './ActionDim';
import Time from './Time';
import Days from './Days';
import Summary from './Summary';
import Edit from './Edit';

const initialRouteName = 'InitialScreen';

const renderScheduleScreen = (navigation, screenProps) => Component => (
	<ScheduleScreen navigation={navigation} screenProps={screenProps}>
		<Component/>
	</ScheduleScreen>
);

const RouteConfigs = {
	InitialScreen: {
		screen: ({ navigation, screenProps }) => renderScheduleScreen(navigation, screenProps)(
			screenProps.rootNavigator.state.params.editMode ?
				Edit
				:
				Device),
	},
	Action: {
		screen: ({ navigation, screenProps }) => renderScheduleScreen(navigation, screenProps)(Action),
	},
	ActionDim: {
		screen: ({ navigation, screenProps }) => renderScheduleScreen(navigation, screenProps)(ActionDim),
	},
	Time: {
		screen: ({ navigation, screenProps }) => renderScheduleScreen(navigation, screenProps)(Time),
	},
	Days: {
		screen: ({ navigation, screenProps }) => renderScheduleScreen(navigation, screenProps)(Days),
	},
	Summary: {
		screen: ({ navigation, screenProps }) => renderScheduleScreen(navigation, screenProps)(Summary),
	},
};

const StackNavigatorConfig = {
	initialRouteName,
	headerMode: 'float',
	initialRouteParams: {renderHeader: false},
	navigationOptions: ({navigation}) => {
		let {state} = navigation;
		let renderStackHeader = state.routeName !== 'InitialScreen';
		if (renderStackHeader) {
			return {
				header: <NavigationHeader navigation={navigation} />,
			};
		}
		return {
			header: null,
		};
	},
};

const Schedule = StackNavigator(RouteConfigs, StackNavigatorConfig);

type Props = {
	navigation: Object,
};

type State = {
	currentScreen: string,
};

class ScheduleNavigator extends View {
	props: Props;
	state: State;

	onNavigationStateChange: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			currentScreen: 'InitialScreen',
		};

		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
	}

	onNavigationStateChange(prevState: Object, currentState: Object) {
		const currentScreen = getRouteName(currentState);
		if (this.state.currentScreen !== currentScreen) {
			this.setState({
				currentScreen,
			});
			let {navigation} = this.props;
			if (currentScreen === 'InitialScreen' && !navigation.state.params.renderRootHeader) {
				navigation.setParams({renderRootHeader: true});
			}
		}
	}

	render() {
		let { currentScreen } = this.state;
		let { navigation } = this.props;
		let screenProps = {
			currentScreen,
			rootNavigator: navigation,
			initialRouteName,
		};

		return (
			<SafeAreaView>
				{navigation.state.params.renderRootHeader &&
				<NavigationHeader navigation={navigation} />
				}
				<Schedule onNavigationStateChange={this.onNavigationStateChange} screenProps={screenProps} />
			</SafeAreaView>
		);
	}
}

module.exports = ScheduleNavigator;
