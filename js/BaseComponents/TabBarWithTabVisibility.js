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

import React, {
	memo,
	useMemo,
	useCallback,
} from 'react';
import {
	ScrollView,
} from 'react-native';
import {
	useSelector,
} from 'react-redux';

import View from './View';
import MainTabBarIOS from './MainTabBarIOS';

import i18n from '../App/Translations/common';

const TabBarWithTabVisibility = memo<Object>((props: Object): Object => {
	const {
		state,
		navigation,
	} = props;
	const {
		routes,
		index,
	} = state;

	const { hiddenTabs = {} } = useSelector((store: Object): Object => store.navigation);
	const { userId } = useSelector((store: Object): Object => store.user);
	const hiddenTabsCurrentUser = hiddenTabs[userId] || [];

	const onPress = useCallback((screen: string) => {
		navigation.navigate(screen);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const tabInfo = useCallback((routeName: string): Object | null => {
		switch (routeName) {
			case 'Dashboard': {
				return {
					iconHint: 'dashboard',
					labelIntl: i18n.dashboard,
					screenName: 'Dashboard',
					tabBarAccesibilityLabelIntl: i18n.dashboardTab,
				};
			}
			case 'Devices': {
				return {
					iconHint: 'devices',
					labelIntl: i18n.devices,
					screenName: 'Devices',
					tabBarAccesibilityLabelIntl: i18n.devicesTab,
				};
			}
			case 'Sensors': {
				return {
					iconHint: 'sensors',
					labelIntl: i18n.sensors,
					screenName: 'Sensors',
					tabBarAccesibilityLabelIntl: i18n.sensorsTab,
				};
			}
			case 'Scheduler': {
				return {
					iconHint: 'scheduler',
					labelIntl: i18n.scheduler,
					screenName: 'Scheduler',
					tabBarAccesibilityLabelIntl: i18n.schedulerTab,
				};
			}
			case 'MoreOptionsTab': {
				return {
					iconName: 'overflow',
					labelIntl: i18n.more,
					screenName: 'MoreOptionsTab',
					tabBarAccesibilityLabelIntl: i18n.more,
				};
			}
			default:
				return null;
		}
	}, []);

	const Tabs = useMemo((): Array<Object> => {
		let _Tabs = [];
		routes.forEach((route: Object, i: number) => {
			const tbInfo = tabInfo(route.name);
			if (tbInfo && hiddenTabsCurrentUser.indexOf(route.name) === -1) {
				_Tabs.push(
					<MainTabBarIOS
						{...tbInfo}
						focused={index === i}
						onPress={onPress}
						key={`${i}`}/>);
			}
		});
		return _Tabs;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [routes, tabInfo, hiddenTabsCurrentUser, hiddenTabsCurrentUser.length, index, onPress]);

	return (
		<View style={{
			height: undefined,
			width: '100%',
		}}>
			<ScrollView
				horizontal
				style={{
					width: '100%',
				}}
				contentContainerStyle={{
					width: '100%',
				}}>
				<View style={{
					width: '100%',
					flexDirection: 'row',
				}}>
					{Tabs}
				</View>
			</ScrollView>
		</View>
	);
});

export default (TabBarWithTabVisibility: Object);
