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
import { Easing, Animated } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import {
	useSelector,
	useDispatch,
} from 'react-redux';

import AddDeviceNavigator from './Device/AddDevice/AddDeviceNavigator';
import { Header } from '../../BaseComponents';
import SettingsNavigator from './Settings/SettingsNavigator';
import ScheduleNavigator from './Schedule/ScheduleNavigator';
import SensorDetailsNavigator from './SensorDetails/SensorDetailsNavigator';
import DeviceDetailsNavigator from './Device/DeviceDetails/DeviceDetailsNavigator';
import AddLocationNavigator from './Location/AddLocation/AddLocationNavigator';
import LocationDetailsNavigator from './Location/LocationDetails/LocationDetailsNavigator';
import TabsView from './TabViews/TabsView';
import RGBControlScreen from './RGBControl/RGBControlScreen';
import ThermostatControl from './ThermostatControl/ThermostatFullControl';
import ProfileNavigator from './Profile/ProfileNavigator';
import AddSensorNavigator from './Sensor/AddSensor/AddSensorNavigator';
import GeoFenceNavigator from './GeoFence/GeoFenceNavigator';

import SettingsContainer from './Settings/SettingsContainer';
import PushSettings from './PushSettings/PushSettings';

import UpdatePasswordScreen from './AccountSettings/UpdatePasswordScreen';
import PremiumBenefitsScreen from './Premium/PremiumBenefitsScreen';
import PremiumUpgradeScreen from './Premium/PremiumUpgradeScreen';
import RedeemGiftScreen from './Premium/RedeemGiftScreen';
import ManageSubscriptionScreen from './Premium/ManageSubscriptionScreen';
import AdditionalPlansPaymentsScreen from './Premium/AdditionalPlansPaymentsScreen';
import SMSHistoryScreen from './Premium/SMSHistoryScreen';
import PurchaseHistoryScreen from './Premium/PurchaseHistoryScreen';
import PostPurchaseScreen from './Premium/PostPurchaseScreen';
import TransactionWebview from './Premium/TransactionWebview';
import RequestSupportScreen from './CustomerSupport/RequestSupportScreen';
import BuySMSCreditsScreen from './Premium/BuySMSCreditsScreen';
import RegisterForPushScreen from './PushSettings/RegisterForPushScreen';

import {
	RegisterScreen,
	LoginScreen,
	WelcomeScreen,
} from './PreLoginScreens';
import {
	FormContainerComponent,
} from './PreLoginScreens/SubViews';

import {
	screenChange,
	syncWithServer,
} from '../Actions';
import {
	useDialogueBox,
} from '../Hooks/Dialoguebox';

import getRouteName from '../Lib/getRouteName';
import {
	navigationRef,
} from '../Lib/NavigationService';

const ScreenConfigs = [
	{
		name: 'Tabs',
		Component: TabsView,
		optionsWithScreenProps: ({ screenProps }: Object): Object => {
			const { hideHeader } = screenProps || {};
			if (hideHeader) { // Android Landscape mode - Custom Header - so return null.
				return {
					headerShown: false,
				};
			}
			return {
				headerShown: true,
				header: (): Object => <Header {...screenProps}/>,
			};
		},
	},
	{
		name: 'Settings',
		Component: SettingsNavigator,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'DeviceDetails',
		Component: DeviceDetailsNavigator,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SensorDetails',
		Component: SensorDetailsNavigator,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'Schedule',
		Component: ScheduleNavigator,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'AddLocation',
		Component: AddLocationNavigator,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'LocationDetails',
		Component: LocationDetailsNavigator,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'AddDevice',
		Component: AddDeviceNavigator,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'AddSensor',
		Component: AddSensorNavigator,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'RGBControl',
		Component: RGBControlScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'ThermostatControl',
		Component: ThermostatControl,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'Profile',
		Component: ProfileNavigator,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'PushSettings',
		Component: PushSettings,
		ContainerComponent: SettingsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'PremiumBenefitsScreen',
		Component: PremiumBenefitsScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'PremiumUpgradeScreen',
		Component: PremiumUpgradeScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'RedeemGiftScreen',
		Component: RedeemGiftScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'ManageSubscriptionScreen',
		Component: ManageSubscriptionScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'AdditionalPlansPaymentsScreen',
		Component: AdditionalPlansPaymentsScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SMSHistoryScreen',
		Component: SMSHistoryScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'PurchaseHistoryScreen',
		Component: PurchaseHistoryScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'PostPurchaseScreen',
		Component: PostPurchaseScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'TransactionWebview',
		Component: TransactionWebview,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'RequestSupportScreen',
		Component: RequestSupportScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'BuySMSCreditsScreen',
		Component: BuySMSCreditsScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'RegisterForPushScreen',
		Component: RegisterForPushScreen,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'GeoFenceNavigator',
		Component: GeoFenceNavigator,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'LoginScreen',
		Component: LoginScreen,
		ContainerComponent: FormContainerComponent,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'RegisterScreen',
		Component: RegisterScreen,
		ContainerComponent: FormContainerComponent,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'Welcome',
		Component: WelcomeScreen,
		ContainerComponent: FormContainerComponent,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'UpdatePasswordScreen',
		Component: UpdatePasswordScreen,
		ContainerComponent: FormContainerComponent,
		options: {
			headerShown: false,
		},
	},
];

const StackNavigatorConfig = {
	initialRouteName: 'Tabs',
	initialRouteKey: 'Tabs',
	cardStyle: {
		shadowColor: 'transparent',
		shadowOpacity: 0,
		elevation: 0,
	},
	headerMode: 'screen',
	transitionConfig: (): Object => ({
		transitionSpec: {
		  duration: 600,
		  easing: Easing.out(Easing.poly(4)),
		  timing: Animated.timing,
		  useNativeDriver: true,
		},
		screenInterpolator: (sceneProps: Object): Object => {
			const { layout, position, scene } = sceneProps;
			const { index } = scene;

			const height = layout.initHeight;
			const translateY = position.interpolate({
				inputRange: [index - 1, index, index + 1],
				outputRange: [height, 0, 0],
			});

			const opacity = position.interpolate({
				inputRange: [index - 1, index - 0.99, index],
				outputRange: [0, 1, 1],
			});

			return { opacity, transform: [{ translateY }] };

		},
	  }),
};

const Stack = createStackNavigator();

const AppNavigator = React.memo<Object>((props: Object): Object => {
	const { screenProps } = props;

	const dispatch = useDispatch();

	function onNavigationStateChange(currentState: Object) {
		const currentScreen = getRouteName(currentState);

		dispatch(syncWithServer(currentScreen));
		dispatch(screenChange(currentScreen));
	}

	const SCREENS = ScreenConfigs.map((screenConf: Object, index: number): Object => {

		const {
			name,
			Component,
			options,
			ContainerComponent,
			optionsWithScreenProps,
		} = screenConf;

		let _options = options;
		if (optionsWithScreenProps) {
			_options = (optionsDefArgs: Object): Object => {
				return optionsWithScreenProps({
					...optionsDefArgs,
					screenProps,
				});
			};
		}

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

					let _props = {};
					args.forEach((arg: Object = {}) => {
						_props = {
							..._props,
							...arg,
						};
					});

					if (!ContainerComponent) {
						return (
							<Component
								{..._props}
								screenProps={{
									...screenProps,
									currentScreen,
									toggleDialogueBox: toggleDialogueBoxState,
								}}/>
						);
					}

					return (
						<ContainerComponent
							{..._props}
							screenProps={{
								...screenProps,
								currentScreen,
								toggleDialogueBox: toggleDialogueBoxState,
							}}>
							<Component/>
						</ContainerComponent>
					);
				}}
				options={_options}/>
		);
	});

	return (
		<NavigationContainer
			ref={navigationRef}
			onStateChange={onNavigationStateChange}>
			<Stack.Navigator
				{...StackNavigatorConfig}>
				{SCREENS}
			</Stack.Navigator>
		</NavigationContainer>
	);
});

export default AppNavigator;
