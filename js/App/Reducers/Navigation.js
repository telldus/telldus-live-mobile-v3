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

import type { Action } from '../Actions/Types';

type State = {
	screen: string,
};

const initialState: State = {
	screen: 'Login',
};

function navigation(state: State = initialState, action: Action): State {
	if (action.type === 'CHANGE_SCREEN') {
		return {
			...state,
			screen: action.screen,
		};
	}
	// From react navigation v5 onwards when navigator is rendered the first time
	// state change is not called we might not save the correct screen.
	// This is a work around to prevent it.
	if (action.type === 'APP_START') {
		return {
			...state,
			screen: 'Dashboard',
		};
	}
	return state;
}

module.exports = navigation;
