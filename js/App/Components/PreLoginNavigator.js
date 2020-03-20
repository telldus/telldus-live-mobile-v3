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
import { createStackNavigator } from '@react-navigation/stack';
import Orientation from 'react-native-orientation-locker';
import { NavigationContainer } from '@react-navigation/native';
import { connect } from 'react-redux';

import { View } from '../../BaseComponents';
import { LoginScreen, RegisterScreen, ForgotPasswordScreen, WelcomeScreen } from './PreLoginScreens';
import { FormContainerComponent } from './PreLoginScreens/SubViews';

import {
	screenChange,
} from '../Actions/Navigation';
import getRouteName from '../Lib/getRouteName';
import {
	prepareNavigator,
} from '../Lib/NavigationService';

const ScreenConfigs = [
	{
		name: 'Login',
		Component: LoginScreen,
		ContainerComponent: FormContainerComponent,
	},
	{
		name: 'ForgotPassword',
		Component: ForgotPasswordScreen,
		ContainerComponent: FormContainerComponent,
	},
	{
		name: 'Register',
		Component: RegisterScreen,
		ContainerComponent: FormContainerComponent,
	},
	{
		name: 'Welcome',
		Component: WelcomeScreen,
		ContainerComponent: FormContainerComponent,
	},
];

const NavigatorConfigs = {
	initialRouteName: 'Login',
	headerMode: 'none',
};

const Stack = createStackNavigator();

type Props = {
	onNavigationStateChange: (string) => void,
	screenProps: Object,
	currentScreen: string,
};

class PreLoginNavigator extends View {

	onNavigationStateChange: (currentState: Object) => void;

	props: Props;
	constructor(props: Props) {
		super(props);
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

	onNavigationStateChange = (currentState: Object) => {
		const currentScreen = getRouteName(currentState);
		this.props.onNavigationStateChange(currentScreen);
	}

	render(): React$Element<any> {

		const {
			screenProps,
			currentScreen,
		} = this.props;
		const props = {
			...this.props,
			screenProps: {
				...screenProps,
				currentScreen,
			},
		};

		const Navigator = prepareNavigator(Stack, {ScreenConfigs, NavigatorConfigs}, props);

		return (
			<NavigationContainer
				onStateChange={this.onNavigationStateChange}>
				{Navigator}
			</NavigationContainer>
		);
	}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		onNavigationStateChange: (screen: string) => {
			dispatch(screenChange(screen));
		},
	};
}

function mapStateToProps(store: Object): Object {
	return {
		currentScreen: store.navigation.screen,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(PreLoginNavigator);
