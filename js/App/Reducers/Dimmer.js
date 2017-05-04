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

import type { Action } from '../actions/types';

type State = {
    show: Boolean,
    value: Number
};

const initialState: State = {
    show: false,
    value: 0
};

function dimmer(state: State = initialState, action: Action): State {
	if (action.type === 'SHOW_DIMMER_POPUP') {
        return {
            ...state,
            show: true
        };
    } else if (action.type === 'HIDE_DIMMER_POPUP') {
        return {
            ...state,
            show: false
        };
	} else if (action.type === 'SET_DIMMER_VALUE') {
        return {
            ...state,
            value: action.value
        };
    }

	return state;
}

module.exports = dimmer;
