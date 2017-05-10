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
 * @providesModule Actions/Dashboard
 */

'use strict';

import type { Action } from './types';

type Kind = 'device' | 'sensor';

module.exports = {
	addToDashboard: (kind: Kind, id: Number): Action => ({
		type: 'ADD_TO_DASHBOARD',
		kind,
		id
	}),
	removeFromDashboard: (kind : Kind, id: Number) : Action => ({
		type: 'REMOVE_FROM_DASHBOARD',
		kind,
		id
	}),
	changeSensorDisplayType: (id: Number, displayType: String) : Action => ({
		type: 'CHANGE_SENSOR_DISPLAY_TYPE',
		id,
		displayType
	})
};
