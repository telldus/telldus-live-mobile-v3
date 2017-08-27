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
import { StackNavigator } from 'react-navigation';
import StatusBar from 'StatusBar';
import Orientation from 'react-native-orientation';
import Platform from 'Platform';

import { View } from 'BaseComponents';
import { LoginScreen, RegisterScreen, ForgotPasswordScreen, WelcomeScreen } from 'PreLoginScreens';

const RouteConfigs = {
	Login: {
		screen: LoginScreen,
		navigationOptions: {
			header: null,
		},
	},
	ForgotPassword: {
		screen: ForgotPasswordScreen,
		navigationOptions: {
			header: null,
		},
	},
	Register: {
		screen: RegisterScreen,
		navigationOptions: {
			header: null,
		},
	},
	Welcome: {
		screen: WelcomeScreen,
		navigationOptions: {
			header: null,
		},
	},
};

const StackNavigatorConfig = {
	initialRouteName: 'Login',
};

const Navigator = StackNavigator(RouteConfigs, StackNavigatorConfig);

type Props = {
}

type State = {
	currentScreen: string,
};

class PreLoginNavigator extends View {

	getCurrentRouteName: (navigationState: Object) => void;
	onNavigationStateChange: (prevState: Object, currentState: Object) => void;

	props: Props;
	state: State;
	constructor(props: Props) {
		super(props);
		this.state = {
			currentScreen: 'Login',
		};
		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
	}
	componentDidMount() {
		Platform.OS === 'ios' && StatusBar && StatusBar.setBarStyle('default');
		if (Platform.OS === 'android' && StatusBar) {
			StatusBar.setTranslucent(true);
			StatusBar.setBackgroundColor('rgba(0, 0, 0, 0.2)');
		}
		if (Platform.OS !== 'android') {
			Orientation.lockToPortrait();
		}
	}

	componentWillUnmount() {
		if (Platform.OS !== 'android') {
			Orientation.unlockAllOrientations();
		}
	}

	// gets the current screen from navigation state
	getCurrentRouteName(navigationState: Object) {
		if (!navigationState) {
	  return null;
		}
		const route = navigationState.routes[navigationState.index];
		// dive into nested navigators
		if (route.routes) {
			this.getCurrentRouteName(route);
		}
		return route.routeName;
	}

	onNavigationStateChange(prevState: Object, currentState: Object) {
		const currentScreen = this.getCurrentRouteName(currentState);
		this.setState({
			currentScreen,
		});
	}

	render() {
		let screenProps = {currentScreen: this.state.currentScreen};
		return (
			<Navigator
				onNavigationStateChange={this.onNavigationStateChange}
				screenProps={screenProps}
			/>
		);
	}
}

module.exports = PreLoginNavigator;
