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
import { format } from 'url';

import { Platform } from 'react-native';
import {LiveApi} from '../Lib/LiveApi';
import type { ThunkAction, Action } from './Types';

// Gateways actions that are shared by both Web and Mobile.
import { actions } from 'live-shared-data';
const { Gateways } = actions;

import dgram from 'dgram';
const socket: Object = dgram.createSocket('udp4');
const broardcastAddress = '255.255.255.255';
const broardcastPort = 30303;


function getTokenForLocalControl(id: string, publicKey: string): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		let formData = new FormData();
		formData.append('id', id);
		formData.append('publicKey', publicKey);
		const url = format({
			pathname: '/client/requestLocalKey',
		});
		const payload = {
			url,
			requestParams: {
				method: 'POST',
				body: formData,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'multipart/form-data',
				},
			},
		};
		return LiveApi(payload).then((response: Object): Object => {
			if (response && response.uuid) {
				dispatch(localControlSuccess(id, response.uuid));
				return response;
			}
			throw response;
		}).catch((err: Object) => {
			dispatch(localControlError(id));
			throw err;
		});
	};
}

function autoDetectLocalTellStick(): ThunkAction {
	return (dispatch: Function, getState: Function) => {
		let aPort = randomPort();
		socket.bind(aPort, (err: any) => {
			if (err) {
				throw err;
			}
			if (Platform.OS !== 'android') {
				socket.setBroadcast(true);
			}
		});
		socket.once('listening', () => {
			let buf = toByteArray('D');
			socket.send(buf, 0, buf.length, broardcastPort, broardcastAddress, (err: any) => {
				if (err) {
					throw err;
				}
			});
		});

		socket.on('message', (msg: any, rinfo: Object) => {
			// let str = String.fromCharCode.apply(null, new Uint8Array(msg));
			dispatch(autoDetectLocalTellStickSuccess(rinfo));
		});
	};
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

const localControlSuccess = (gatewayId: string, uuid: string): Action => {
	return {
		type: 'GATEWAY_API_LOCAL_CONTROL_TOKEN_SUCCESS',
		payload: {
			gatewayId,
			uuid,
		},
	};
};

const localControlError = (gatewayId: string): Action => {
	return {
		type: 'GATEWAY_API_LOCAL_CONTROL_TOKEN_ERROR',
		payload: {
			gatewayId,
		},
	};
};

const autoDetectLocalTellStickSuccess = (tellStickInfo: Object): Action => {
	return {
		type: 'GATEWAY_AUTO_DETECT_LOCAL_SUCCESS',
		payload: {
			tellStickInfo,
		},
	};
};

module.exports = {
	...Gateways,
	getTokenForLocalControl,
	autoDetectLocalTellStick,
};
