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
	useDispatch,
} from 'react-redux';

import { LoginScreen, RegisterScreen, ForgotPasswordScreen, WelcomeScreen } from './PreLoginScreens';
import { FormContainerComponent } from './PreLoginScreens/SubViews';

import {
	screenChange,
} from '../Actions/Navigation';
import getRouteName from '../Lib/getRouteName';
import {
	prepareNavigator,
	shouldNavigatorUpdate,
} from '../Lib/NavigationService';

import {
	useAppTheme,
} from '../Hooks/App';

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
	screenProps: Object,
};

const PreLoginNavigator = React.memo((props: Props): Object => {

	const dispatch = useDispatch();

	React.useEffect((): Function => {
		if (Platform.OS !== 'android') {
			Orientation.lockToPortrait();
			return () => {
				Orientation.unlockAllOrientations();
			};
		}
	}, []);

	const theme = useAppTheme();

	const onNavigationStateChange = React.useCallback((currentState: Object) => {
		const currentScreen = getRouteName(currentState);
		dispatch(screenChange(currentScreen));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const Navigator = React.useMemo((): Object => {
		return prepareNavigator(Stack, {ScreenConfigs, NavigatorConfigs}, props);
		// NOTE: No 'props' passed to PreLoginNavigator from App is dynamically changed.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<NavigationContainer
			onStateChange={onNavigationStateChange}
			theme={theme}>
			{Navigator}
		</NavigationContainer>
	);
}, shouldNavigatorUpdate);

module.exports = PreLoginNavigator;
