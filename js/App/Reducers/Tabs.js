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

import type { Action } from 'Actions_Types';

type State = {
	editModeSensorsTab: boolean,
  editModeDevicesTab: boolean,
};

const initialState: State = {
	editModeSensorsTab: false,
	editModeDevicesTab: false,
};

function toggleEditMode(state: State = initialState, action: Action): State {
	if (action.type === 'TOGGLE_EDIT_MODE') {
		if (action.tab === 'sensorsTab') {
			const newEditModeSensorsTab = !state.editModeSensorsTab;
			return {
				...state,
				editModeSensorsTab: newEditModeSensorsTab,
			};
		} else if (action.tab === 'devicesTab') {
			const newEditModeDevicesTab = !state.editModeDevicesTab;
			return {
				...state,
				editModeDevicesTab: newEditModeDevicesTab,
			};
		}
	}
	if (action.type === 'APP_START') {
		return {
			...state,
			editModeDevicesTab: false,
			editModeSensorsTab: false,
		};
	}
	if (action.type === 'LOGGED_OUT') {
		return {
			...initialState,
		};
	}

	return state;
}

module.exports = toggleEditMode;
