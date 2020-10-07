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

import omit from 'lodash/omit';

import type { Action } from '../Actions/Types';

type State = {
	screen: string,
	hiddenTabs: Object,
	defaultStartScreen: Object,
};

const initialState: State = {
	screen: 'Login',
	hiddenTabs: {},
	defaultStartScreen: {
		screenKey: '',
		screenName: '',
	},
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
			screen: 'Dashboard', // TODO: Handle when tabs are hidden
		};
	}
	if (action.type === 'HIDE_TAB') {
		const {
			userId,
			tab,
		} = action.payload;
		const _hiddenTabs = state.hiddenTabs || {};
		let hiddenTabCurrentUser = _hiddenTabs[userId] || [];
		let _hiddenTabCurrentUser = [...hiddenTabCurrentUser, tab];
		if (_hiddenTabCurrentUser.indexOf(tab) === -1) {
			_hiddenTabCurrentUser = [...hiddenTabCurrentUser, tab];
		}

		return {
			...state,
			hiddenTabs: {
				..._hiddenTabs,
				[userId]: _hiddenTabCurrentUser,
			},
		};
	}
	if (action.type === 'UNHIDE_TAB') {
		const {
			userId,
			tab,
		} = action.payload;
		const _hiddenTabs = state.hiddenTabs || {};
		let hiddenTabCurrentUser = _hiddenTabs[userId] || [];
		let _hiddenTabCurrentUser = hiddenTabCurrentUser.filter((_tab: string): boolean => _tab !== tab);

		return {
			...state,
			hiddenTabs: {
				..._hiddenTabs,
				[userId]: _hiddenTabCurrentUser,
			},
		};

	}
	if (action.type === 'CHANGE_DEFAULT_START_SCREEN') {
		const {
			screenKey,
			userId,
		} = action.payload;
		const _defaultStartScreen = state.defaultStartScreen || {};
		let defaultStartScreenCurrentUser = _defaultStartScreen[userId] || {};

		return {
			...state,
			defaultStartScreen: {
				..._defaultStartScreen,
				[userId]: {
					...defaultStartScreenCurrentUser,
					screenKey,
				},
			},
		};
	}
	if (action.type === 'LOGGED_OUT_SELECTED') {
		let { userId } = action.payload;
		const { hiddenTabs = {} } = state;

		return {
			...state,
			hiddenTabs: omit(hiddenTabs, userId),
		};
	}
	if (action.type === 'LOGGED_OUT') {
		return {
			...state,
			screen: 'Login',
		};
	}
	return state;
}

module.exports = navigation;
