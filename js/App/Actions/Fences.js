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
 * @providesModule Actions_Geofence
 */

export const setFenceArea = (lat, lng, rad) => ({
    type: 'SET_FENCE_AREA',
    payload: {
        latitude: lat,
        longitude: lng,
        radius: rad
    }
});

export const setFenceArrivingActions = (actions) => ({
    type: 'SET_FENCE_ARRIVING_ACTIONS',
    payload: actions
});

export const setFenceLeavingActions = (actions) => ({
    type: 'SET_FENCE_LEAVING_ACTIONS',
    payload: actions
});

export const setFenceActiveTime = (isAlwaysActive, fromHr, fromMin, toHr, toMin) => ({
    type: 'SET_FENCE_ACTIVE_TIME',
    payload: {
        isAlwaysActive: isAlwaysActive,
        fromHr: fromHr,
        fromMin: fromMin,
        toHr: toHr,
        toMin: toMin
    }
});

export const setFenceTitle = (title) => ({
    type: 'SET_FENCE_TITLE',
    payload: title
});

export const saveFence = () => ({
    type: 'SAVE_FENCE'
});

export const setCurrentLocation = (location) => ({
    type: 'SET_CURRENT_LOCATION',
    payload: location
});

export const setEditFence = (index) => ({
    type: 'SET_EDIT_FENCE',
    payload: index
});

export const deleteFence = () => ({
    type: 'DELETE_FENCE'
});

export const updateFence = () => ({
    type: 'UPDATE_FENCE'
});

export const resetFence = () => ({
    type: 'RESET_FENCE'
});
export const clearFences = () => ({
    type: 'CLEAR_FENCES'
});