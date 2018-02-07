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

export type State = {
	errorGlobalMessage: any,
	errorGlobalShow: boolean,
	active: boolean,
	orientation: string,
	layout: Object,
	screenReaderEnabled: boolean,
	appVersion: null | string,
};

const initialState = {
	errorGlobalMessage: null,
	errorGlobalShow: false,
	active: true,
	orientation: '',
	layout: {},
	screenReaderEnabled: false,
	appVersion: null,
};

export default function reduceApp(state: State = initialState, action: Action): State {
	if (action.type === 'GLOBAL_ERROR_SHOW') {
		let { customMessage } = action.payload;
		let errorGlobalMessage = customMessage ? customMessage : initialState.errorGlobalMessage;

		return {
			...state,
			errorGlobalShow: true,
			errorGlobalMessage,
		};
	}
	if (action.type === 'GLOBAL_ERROR_HIDE') {
		return {
			...state,
			errorGlobalShow: false,
		};
	}
	if (action.type === 'APP_FOREGROUND') {
		return {
			...state,
			active: true,
		};
	}
	if (action.type === 'APP_BACKGROUND') {
		return {
			...state,
			active: false,
		};
	}
	if (action.type === 'APP_ORIENTATION') {
		return {
			...state,
			orientation: action.value,
		};
	}
	if (action.type === 'APP_LAYOUT') {
		return {
			...state,
			layout: action.payload,
		};
	}
	if (action.type === 'ACCESSIBILITY_INFO') {
		return {
			...state,
			screenReaderEnabled: action.payload,
		};
	}
	if (action.type === 'SET_APP_VERSION') {
		return {
			...state,
			appVersion: action.payload,
		};
	}
	return state;
}

