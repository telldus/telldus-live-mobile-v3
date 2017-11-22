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

import type { Action } from 'Actions_Types';
import { REHYDRATE } from 'redux-persist';

import { combineReducers } from 'redux';

export type State = ?Object;

const gatewayInitialState = {
	id: null,
	name: null,
	websocketAddress: {
		address: null,
		instance: null,
		port: null,
	},
	websocketOnline: false,
};

function reduceGateway(state: State = {}, action: Action): State {
	switch (action.type) {
		case 'RECEIVED_GATEWAYS':
			return {
				...gatewayInitialState,
				...state,
				...action.payload,
				id: parseInt(action.payload.id, 10),
				online: Boolean(action.payload.online),
			};
		case 'RECEIVED_GATEWAY_WEBSOCKET_ADDRESS':
			const { payload } = action;
			if (payload.address === null) {
				let newState = {
					websocketAddress: {
						address: null,
						instance: null,
						port: null,
					},
				};
				return { ...state, ...newState };
			}
			return {
				...state,
				websocketAddress: {
					address: payload.address,
					instance: payload.instance,
					port: payload.port,
				},
			};
		case 'GATEWAY_WEBSOCKET_OPEN':
			return {
				...state,
				websocketOnline: true,
			};
		case 'GATEWAY_WEBSOCKET_CLOSED':
			return {
				...state,
				websocketOnline: false,
			};
		default:
			return state;
	}
}

function byId(state = {}, action): State {
	if (action.type === REHYDRATE) {
		if (action.payload && action.payload.gateways && action.payload.gateways.byId) {
			console.log('rehydrating gateways.byId');
			return {
				...state,
				...action.payload.gateways.byId,
			};
		}
		return { ...state };
	}
	switch (action.type) {
		case 'RECEIVED_GATEWAYS':
			return action.payload.client.reduce((acc, gateway) => {
				acc[gateway.id] = {
					...reduceGateway(state[gateway.id], {
						type: 'RECEIVED_GATEWAYS',
						payload: gateway,
					}),
				};
				return acc;
			}, {});
		case 'RECEIVED_GATEWAY_WEBSOCKET_ADDRESS':
		case 'GATEWAY_WEBSOCKET_OPEN':
		case 'GATEWAY_WEBSOCKET_CLOSED':
			const { gatewayId } = action;
			return {
				...state,
				[gatewayId]: reduceGateway(state[gatewayId], action),
			};
		case 'LOGGED_OUT':
			return {};
		default:
			return state;
	}
}

function allIds(state = [], action): Array<Object> {
	if (action.type === REHYDRATE) {
		if (action.payload && action.payload.gateways && action.payload.gateways.allIds) {
			console.log('rehydrating gateways.allIds');
			return [
				...state,
				...action.payload.gateways.allIds,
			];
		}
		return [...state];
	}
	switch (action.type) {
		case 'RECEIVED_GATEWAYS':
			// overwrites entire state
			return action.payload.client.map(gateway => gateway.id);
		case 'LOGGED_OUT':
			return [];
		default:
			return state;
	}
}

export function parseGatewaysForListView(gateways:Object = {}) {
	const rows = gateways.allIds.map(gatewayId => gateways.byId[gatewayId]);

	rows.sort((a, b) => {
		if (a.name < b.name) {
			return -1;
		}
		if (a.name > b.name) {
			return 1;
		}
		return 0;
	});
	return rows;
}

export default combineReducers({
	allIds,
	byId,
});
