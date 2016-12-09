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

import type { ThunkAction } from './types';
import uuid from 'react-native-uuid';

function getGateways(): ThunkAction {
	return (dispatch) => {
		const payload = {
			url: '/clients/list',
			requestParams: {
				method: 'GET'
			}
		};
		return dispatch({
			type: 'LIVE_API_CALL',
			returnType: 'RECEIVED_GATEWAYS',
			payload: payload,
			callback: (responseData) => {
				const sessionId = uuid.v4();
				dispatch(authenticateSession(sessionId, responseData));
			}
		});
	};
}

function authenticateSession(sessionId, responseData): ThunkAction {
	return (dispatch) => {
		const payload = {
			url: `/user/authenticateSession?session=${sessionId}`,
			requestParams: {
				method: 'GET'
			}
		};
		dispatch({
			type: 'LIVE_API_CALL',
			returnType: 'RECEIVED_AUTHENTICATE_SESSION_RESPONSE',
			payload: payload,
			callback: (authenticateSessionResponse) => {
				if (authenticateSessionResponse.status && authenticateSessionResponse.status == 'success') {
					responseData.client.forEach((gateway) => {
						dispatch(getWebsocketAddress(gateway.id, sessionId));
					});
				}
			}
		});
	};
}

function getWebsocketAddress(gatewayId, sessionId): ThunkAction {
	return (dispatch) => {
		const payload = {
			url: `/client/serverAddress?id=${gatewayId}`,
			requestParams: {
				method: 'GET'
			}
		};
		return dispatch({
			type: 'LIVE_API_CALL',
			returnType: 'RECEIVED_GATEWAY_WEBSOCKET_ADDRESS',
			payload: payload,
			returnPayload: {
				gatewayId: gatewayId,
				sessionId: sessionId
			}
		});
	};
}

module.exports = { getGateways };


