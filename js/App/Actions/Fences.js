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
 */

// @flow

'use strict';

export const setFenceArea = (lat: number, lng: number, rad: number, userId: string): Object => ({
	type: 'SET_FENCE_AREA',
	payload: {
		latitude: lat,
		longitude: lng,
		radius: rad,
		userId,
	},
});

export const setFenceArrivingActions = (actions: Object): Object => ({
	type: 'SET_FENCE_ARRIVING_ACTIONS',
	payload: actions,
});

export const setFenceLeavingActions = (actions: Object): Object => ({
	type: 'SET_FENCE_LEAVING_ACTIONS',
	payload: actions,
});

export const setFenceActiveTime = (isAlwaysActive: boolean, fromHr: number, fromMin: number, toHr: number, toMin: number): Object => ({
	type: 'SET_FENCE_ACTIVE_TIME',
	payload: {
		isAlwaysActive: isAlwaysActive,
		fromHr: fromHr,
		fromMin: fromMin,
		toHr: toHr,
		toMin: toMin,
	},
});

export const setFenceTitle = (title: string): Object => ({
	type: 'SET_FENCE_TITLE',
	payload: title,
});

export const setCurrentLocation = (location: Object): Object => ({
	type: 'SET_CURRENT_LOCATION',
	payload: location,
});

export const setEditFence = (fence: Object): Object => ({
	type: 'SET_EDIT_FENCE',
	payload: fence,
});

export const resetFence = (): Object => ({
	type: 'RESET_FENCE',
});
