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
 */

// @flow

'use strict';

import { Platform, NetInfo } from 'react-native';
import { reportException } from '../Lib/Analytics';
import { getTokenForLocalControl, hasTokenExpired } from '../Lib/LocalControl';
import type { ThunkAction, Action } from './Types';

// Gateways actions that are shared by both Web and Mobile.
import { actions } from 'live-shared-data';
const { Gateways } = actions;

import dgram from 'dgram';

let socket: Object = {};
let openSocketID = null;
const broardcastAddress = '255.255.255.255';
const broardcastPort = 30303;
const STATE = {
	UNBOUND: 0,
	BINDING: 1,
	BOUND: 2,
};

function autoDetectLocalTellStick(): ThunkAction {
	return (dispatch: Function, getState: Function) => {
		// Establish new UDP socket only after closing the existing socket completely.
		closeUDPSocket(() => {
			// $FlowFixMe
			socket = dgram.createSocket({
				type: 'udp4',
				reuseAddr: true,
				reusePort: true,
			});
			// $FlowFixMe
			openSocketID = socket._id;
			const aPort = randomPort();

			// $FlowFixMe
			socket.bind(aPort, (err: string) => {
				if (err) {
					reportException(err);
				}
			});
			socket.once('listening', () => {
				// Important to check connectivity right before send.
				NetInfo.getConnectionInfo().then((connectionInfo: Object) => {
					if ((socket._id === openSocketID) && (connectionInfo.type !== 'none')) {
						if ((Platform.OS !== 'android') && (socket._state === STATE.BOUND)) {
							socket.setBroadcast(true);
						}

						let buf = toByteArray('D');
						socket.send(buf, 0, buf.length, broardcastPort, broardcastAddress, (err: any) => {
							if (err) {
								reportException(err);
							}
						});
					}
				});
			});

			socket.on('message', (msg: any, rinfo: Object) => {
				let str = String.fromCharCode.apply(null, new Uint8Array(msg));
				let items = str.split(':');
				let gatewayInfo = {
					product: items[0] ? items[0] : null,
					macAddress: items[1] ? items[1] : null,
					activationCode: items[2] ? items[2] : null,
					firmwareVersion: items[3] ? items[3] : null,
					uuid: items[4] ? items[4] : null,
				};
				dispatch(autoDetectLocalTellStickSuccess(gatewayInfo, rinfo));

				let { gateways: { byId: gateways } } = getState();
				for (let key in gateways) {
					let item = gateways[key];
					let { uuid, id, websocketOnline, websocketConnected, localKey } = item;
					if (localKey) {
						let { key: token, ttl } = localKey;
						if (items[4] && uuid && (items[4] === uuid)) {
							if (websocketOnline && websocketConnected && !token) {
								dispatch(getTokenForLocalControl(id));
							}
							const tokenExpired = hasTokenExpired(ttl);
							if (websocketOnline && websocketConnected && token && ttl && tokenExpired) {
								dispatch(getTokenForLocalControl(id));
							}
						}
					}
				}
			});
		});
	};
}

/**
 *
 * @param {Funcition} callback = Optional function to be called after socket is closed, or right away if socket is already closed.
 */
function closeUDPSocket(callback?: Function | null = null) {
	if (socket && socket.close) {
		// $FlowFixMe
		let closingSocketId = socket._id;
		socket.close(() => {
			if (closingSocketId === openSocketID) {
				openSocketID = null;
			}

			if (callback && typeof callback === 'function') {
				callback();
			}
		});
	} else if (callback && typeof callback === 'function') {
		callback();
	}
}

function toByteArray(obj: string): any {
	let uint = new Uint8Array(obj.length);
	for (let i = 0, l = obj.length; i < l; i++) {
	          uint[i] = obj.charCodeAt(i);
	}
	return new Uint8Array(uint);
}

function randomPort(): number {
	// eslint-disable-next-line
	return Math.random() * 60536 | 0 + 5000; // 60536-65536
}

const autoDetectLocalTellStickSuccess = (tellStickInfo: Object, routeInfo: Object): Action => {
	let payload: Object = {
		...tellStickInfo,
		...routeInfo,
	};
	return {
		type: 'GATEWAY_AUTO_DETECT_LOCAL_SUCCESS',
		payload,
	};
};

const resetLocalControlSupport = (): Action => {
	return {
		type: 'GATEWAY_RESET_LOCAL_CONTROL_SUPPORT',
	};
};

const validateLocalControlSupport = (gatewayId: number, supportLocal: boolean): Action => {
	return {
		type: 'VALIDATE_LOCAL_CONTROL_SUPPORT',
		payload: {
			gatewayId,
			supportLocal,
		},
	};
};

const resetLocalControlAddress = (gatewayId: number, address: string): Action => {
	return {
		type: 'RESET_LOCAL_CONTROL_ADDRESS',
		gatewayId,
		payload: {
			address,
		},
	};
};

module.exports = {
	...Gateways,
	autoDetectLocalTellStick,
	resetLocalControlSupport,
	closeUDPSocket,
	validateLocalControlSupport,
	resetLocalControlAddress,
};
