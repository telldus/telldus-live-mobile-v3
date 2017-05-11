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
 * @providesModule Actions/Gateways
 */

'use strict';

import type { ThunkAction } from './types';
import { setupGatewayConnection } from 'Actions/Websockets';

import LiveApi from 'LiveApi';
import { format } from 'url';

function getGateways(): ThunkAction {
	return (dispatch, getState) => {
		const url = format({
			pathname: '/clients/list',
			query: {
				extras: 'timezone,suntime',
			},
		});
		const payload = {
			url,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => {
			dispatch({
				type: 'RECEIVED_GATEWAYS',
				payload: {
					...payload,
					...response,
				},
			});
			response.client.forEach(gateway => {
				dispatch(getWebsocketAddress(gateway.id));
			});
		});
	};
}

function getWebsocketAddress(gatewayId): ThunkAction {
	return (dispatch, getState) => {
		const payload = {
			url: `/client/serverAddress?id=${gatewayId}`,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => {
			dispatch({
				type: 'RECEIVED_GATEWAY_WEBSOCKET_ADDRESS',
				payload: {
					...payload,
					...response,
				},
			});
			const { address, port } = response;
			if (address && port) {
				const websocketUrl = `ws://${address}:${port}/websocket`;
				dispatch(setupGatewayConnection(gatewayId, websocketUrl));
			}
		});
	};
}

module.exports = { getGateways };
