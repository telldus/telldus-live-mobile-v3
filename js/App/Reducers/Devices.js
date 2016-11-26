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

export type State = {
	devices: ?object
};

const initialState = [];
const deviceInitialState = {};

function device(state: State = deviceInitialState, action: Action): State {
	switch (action.type) {
		case 'RECEIVED_DEVICES':
			var newDevice = {
				clientId: parseInt(state.client),
				editable: Boolean(state.editable),
				id: parseInt(state.id),
				state: parseInt(state.state),
				stateValue: parseInt(state.stateValue),
				online: Boolean(state.online),
				ignored: Boolean(state.ignored),
				methods: Boolean(state.methods),
				type: state.type,
				name: state.name,
				protocol: state.protocol,
				clientDeviceId: parseInt(state.clientDeviceId),
			};
			return newDevice;
		case 'LOGGED_OUT':
			return deviceInitialState;
		default:
			return state;
	}
}

function devices(state: State = initialState, action: Action): State {
	if (action.type === 'RECEIVED_DEVICES') {
		return action.payload.device.map(deviceState =>
			device(deviceState, action)
		);
	}
	if (action.type === 'LOGGED_OUT') {
		return {
			...initialState
		};
	}
	return state;
}

module.exports = devices;
