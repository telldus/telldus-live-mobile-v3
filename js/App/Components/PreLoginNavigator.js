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
import {
	useSelector,
} from 'react-redux';
import { connect } from 'react-redux';

import { View } from '../../BaseComponents';
import { LoginScreen, RegisterScreen, ForgotPasswordScreen, WelcomeScreen } from './PreLoginScreens';
import { FormContainerComponent } from './PreLoginScreens/SubViews';

import {
	screenChange,
} from '../Actions/Navigation';
import {
	useDialogueBox,
} from '../Hooks/Dialoguebox';

let screenProps = {
	source: 'prelogin',
};

const ScreenConfigs = [
	{
		name: 'Login',
		component: <LoginScreen/>,
	},
	{
		name: 'ForgotPassword',
		component: <ForgotPasswordScreen/>,
	},
	{
		name: 'Register',
		component: <RegisterScreen/>,
	},
	{
		name: 'Welcome',
		component: <WelcomeScreen/>,
	},
];

const StackNavigatorConfig = {
	initialRouteName: 'Login',
	headerMode: 'none',
};

const Stack = createStackNavigator();

type Props = {
	onNavigationStateChange: (string) => void,
};

class PreLoginNavigator extends View {

	getCurrentRouteName: (navigationState: Object) => string;
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

	// gets the current screen from navigation state
	getCurrentRouteName(navigationState: Object): string {
		if (!navigationState) {
			return '';
		}
		const route = navigationState.routes[navigationState.index];
		// dive into nested navigators
		if (route.routes) {
			this.getCurrentRouteName(route);
		}
		return route.name;
	}

	onNavigationStateChange = (currentState: Object) => {
		const currentScreen = this.getCurrentRouteName(currentState);
		this.props.onNavigationStateChange(currentScreen);
	}

	render(): React$Element<any> {

		const SCREENS = ScreenConfigs.map((screenConf: Object, index: number): Object => {

			const {
				name,
				component,
				options,
			} = screenConf;

			return (
				<Stack.Screen
					key={`${index}${name}`}
					name={name}
					// eslint-disable-next-line react/jsx-no-bind
					component={(...args: any): Object => {
						const { screen: currentScreen } = useSelector((state: Object): Object => state.navigation);
						const {
							toggleDialogueBoxState,
						} = useDialogueBox();

						let props = {};
						args.forEach((arg: Object = {}) => {
							props = {
								...props,
								...arg,
							};
						});

						return (
							<FormContainerComponent
								{...props}
								screenProps={{
									...screenProps,
									currentScreen,
									toggleDialogueBox: toggleDialogueBoxState,
								}}>
								{component}
							</FormContainerComponent>
						);
					}}
					options={options}/>
			);
		});

		return (
			<NavigationContainer
				onStateChange={this.onNavigationStateChange}>
				<Stack.Navigator
					{...StackNavigatorConfig}>
					{SCREENS}
				</Stack.Navigator>
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

module.exports = connect(null, mapDispatchToProps)(PreLoginNavigator);
