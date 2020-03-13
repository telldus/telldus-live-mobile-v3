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
import { createMaterialTopTabNavigator, MaterialTopTabBar } from '@react-navigation/material-top-tabs';
import {
	useSelector,
} from 'react-redux';

import {
	View,
	TabBar,
} from '../../../BaseComponents';
import AppTab from './AppTab';
import ProfileTab from './ProfileTab';
import SupportTab from './SupportTab';
import ProfileHeaderPoster from './SubViews/ProfileHeaderPoster';

import {
	useDialogueBox,
} from '../../Hooks/Dialoguebox';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

const TabConfigs = [
	{
		name: 'AppTab',
		Component: AppTab,
		options: {
			tabBarLabel: ({color}: Object): Object => {
				return (
					<TabBar
						icon="phone"
						tintColor={color}
						label={i18n.labelApp}
						accessibilityLabel={i18n.labelAccessibleAppTab}/>
				);
			},
		},
	},
	{
		name: 'ProfileTab',
		Component: ProfileTab,
		options: {
			tabBarLabel: ({color}: Object): Object => {
				return (
					<TabBar
						icon="user"
						tintColor={color}
						label={i18n.labelProfile}
						accessibilityLabel={i18n.labelAccessibleProfileTab}/>
				);
			},
		},
	},
	{
		name: 'SupportTab',
		Component: SupportTab,
		options: {
			tabBarLabel: ({color}: Object): Object => {
				return (
					<TabBar
						icon="faq"
						tintColor={color}
						label={i18n.userHelp}
						accessibilityLabel={i18n.labelAccessibleSupportTab}/>
				);
			},
		},
	},
];

const TabNavigatorConfig = {
	initialRouteName: 'AppTab',
	initialRouteKey: 'AppTab',
	tabBarPosition: 'top',
	swipeEnabled: false,
	lazy: true,
	animationEnabled: true,
	tabBar: ({ tabStyle, labelStyle, ...rest }: Object): Object => {
		let { screenProps } = rest,
			tabWidth = 0, fontSize = 0, paddingVertical = 0;
		if (screenProps && screenProps.appLayout) {
			const { width, height } = screenProps.appLayout;
			const isPortrait = height > width;
			const deviceWidth = isPortrait ? width : height;

			tabWidth = width / 3;
			fontSize = deviceWidth * 0.03;
			paddingVertical = 10 + (fontSize * 0.5);
		}
		return (
			<View style={{flex: 0}}>
				<ProfileHeaderPoster {...rest}/>
				<MaterialTopTabBar {...rest}
					tabStyle={{
						...tabStyle,
						width: tabWidth,
						paddingVertical,
					}}
					labelStyle={{
						...labelStyle,
						fontSize,
					}}
				/>
			</View>
		);
	},
	tabBarOptions: {
		indicatorStyle: {
			backgroundColor: '#fff',
		},
		style: {
			backgroundColor: '#fff',
			...Theme.Core.shadow,
			justifyContent: 'center',
		},
		tabStyle: {
			alignItems: 'center',
			justifyContent: 'center',
		},
		upperCaseLabel: false,
		scrollEnabled: true,
		activeTintColor: Theme.Core.brandSecondary,
		inactiveTintColor: Theme.Core.inactiveTintColor,
		showIcon: false,
		allowFontScaling: false,
	},
};

const Tab = createMaterialTopTabNavigator();

const ProfileNavigator = React.memo<Object>((props: Object): Object => {
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

	function tabBar(propsDef: Object): Object {
		return TabNavigatorConfig.tabBar({
			...propsDef,
			screenProps,
		});
	}

	return (
		<Tab.Navigator
			{...TabNavigatorConfig}
			tabBar={tabBar}>
			{TABS}
		</Tab.Navigator>
	);
});

export default ProfileNavigator;
