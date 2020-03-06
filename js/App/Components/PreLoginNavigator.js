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
import {
	Platform,
} from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from '@react-navigation/stack';
import { createCompatNavigatorFactory } from '@react-navigation/compat';
import Orientation from 'react-native-orientation-locker';
import { NavigationContainer } from '@react-navigation/native';

import { View } from '../../BaseComponents';
import { LoginScreen, RegisterScreen, ForgotPasswordScreen, WelcomeScreen } from './PreLoginScreens';
import { FormContainerComponent } from './PreLoginScreens/SubViews';

type renderContainer = (Object) => Object;

const renderFormContainer = (navigation: Object, screenProps: Object): renderContainer => (Component: Object): Object => (
	<FormContainerComponent navigation={navigation} screenProps={screenProps}>
		<Component/>
	</FormContainerComponent>
);

const RouteConfigs = {
	Login: {
		screen: ({ navigation, screenProps }: Object): Object => renderFormContainer(navigation, screenProps)(LoginScreen),
	},
	ForgotPassword: {
		screen: ({ navigation, screenProps }: Object): Object => renderFormContainer(navigation, screenProps)(ForgotPasswordScreen),
	},
	Register: {
		screen: ({ navigation, screenProps }: Object): Object => renderFormContainer(navigation, screenProps)(RegisterScreen),
	},
	Welcome: {
		screen: ({ navigation, screenProps }: Object): Object => renderFormContainer(navigation, screenProps)(WelcomeScreen),
	},
};

const StackNavigatorConfig = {
	initialRouteName: 'Login',
	headerMode: 'none',
};

const Navigator = createCompatNavigatorFactory(createStackNavigator)(RouteConfigs, StackNavigatorConfig);

type Props = {
	toggleDialogueBox: (Object) => null,
};

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
	getCurrentRouteName(navigationState: Object): any {
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

	render(): React$Element<any> {
		let screenProps = {
			currentScreen: this.state.currentScreen,
			toggleDialogueBox: this.props.toggleDialogueBox,
		};
		return (
			<NavigationContainer>
				<Navigator
					onNavigationStateChange={this.onNavigationStateChange}
					screenProps={screenProps}/>
			</NavigationContainer>
		);
	}
}

module.exports = PreLoginNavigator;
