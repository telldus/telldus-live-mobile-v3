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

import { supportedMethods, methods } from '../../Config';
import type { ThunkAction } from './Types';
import { LocalApi, hasTokenExpired, refreshLocalControlToken } from '../Lib';
// Device actions that are shared by both Web and Mobile.
import { actions } from 'live-shared-data';
const { Devices, App } = actions;
const { deviceSetState: deviceSetStateShared, ...otherActions } = Devices;
const { deviceSetStateSuccess, deviceResetState } = otherActions;
const { showToast } = App;

let setStateTimeout = {};
let setStateInterval = {};

function deviceSetState(deviceId: number, state: number, stateValue: number | null = null): ThunkAction {
	return (dispatch: Function, getState: Function): any => {
		const { gateways, devices } = getState();
		const { clientId, clientDeviceId } = devices.byId[deviceId];
		const { localKey } = gateways.byId[clientId];
		const { address, key: token, ttl } = localKey;
		const tokenExpired = hasTokenExpired(ttl);

		if (address && token && !tokenExpired) {
			clearTimers(clientDeviceId);
			const url = format({
				pathname: '/device/command',
				query: {
					id: clientDeviceId,
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
				clearTimers(clientDeviceId);
				const { status } = response;
				if (status && status === 'success') {
					if (state !== 32) {
					// Every 1sec for the very next 10secs of action success, keep checking device state
					// by calling device/info.
						setStateTimeout[clientDeviceId] = setTimeout(() => {
							if (setStateInterval[clientDeviceId]) {
								clearInterval(setStateInterval[clientDeviceId]);
							}
							// Final device/info call, to reset the device state.
							// Will be called after 10secs, that means device action has not been success yet(setStateTimeout not cleared).
							dispatch(getDeviceInfoLocal(deviceId, clientDeviceId, address, token, state, true));
						}, 10000);

						setStateInterval[clientDeviceId] = setInterval(() => {
							const { devices: deviceLat } = getState();
							const { isInState } = deviceLat.byId[deviceId];
							const nextState = methods[state];

							// Incase if websocket updated the state do not go for device/info call.
							if (nextState === isInState) {
								clearTimers(clientDeviceId);
							} else {
								dispatch(getDeviceInfoLocal(deviceId, clientDeviceId, address, token, state, false));
							}
						}, 1000);
					}
					return response;
				}
				throw response;
			}).catch((): any => {
				return dispatch(deviceSetStateShared(deviceId, state, stateValue));
			});
		} else if (tokenExpired) {

			// if tokenExpired refreshes the token, do not `return` from this block, as
			// device has to be controlled using LiveApi(the block below).
			dispatch(refreshLocalControlToken(clientId));
		}
		return dispatch(deviceSetStateShared(deviceId, state, stateValue));
	};
}

function clearTimers(id: number) {
	if (setStateTimeout[id]) {
		clearTimeout(setStateTimeout[id]);
	}
	if (setStateInterval[id]) {
		clearInterval(setStateInterval[id]);
	}
}

function getDeviceInfoLocal(deviceId: number, clientDeviceId: number, address: string, token: string, requestState: number, reset: boolean): ThunkAction {
	return (dispatch: Function, getState: Function): any => {
		const url = format({
			pathname: '/device/info',
			query: {
				id: clientDeviceId,
				supportedMethods,
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

			// clear time interval when new state is equal to requested state.
			if (requestState === response.state) {
				const data = {
					deviceId,
					value: response.statevalue,
					method: response.state,
				};
				dispatch(deviceSetStateSuccess(data));
				clearTimers(clientDeviceId);
			} else if (reset) {
				const newState = methods[parseInt(response.state, 10)];
				const data = {
					deviceId,
					value: response.statevalue,
					state: newState,
				};
				dispatch(showToast());
				dispatch(deviceResetState(data));
				clearTimers(clientDeviceId);
			}
			return response;
		}).catch((err: Object): any => {

			// Incase if no response came through socket and the final device/info call to reset state throws error
			// the action indicator will keep flashing for ever. So reseting the state with it's own state here.
			if (reset) {
				let { devices } = getState();
				let device = devices.byId[deviceId];
				let { isInState, value } = device;
				const data = {
					deviceId,
					value,
					state: isInState,
				};
				dispatch(showToast());
				dispatch(deviceResetState(data));
				clearTimers(clientDeviceId);
			}
			throw err;
		});
	};
}

module.exports = {
	...otherActions,
	deviceSetState,
};
