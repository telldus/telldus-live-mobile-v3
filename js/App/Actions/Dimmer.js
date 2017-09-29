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
 * @providesModule Actions_Dimmer
 */

// @flow

'use strict';

import type { Action, ThunkAction, Dispatch } from './Types';

export const showDimmerPopup = (name: string, value: number): Action => ({
	type: 'SHOW_DIMMER_POPUP',
	name,
	value,
});

export const saveDimmerInitialState = (deviceId: number, initialValue: number, initialState: string): Action => ({
	type: 'SAVE_DIMMER_INITIAL_STATE',
	payload: {
		deviceId,
		initialValue,
		initialState,
	},
});

export const hideDimmerPopup = (): Action => ({
	type: 'HIDE_DIMMER_POPUP',
});

export const setDimmerValue = (id: number, value: number): ThunkAction => (dispatch: Dispatch) => {
	dispatch({
		type: 'SET_DIMMER_VALUE',
		payload: {
			deviceId: id,
			value,
		},
	});
};

