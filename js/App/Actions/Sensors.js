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
import type { Action } from './Types';
// Sensors actions that are shared by both Web and Mobile.
import { actions } from 'live-shared-data';
const { Sensors } = actions;

const changeDefaultDisplayType = (id: number, displayType: string): Action => {
	return {
		type: 'CHANGE_SENSOR_DEFAULT_DISPLAY_TYPE',
		id,
		displayType,
	};
};

const changeDefaultHistorySettings = (id: number, historySettings: Object): Action => {
	return {
		type: 'CHANGE_SENSOR_DEFAULT_HISTORY_SETTINGS',
		id,
		historySettings,
	};
};

module.exports = {
	...Sensors,
	changeDefaultDisplayType,
	changeDefaultHistorySettings,
};
