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

import { connect } from 'react-redux';
import type { Action, ThunkAction } from './types';
import { apiServer } from 'Config';
import uuid from 'uuid';

function updateGateways(gateways) {
	return {
		type: 'RECEIVED_GATEWAYS',
		gateways: gateways
	}
}

function getGateways(accessToken): ThunkAction {
	return dispatch => {
		fetch(
			`${apiServer}/oauth2/clients/list`,
			{
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + accessToken.access_token
				}
			}
		)
		.then((response) => response.text())
		.then((text) => JSON.parse(text))
		.then((responseData) => {
			if (responseData.error) {
				throw responseData;
			}
			const sessionId = uuid.v4();
			dispatch(authenticateSession(accessToken, sessionId))
			.then((authenticateSessionResponse) => {
				if (authenticateSessionResponse.data.status && authenticateSessionResponse.data.status == 'success') {
					responseData.client.forEach((gateway) => {
						dispatch(getWebsocketAddress(accessToken, gateway.id, sessionId));
					});
				}
				return dispatch(updateGateways(responseData));
			});
		})
		.catch(function (e) {
			return {
				type: 'ERROR',
				message: e
			};
		});
	};

}

async function authenticateSession(accessToken, sessionId): Promise<Action> {
	return new Promise((resolve, reject) => {
		fetch(
			`${apiServer}/oauth2/user/authenticateSession?session=${sessionId}`,
			{
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + accessToken.access_token
				}
			}
		)
		.then((response) => response.text())
		.then((text) => JSON.parse(text))
		.then((responseData) => {
			if (responseData.error) {
				throw responseData;
			}
			resolve({
				type: 'RECEIVED_AUTHENTICATE_SESSION_RESPONSE',
				data: responseData
			});
		})
		.catch(function (e) {
			reject({
				type: 'ERROR',
				message: e
			});
		});
	});

}

async function getWebsocketAddress(accessToken, gatewayId, sessionId): Promise<Action> {
	return new Promise((resolve, reject) => {
		fetch(
			`${apiServer}/oauth2/client/serverAddress?id=${gatewayId}`,
			{
				method: 'GET',
				headers: {
					'Authorization': 'Bearer ' + accessToken.access_token
				}
			}
		)
		.then((response) => response.text())
		.then((text) => JSON.parse(text))
		.then((responseData) => {
			if (responseData.error) {
				throw responseData;
			}
			resolve( {
				type: 'RECEIVED_GATEWAY_WEBSOCKET_ADDRESS',
				gatewayId: gatewayId,
				gatewayWebsocketAddress: responseData.address ? responseData : {},
				sessionId: sessionId
			});
		})
		.catch(function (e) {
			reject({
				type: 'ERROR',
				message: e
			});
		});
	});

}

module.exports = { updateGateways, getGateways };


