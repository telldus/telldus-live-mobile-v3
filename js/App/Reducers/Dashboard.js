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

'use strict';

import type { Action } from 'Actions/Types';

type State = {
	devices: Array<Number>,
    sensors: Array<Number>,
};

const initialState: State = {
    devices: [],
    sensors: [],
};

function dashboard(state: State = initialState, action : Action): State {
    if (action.type === 'ADD_TO_DASHBOARD') {
        if (action.kind === 'sensor') {
            if (state.sensors.indexOf(action.id) >= 0) {return state;}

            return {
                ...state,
                sensors: [...state.sensors, action.id],
            };
        } else if (action.kind === 'device') {
            if (state.devices.indexOf(action.id) >= 0) {return state;}

            return {
                ...state,
                devices: [...state.devices, action.id],
            };
        }
	} else if (action.type === 'REMOVE_FROM_DASHBOARD') {
        if (action.kind === 'sensor') {
            return {
                ...state,
                sensors: state.sensors.filter(id => id !== action.id)
            };
        } else if (action.kind === 'device') {
            return {
                ...state,
                devices: state.devices.filter(id => id !== action.id)
            };
        }
    }

    return state;
}

module.exports = dashboard;
