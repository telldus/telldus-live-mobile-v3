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

import React from 'react';
import { Image, Dimensions } from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';

import EmptyView from '../../BaseComponents/EmptyView';
import IconTelldus from '../../BaseComponents/IconTelldus';

const icons = {
	dashboard: {
		active: require('../Components/TabViews/img/tabIcons/dashboard-active.png'),
		inactive: require('../Components/TabViews/img/tabIcons/dashboard-inactive.png'),
	},
	devices: {
		active: require('../Components/TabViews/img/tabIcons/devices-active.png'),
		inactive: require('../Components/TabViews/img/tabIcons/devices-inactive.png'),
	},
	gateways: {
		active: require('../Components/TabViews/img/tabIcons/gateways-active.png'),
		inactive: require('../Components/TabViews/img/tabIcons/gateways-inactive.png'),
	},
	scheduler: {
		active: require('../Components/TabViews/img/tabIcons/scheduler-active.png'),
		inactive: require('../Components/TabViews/img/tabIcons/scheduler-inactive.png'),
	},
	sensors: {
		active: require('../Components/TabViews/img/tabIcons/sensors-active.png'),
		inactive: require('../Components/TabViews/img/tabIcons/sensors-inactive.png'),
	},
};

export default function getTabBarIcon(focused: boolean, tintColor: string, sourceName: string, iconName?: string): Object {
	let {height, width} = Dimensions.get('window');
	let isPortrait = height > width;

	if (iconName) {
		return <IconTelldus
			style={{
				color: tintColor,
				...ifIphoneX({marginTop: isPortrait ? 60 : 5}),
				fontSize: 30,
			}}
			icon={iconName}/>;
	}

	const icon = icons[sourceName];
	if (!icon) {
		return <EmptyView/>;
	}

	return (
		<Image
			source={focused ? icon.active : icon.inactive}
			style={{ tintColor, ...ifIphoneX({marginTop: isPortrait ? 60 : 5}) }}
		/>
	);
}
