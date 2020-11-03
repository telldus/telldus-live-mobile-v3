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

'use strict';

import getRouteName from './getRouteName';
import getDeviceWidth from './getDeviceWidth';
import hasStatusBar from './hasStatusBar';
import DimmerUtils from './DimmerUtils';
import SensorUtils from './SensorUtils';
import DeviceUtils from './DeviceUtils';
import Accessibility from './Accessibility';
import * as Analytics from './Analytics';
import * as LiveApi from './LiveApi';
import * as daysUtils from './getDays';
import capitalize from './capitalize';
import formatTime from './formatTime';
import getPowerParts from './getPowerParts';
import getTabBarIcon from './getTabBarIcon';
import getDeviceType from './getDeviceType';
import TelldusWebsocket from './Socket';
import getDrawerWidth from './getDrawerWidth';
import getLocationImageUrl from './getLocationImageUrl';
import * as RSA from './RSA';
import scheduleUtils from './scheduleUtils';
import * as LocalApi from './LocalApi';
import * as NavigationService from './NavigationService';
import shouldUpdate from './shouldUpdate';
import * as LayoutAnimations from './LayoutAnimations';
import * as UserUtils from './UserUtils';
import * as LocalControl from './LocalControl';
import * as appUtils from './appUtils';
import * as gatewayUtils from './gatewayUtils';
import * as rgbUtils from './rgbUtils';
import * as thermostatUtils from './thermostatUtils';
import GeoFenceUtils from './GeoFenceUtils';
import * as dashboardUtils from './dashboardUtils';
import * as PushNotification from './PushNotification';
import * as Timer from './Timer';
import * as intlUtils from './intlUtils';
import * as thirdPartyUtils from './thirdPartyUtils';

module.exports = {
	getRouteName,
	getDeviceWidth,
	hasStatusBar,
	capitalize,
	formatTime,
	getPowerParts,
	getTabBarIcon,
	...DimmerUtils,
	...SensorUtils,
	...DeviceUtils,
	...Accessibility,
	...Analytics,
	...LiveApi,
	...daysUtils,
	getDeviceType,
	TelldusWebsocket,
	getDrawerWidth,
	getLocationImageUrl,
	...RSA,
	...scheduleUtils,
	...LocalApi,
	...NavigationService,
	shouldUpdate,
	LayoutAnimations,
	...UserUtils,
	...LocalControl,
	...appUtils,
	...gatewayUtils,
	...rgbUtils,
	...thermostatUtils,
	GeoFenceUtils,
	...dashboardUtils,
	...PushNotification,
	...Timer,
	...intlUtils,
	...thirdPartyUtils,
};
