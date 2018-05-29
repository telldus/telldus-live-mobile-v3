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
let forge = require('node-forge');

import type { ThunkAction } from './Types';
import { LocalApi, getRSAKey } from '../Lib';
// Device actions that are shared by both Web and Mobile.
import { actions } from 'live-shared-data';
const { Devices } = actions;
const { deviceSetState: deviceSetStateShared, ...otherActions } = Devices;

module.exports = {
	...otherActions,
	deviceSetState,
};

function deviceSetState(deviceId: number, state: number, stateValue: number | null = null): ThunkAction {
	return (dispatch: Function, getState: Function): any => {
		const { gateways, devices } = getState();
		const { clientId } = devices.byId[deviceId];
		const { localKey } = gateways.byId[clientId];
		const { address, key } = localKey;

		if (address && key) {
			getRSAKey(false, ({ pemPvt }: Object): ThunkAction => {
				const privateKey = forge.pki.privateKeyFromPem(pemPvt);
				const decoded64 = forge.util.decode64(key);
				const token = privateKey.decrypt(decoded64, 'RSA-OAEP', {
					md: forge.md.sha256.create(),
				});
				// console.log('TEST IN token', token);

				if (token) {
					const url = format({
						pathname: '/device/command',
						query: {
							id: deviceId,
							method: state,
							value: stateValue,
						},
					});
					const payload = {
						address,
						url,
						requestParams: {
							method: 'GET',
						},
						token,
					};
					return LocalApi(payload).then((response: Object): any => {
						// console.log('TEST response', response);
						return response;
					}).catch((err: Object): any => {
						console.log('err', err);
						return dispatch(deviceSetStateShared(deviceId, state, stateValue));
					});
				}
				// console.log('TEST gateways.byId[clientId]', gateways.byId[clientId]);
				return dispatch(deviceSetStateShared(deviceId, state, stateValue));
			});
		} else {
			return dispatch(deviceSetStateShared(deviceId, state, stateValue));
		}
	};
}
