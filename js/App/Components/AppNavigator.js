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
import { createCompatNavigatorFactory } from '@react-navigation/compat';

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

const RouteConfigs = {
	Tabs: {
		screen: TabsView,
		navigationOptions: ({screenProps, navigation, navigationOptions}: Object): Object => {
			const { hideHeader } = screenProps;
			if (hideHeader) { // Android Landscape mode - Custom Header - so return null.
				return {
					headerStyle: {
						height: 0,
						width: 0,
						borderBottomWidth: 0,
					},
					headerShown: false,
				};
			}
			return {
				header: (): Object => {
					return (
						<Header
							navigation={navigation}
							navigationOptions={navigationOptions}
							{...screenProps}/>
					);
				},
			};
		},
	},
	Settings: {
		// In addition to 'header: undefined' If header style is not manually set so, it cause some empty space to show in iPhoneX
		screen: SettingsNavigator,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	DeviceDetails: {
		screen: DeviceDetailsNavigator,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	SensorDetails: {
		screen: SensorDetailsNavigator,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	Schedule: {
		screen: ScheduleNavigator,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	AddLocation: {
		screen: AddLocationNavigator,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	LocationDetails: {
		screen: LocationDetailsNavigator,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	AddDevice: {
		screen: AddDeviceNavigator,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	AddSensor: {
		screen: AddSensorNavigator,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	RGBControl: {
		screen: RGBControlScreen,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	ThermostatControl: {
		screen: ThermostatControl,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	Profile: {
		screen: ProfileNavigator,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	PushSettings: {
		screen: ({ navigation, screenProps }: Object): Object => renderScheduleScreen(navigation, screenProps)(PushSettings, 'PushSettings'),
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	UpdatePasswordScreen: {
		screen: UpdatePasswordScreen,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	PremiumBenefitsScreen: {
		screen: PremiumBenefitsScreen,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	PremiumUpgradeScreen: {
		screen: PremiumUpgradeScreen,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	RedeemGiftScreen: {
		screen: RedeemGiftScreen,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	ManageSubscriptionScreen: {
		screen: ManageSubscriptionScreen,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	AdditionalPlansPaymentsScreen: {
		screen: AdditionalPlansPaymentsScreen,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	SMSHistoryScreen: {
		screen: SMSHistoryScreen,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	PurchaseHistoryScreen: {
		screen: PurchaseHistoryScreen,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	PostPurchaseScreen: {
		screen: PostPurchaseScreen,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	TransactionWebview: {
		screen: TransactionWebview,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	RequestSupportScreen: {
		screen: RequestSupportScreen,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	BuySMSCreditsScreen: {
		screen: BuySMSCreditsScreen,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	RegisterForPushScreen: {
		screen: RegisterForPushScreen,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	GeoFenceNavigator: {
		screen: GeoFenceNavigator,
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	LoginScreen: {
		screen: ({ navigation, screenProps }: Object): Object => renderFormContainer(navigation, screenProps)(LoginScreen),
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	RegisterScreen: {
		screen: ({ navigation, screenProps }: Object): Object => renderFormContainer(navigation, screenProps)(RegisterScreen),
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
	Welcome: {
		screen: ({ navigation, screenProps }: Object): Object => renderFormContainer(navigation, screenProps)(WelcomeScreen),
		navigationOptions: {
			headerStyle: {
				height: 0,
				width: 0,
				borderBottomWidth: 0,
			},
			headerShown: false,
		},
	},
};

type renderContainer = (Object) => Object;

const renderFormContainer = (navigation: Object, screenProps: Object): renderContainer => (Component: Object): Object => (
	<FormContainerComponent navigation={navigation} screenProps={screenProps}>
		<Component/>
	</FormContainerComponent>
);

const renderScheduleScreen = (navigation: Object, screenProps: Object): Function => (Component: Object, ScreenName: string): Object => (
	<SettingsContainer navigation={navigation} screenProps={screenProps} ScreenName={ScreenName}>
		<Component/>
	</SettingsContainer>
);

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

const Navigator = createCompatNavigatorFactory(createStackNavigator)(RouteConfigs, StackNavigatorConfig);

export default Navigator;
