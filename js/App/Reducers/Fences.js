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

import Immutable from 'seamless-immutable';
import {createReducer} from 'reduxsauce';


export const initialState: Object = Immutable({
	fence: {},
	editIndex: -1,
	location: null,
});

const setArea = (state: Object, action: Object): Object => ({
	...state,
	fence: {
		...state.fence,
		latitude: action.payload.latitude,
		longitude: action.payload.longitude,
		radius: action.payload.radius,
	},
	userId: action.payload.userId,
});

const setArrivingActions = (state: Object, action: Object): Object => ({
	...state,
	fence: {
		...state.fence,
		arriving: action.payload,
	},
});

const setLeavingActions = (state: Object, action: Object): Object => ({
	...state,
	fence: {
		...state.fence,
		leaving: action.payload,
	},
});

const setActiveTime = (state: Object, action: Object): Object => ({
	...state,
	fence: {
		...state.fence,
		isAlwaysActive: action.payload.isAlwaysActive,
		fromHr: action.payload.fromHr,
		fromMin: action.payload.fromMin,
		toHr: action.payload.toHr,
		toMin: action.payload.toMin,
	},
});

const setTitle = (state: Object, action: Object): Object => ({
	...state,
	fence: {
		...state.fence,
		title: action.payload,
	},
});

const setCurrentLocation = (state: Object, action: Object): Object => ({
	...state,
	location: action.payload,
});

const setEditFence = (state: Object, action: Object): Object => {
	const {
		userId,
	} = action.payload;

	return {
		...state,
		fence: action.payload,
		userId,
	};
};

const resetFence = (state: Object, action: Object): Object => ({
	...state,
	fence: {},
});

const setFenceIdentifier = (state: Object, action: Object): Object => {
	return {
		...state,
		fence: {
			...state.fence,
			identifier: action.payload,
		},
	};
};

const rehydrateFence = (state: Object, action: Object): Object => {
	if (action.payload && action.payload.fences) {
		return {
			...state,
			...action.payload.fences,
			fence: {},
		};
	}
	return state;
};

const actionHandlers = {

	['SET_FENCE_AREA']: setArea,
	['SET_FENCE_ARRIVING_ACTIONS']: setArrivingActions,
	['SET_FENCE_LEAVING_ACTIONS']: setLeavingActions,
	['SET_FENCE_ACTIVE_TIME']: setActiveTime,
	['SET_FENCE_TITLE']: setTitle,
	['SET_CURRENT_LOCATION']: setCurrentLocation,
	['SET_EDIT_FENCE']: setEditFence,
	['SET_FENCE_IDENTIFIER']: setFenceIdentifier,
	['RESET_FENCE']: resetFence,
	['persist/REHYDRATE']: rehydrateFence,
};

export default (createReducer(initialState, actionHandlers): Object);
