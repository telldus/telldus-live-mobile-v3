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
	message: any,
	showToast: boolean,
	duration: 'SHORT' | 'LONG',
	position: 'TOP' | 'CENTER' | 'BOTTOM',
};

const initialState = {
	message: false,
	showToast: false,
	duration: 'SHORT',
	position: 'TOP',
};

export default function reduceApp(state: State = initialState, action: Action): State {
	if (action.type === 'TOAST_SHOW') {
		let message = action.payload.message ? action.payload.message : false;
		return {
			...state,
			showToast: true,
			message,
			duration: action.payload.duration,
			position: action.payload.position,
		};
	}
	if (action.type === 'TOAST_HIDE') {
		return {
			...state,
			showToast: false,
		};
	}
	return state;
}

