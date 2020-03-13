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
 */

// @flow

'use strict';

import React from 'react';
import {
	useSelector,
} from 'react-redux';

import { ifIphoneX } from 'react-native-iphone-x-helper';
import DeviceInfo from 'react-native-device-info';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TabViews from './index';

import {
	useDialogueBox,
} from '../../Hooks/Dialoguebox';
import { getTabBarIcon } from '../../Lib';

import i18n from '../../Translations/common';

const TabConfigs = [
	{
		name: 'Dashboard',
		Component: TabViews.Dashboard,
		optionsWithScreenProps: ({screenProps}: Object): Object => {
			const { intl, currentScreen } = screenProps;
			const { formatMessage } = intl;
			const postScript = currentScreen === 'Dashboard' ? formatMessage(i18n.labelActive) : formatMessage(i18n.defaultDescriptionButton);
			return {
				title: formatMessage(i18n.dashboard),
				tabBarIcon: ({ focused, color }: Object): Object => getTabBarIcon(focused, color, 'dashboard'),
				tabBarAccessibilityLabel: `${formatMessage(i18n.dashboardTab)}, ${postScript}`,
			};
		},
	},
	{
		name: 'Devices',
		Component: TabViews.Devices,
		optionsWithScreenProps: ({screenProps}: Object): Object => {
			const { intl, currentScreen } = screenProps;
			const { formatMessage } = intl;
			const postScript = currentScreen === 'Devices' ? formatMessage(i18n.labelActive) : formatMessage(i18n.defaultDescriptionButton);
			return {
				title: formatMessage(i18n.devices),
				tabBarIcon: ({ focused, color }: Object): Object => getTabBarIcon(focused, color, 'devices'),
				tabBarAccessibilityLabel: `${formatMessage(i18n.devicesTab)}, ${postScript}`,
			};
		},
	},
	{
		name: 'Sensors',
		Component: TabViews.Sensors,
		optionsWithScreenProps: ({screenProps}: Object): Object => {
			const { intl, currentScreen } = screenProps;
			const { formatMessage } = intl;
			const postScript = currentScreen === 'Sensors' ? formatMessage(i18n.labelActive) : formatMessage(i18n.defaultDescriptionButton);
			return {
				title: formatMessage(i18n.sensors),
				tabBarIcon: ({ focused, color }: Object): Object => getTabBarIcon(focused, color, 'sensors'),
				tabBarAccessibilityLabel: `${formatMessage(i18n.sensorsTab)}, ${postScript}`,
			};

		},
	},
	{
		name: 'Scheduler',
		Component: TabViews.Scheduler,
		optionsWithScreenProps: ({screenProps}: Object): Object => {
			const { intl, currentScreen } = screenProps;
			const { formatMessage } = intl;
			const postScript = currentScreen === 'Scheduler' ? formatMessage(i18n.labelActive) : formatMessage(i18n.defaultDescriptionButton);
			return {
				title: formatMessage(i18n.scheduler),
				tabBarIcon: ({ focused, color }: Object): Object => getTabBarIcon(focused, color, 'scheduler'),
				tabBarAccessibilityLabel: `${formatMessage(i18n.schedulerTab)}, ${postScript}`,
			};
		},
	},
	{
		name: 'Gateways',
		Component: TabViews.Gateways,
		optionsWithScreenProps: ({screenProps}: Object): Object => {
			const { intl, currentScreen } = screenProps;
			const { formatMessage } = intl;
			const postScript = currentScreen === 'Gateways' ? formatMessage(i18n.labelActive) : formatMessage(i18n.defaultDescriptionButton);
			return {
				title: formatMessage(i18n.gateways),
				tabBarIcon: ({ focused, color }: Object): Object => getTabBarIcon(focused, color, 'gateways'),
				tabBarAccessibilityLabel: `${formatMessage(i18n.gatewaysTab)}, ${postScript}`,
			};
		},
	},
];

const TabNavigatorConfig = {
	initialRouteName: 'Dashboard',
	initialRouteKey: 'Dashboard', // Check if exist in v5
	swipeEnabled: false, // Check if exist in v5
	lazy: true,
	animationEnabled: false, // Check if exist in v5
	tabBarOptions: {
		activeTintColor: '#e26901',
		style: {
			...ifIphoneX({height: 20}),
		},
		labelStyle: {
			fontSize: DeviceInfo.isTablet() ? 18 : 12,
		},
		allowFontScaling: false,
	},
};

const Tab = createBottomTabNavigator();

const TabsView = React.memo<Object>((props: Object): Object => {
	const {
		screenProps,
	} = props;

	const TABS = TabConfigs.map((tabConf: Object, index: number): Object => {
		const {
			name,
			Component,
			options,
			ContainerComponent,
			optionsWithScreenProps,
		} = tabConf;

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
			<Tab.Screen
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
		<Tab.Navigator
			{...TabNavigatorConfig}>
			{TABS}
		</Tab.Navigator>
	);
});

module.exports = TabsView;
