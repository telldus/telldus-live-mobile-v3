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
import {
	createStackNavigator,
	CardStyleInterpolators,
} from '@react-navigation/stack';
import Orientation from 'react-native-orientation-locker';
import { NavigationContainer } from '@react-navigation/native';
import {
	useDispatch,
} from 'react-redux';

import { LoginScreen, RegisterScreen, ForgotPasswordScreen, WelcomeScreen } from './PreLoginScreens';
import { FormContainerComponent } from './PreLoginScreens/SubViews';
import ChangeLogScreen from './ChangeLog/ChangeLog';

import {
	screenChange,
} from '../Actions/Navigation';
import {
	prepareNavigator,
	shouldNavigatorUpdate,
	getCurrentRouteName,
	navigationRefPrelogin,
	isReadyRefPrelogin,
} from '../Lib/NavigationService';

import {
	useAppTheme,
} from '../Hooks/Theme';

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
	{
		name: 'ChangeLogScreen',
		Component: ChangeLogScreen,
		options: {
			headerShown: false,
			cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
		},
	},
];

const NavigatorConfigs = {
	initialRouteName: 'Login',
	headerMode: 'none',
};

const Stack = createStackNavigator();

type Props = {
	screenProps: Object,
	changeLogVersion: string,
	showChangeLog: boolean,
};

const initProps: Object = {
};

const PreLoginNavigator = React.memo<Object>((props: Props = initProps): Object => {
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

	const onNavigationStateChange = React.useCallback(() => {
		const currentScreen = getCurrentRouteName();
		dispatch(screenChange(currentScreen));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const {
		showChangeLog,
		changeLogVersion,
	} = props.screenProps;
	const Navigator = React.useMemo((): Object => {
		return prepareNavigator(Stack, {ScreenConfigs, NavigatorConfigs}, props);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		showChangeLog,
		changeLogVersion,
	]);

	const onReady = React.useCallback(() => {
		isReadyRefPrelogin.current = true;
		if (navigationRefPrelogin && navigationRefPrelogin.current && navigationRefPrelogin.current.getCurrentRoute) {
			const currentScreen = navigationRefPrelogin.current.getCurrentRoute().name;
			dispatch(screenChange(currentScreen));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<NavigationContainer
			ref={navigationRefPrelogin}
			onStateChange={onNavigationStateChange}
			theme={theme}
			onReady={onReady}>
			{Navigator}
		</NavigationContainer>
	);
}, (prevProps: Object, nextProps: Object): boolean => shouldNavigatorUpdate(prevProps, nextProps, [
	'showChangeLog',
	'changeLogVersion',
]));

module.exports = (PreLoginNavigator: Object);
