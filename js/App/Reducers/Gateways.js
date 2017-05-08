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

export type State = ?Object;

const initialState = [];
const gatewayInitialState = {
	id: null,
	name: null,
	websocketAddress: {
		address: null,
		instance: null,
		port: null
	}
};

function gateway(state: State = gatewayInitialState, action: Action): State {
	switch (action.type) {
		case 'RECEIVED_GATEWAYS':
			state.id = parseInt(state.id, 10);
			return {...gatewayInitialState, ...state};
		case 'RECEIVED_GATEWAY_WEBSOCKET_ADDRESS':
			const payload = action.payload;
			if (state.id !== payload.gatewayId) {
				return state;
			}
			if (payload.address === null) {
				let newState = {
					websocketAddress: {
						address: null,
						instance: null,
						port: null
					}
				};
				return {...state, ...newState};
			}
			return Object.assign({}, state, {
				websocketAddress: {
					address: payload.address,
					instance: payload.instance,
					port: payload.port
				}
			});
		case 'LOGGED_OUT':
			return gatewayInitialState;
		default:
			return state;
	}
}

function gateways(state: State = initialState, action: Action): State {
	switch (action.type) {
		case 'RECEIVED_GATEWAYS':
			return action.payload.client.map(gatewayState =>
				gateway(gatewayState, action)
			);
		case 'RECEIVED_GATEWAY_WEBSOCKET_ADDRESS':
			return state.map(gatewayState =>
				gateway(gatewayState, action)
			);
		case 'LOGGED_OUT':
			return initialState;
		default:
			return state;
	}
}

export default gateways;
