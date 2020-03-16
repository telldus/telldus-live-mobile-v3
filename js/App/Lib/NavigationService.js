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

const navigationRef = React.createRef<any>();

/**
 *
 * @param {*} name : The route name to navigate to. Must have already added to(/registered at) the navigator route configs.
 * @param {*} params : Any extra parameters need to be added, which can be accessed as 'navigation.state.params'.
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
					// TODO: Check the behaviour(Esp Android)
					// Make sure that all screens are re-rendered on
					// screenProps update(Esp currentScreen and appLayout)
					// If not use 'useSelector' from here and merge it along with
					// screenProps from parent.
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

module.exports = {
	navigate,
	navigationRef,
	prepareNavigator,
};
