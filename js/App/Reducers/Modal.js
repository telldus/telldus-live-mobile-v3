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

export type State = {
	openModal: boolean,
	data: any,
	extras?: any,
};
const initialState = {
	openModal: false,
	data: '',
	extras: false,
};

export default function reduceModal(state: State = initialState, action: Action): State {
	switch (action.type) {
		case 'REQUEST_MODAL_OPEN':
			let extras = action.payload.extras ? action.payload.extras : false;
			let data = action.payload.data ? action.payload.data : '';
			return {
				...state,
				openModal: true,
				data,
				extras,
			};

		case 'REQUEST_MODAL_CLOSE':
			return {
				...state,
				openModal: false,
			};

		case 'REQUEST_MODAL_CLEAR_DATA':
			return initialState;

		default:
			return state;
	}

}
