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

async function authoriseWebsocket(gatewayId, sessionId): Promise<Action> {
	return new Promise((resolve, reject) => {
		try {
			resolve( {
				type: 'SEND_WEBSOCKET_MESSAGE',
				gatewayId: gatewayId,
				message: `{"module":"auth","action":"auth","data":{"sessionid":"${sessionId}","clientId":"${gatewayId}"}}`
			});
		} catch(e) {
			reject({
				type: 'ERROR',
				message: e
			});
		}
	});

}

async function addWebsocketFilter(gatewayId, module, action): Promise<Action> {
	return new Promise((resolve, reject) => {
		try {
			resolve( {
				type: 'SEND_WEBSOCKET_MESSAGE',
				gatewayId: gatewayId,
				message: `{"module":"filter","action":"accept","data":{"module":"${module}","action":"${action}"}}`
			});
		} catch(e) {
			reject({
				type: 'ERROR',
				message: e
			});
		}
	});

}

module.exports = { authoriseWebsocket, addWebsocketFilter };
