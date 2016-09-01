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

import type { Action } from './types';
import { apiServer } from 'Config';

async function getGateways(accessToken): Promise<Action> {
	return new Promise((resolve, reject) => {
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
			resolve( {
				type: 'RECEIVED_GATEWAYS',
				gateways: responseData
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

async function getWebsocketAddress(accessToken, gatewayId = null): Promise<Action> {
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
				gatewayWebsocketAddress: responseData.address ? responseData : null
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

module.exports = { getGateways, getWebsocketAddress };
