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

import shouldUpdate from './shouldUpdate';

const navigationRef = React.createRef<any>();

/**
 *
 * Use this method inside any component that does not have the 'navigation' property, where you want to navigate to any registered
 * screen/route.
 */
function navigate(...args: any) {
	if (navigationRef.current && navigationRef.current.navigate) {
		navigationRef.current.navigate(...args);
	}
}

type TabConfigs = {
	ScreenConfigs: Array<Object>,
	NavigatorConfigs?: Object,
};

function prepareNavigator(
	NavigatorBuilder: Object,
	{ScreenConfigs, NavigatorConfigs = {}}: TabConfigs,
	propsFromParent?: Object = {},
): Object {
	const {
		screenProps,
		route = {},
	} = propsFromParent;

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
			<NavigatorBuilder.Screen
				key={`${index}${name}`}
				name={name}
				// eslint-disable-next-line react/jsx-no-bind
				children={(...args: any): Object => {
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
								screenProps={screenProps}
								ScreenName={name}/>
						);
					}

					return (
						<ContainerComponent
							{..._props}
							screenProps={screenProps}
							ScreenName={name}>
							<Component
								ScreenName={name}/>
						</ContainerComponent>
					);
				}}
				options={_options}
				initialParams={route.params}/>
		);
	});

	let _tabBar = NavigatorConfigs.tabBar;
	if (_tabBar) {
		function tabBar(propsDef: Object): Object {
			return NavigatorConfigs.tabBar({
				...propsDef,
				screenProps,
				route,
			});
		}
		_tabBar = tabBar;
	}

	return (
		<NavigatorBuilder.Navigator
			{...NavigatorConfigs}
			tabBar={_tabBar}>
			{SCREENS}
		</NavigatorBuilder.Navigator>
	);
}

const shouldNavigatorUpdate = (prevProps: Object, nextProps: Object, additionalScreenProps?: Array<string> = []): boolean => {
	const flag1 = shouldUpdate(prevProps.screenProps, nextProps.screenProps, [
		'drawer',
		'appLayout',
		'screenReaderEnabled',
		'source',
		...additionalScreenProps,
	]);
	const flag2 = shouldUpdate(prevProps, nextProps, [
		'route',
	]);
	return !flag1 && !flag2;
};

const prepareVisibleTabs = (hiddenList: Array<string> = [], tabToCheck?: string = ''): Object => {
	let visibleTabs = [], mainTabsInOrder = [
			'Dashboard',
			'Devices',
			'Sensors',
			'Scheduler',
		],
		tabToCheckOrVeryNextIndex = mainTabsInOrder.indexOf(tabToCheck),
		_tabToCheckOrVeryNextIndex = tabToCheckOrVeryNextIndex,
		tabToCheckOrVeryNext;

	if (Platform.OS === 'ios') {
		mainTabsInOrder.push('MoreOptionsTab');
	}

	mainTabsInOrder.forEach((tab: string, i: number) => {
		if (hiddenList.indexOf(tab) === -1) {
			visibleTabs.push(tab);
		}
		if (_tabToCheckOrVeryNextIndex === i) {
			if (hiddenList.indexOf(tab) === -1) {
				tabToCheckOrVeryNext = tab;
				tabToCheckOrVeryNextIndex = i;
			} else {
				_tabToCheckOrVeryNextIndex = i + 1;
			}
		}
	});

	const firstVisibleTab = visibleTabs.length > 0 ? visibleTabs[0] : '';

	return {
		visibleTabs,
		firstVisibleTab,
		tabToCheckOrVeryNext,
		tabToCheckOrVeryNextIndex,
	};
};

module.exports = {
	navigate,
	navigationRef,
	prepareNavigator,
	shouldNavigatorUpdate,
	prepareVisibleTabs,
};
