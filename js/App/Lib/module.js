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
 * @providesModule Lib
 */

'use strict';

import capitalize from './capitalize';
import formatTime from './formatTime';
import { getSelectedDays, getWeekdays, getWeekends } from './getDays';
import getDeviceType from './getDeviceType';
import getDeviceWidth from './getDeviceWidth';
import getPowerParts from './getPowerParts';
import getSuntime from './getSuntime';
import getTabBarIcon from './getTabBarIcon';
import LiveApi from './LiveApi';
import TelldusWebsocket from './Socket';
import getRouteName from './getRouteName';

module.exports = {
	capitalize,
	formatTime,
	getWeekdays,
	getWeekends,
	getSelectedDays,
	getDeviceType,
	getDeviceWidth,
	getPowerParts,
	getSuntime,
	getTabBarIcon,
	LiveApi,
	TelldusWebsocket,
	getRouteName,
};
