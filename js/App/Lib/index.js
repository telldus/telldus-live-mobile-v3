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
import getDeviceHeight from './getDeviceHeight';
import hasStatusBar from './hasStatusBar';
import Dimmer from './Dimmer';
import SensorUtils from './SensorUtils';
import DeviceUtils from './DeviceUtils';
import Accessibility from './Accessibility';
import * as Analytics from './Analytics';
import * as LiveApi from './LiveApi';
import * as daysUtils from './getDays';
import capitalize from './capitalize';
import formatTime from './formatTime';
import getPowerParts from './getPowerParts';
import getSuntime from './getSuntime';
import getTabBarIcon from './getTabBarIcon';
import getRelativeDimensions from './getRelativeDimensions';
import getDeviceType from './getDeviceType';
import TelldusWebsocket from './Socket';
import getDrawerWidth from './getDrawerWidth';
import getLocationImageUrl from './getLocationImageUrl';
import * as RSA from './RSA';
import scheduleUtils from './scheduleUtils';
import * as LocalApi from './LocalApi';
import * as NavigationService from './NavigationService';
import shouldUpdate from './shouldUpdate';


module.exports = {
	getRouteName,
	getDeviceWidth,
	getDeviceHeight,
	hasStatusBar,
	capitalize,
	formatTime,
	getPowerParts,
	getSuntime,
	getTabBarIcon,
	getRelativeDimensions,
	...Dimmer,
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
};
