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


export const initialState = Immutable({
	fences: [],
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

const saveFence = (state: Object, action: Object): Object => ({
	...state,
	fences: state.fences.concat(state.fence),
	fence: {},
});

const setCurrentLocation = (state: Object, action: Object): Object => ({
	...state,
	location: action.payload,
});

const setEditFence = (state: Object, action: Object): Object => ({
	...state,
	editIndex: action.payload,
	fence: state.fences[action.payload],
});

const deleteFence = (state: Object, action: Object): Object => {
	let fences = state.fences.slice();
	fences.splice(state.editIndex, 1);
	return {
		...state,
		fences: fences,
	};
};

const updateFence = (state: Object, action: Object): Object => {
	let nFences = state.fences.slice();
	nFences.splice(state.editIndex, 1, state.fence);
	return {
		...state,
		fences: nFences,
		fence: {},
		editIndex: -1,
	};
};

const clearFences = (state: Object, action: Object): Object => ({
	...state,
	fences: [],
	fence: {},
	editIndex: -1,
});

const resetFence = (state: Object, action: Object): Object => ({
	...state,
	fence: {},
});

const actionHandlers = {

	['SET_FENCE_AREA']: setArea,
	['SET_FENCE_ARRIVING_ACTIONS']: setArrivingActions,
	['SET_FENCE_LEAVING_ACTIONS']: setLeavingActions,
	['SET_FENCE_ACTIVE_TIME']: setActiveTime,
	['SET_FENCE_TITLE']: setTitle,
	['SAVE_FENCE']: saveFence,
	['SET_CURRENT_LOCATION']: setCurrentLocation,
	['SET_EDIT_FENCE']: setEditFence,
	['DELETE_FENCE']: deleteFence,
	['UPDATE_FENCE']: updateFence,
	['CLEAR_FENCES']: clearFences,
	['RESET_FENCE']: resetFence,

};

export default createReducer(initialState, actionHandlers);
