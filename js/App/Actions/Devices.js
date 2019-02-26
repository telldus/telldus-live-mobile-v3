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
import { CancelToken } from 'axios';

import { supportedMethods, methods } from '../../Config';
import type { ThunkAction } from './Types';
import { LocalApi, hasTokenExpired, getTokenForLocalControl, LiveApi } from '../Lib';

import { validateLocalControlSupport } from './Gateways';
// Device actions that are shared by both Web and Mobile.
import { actions } from 'live-shared-data';
const { Devices, App } = actions;
const { deviceSetState: deviceSetStateShared, ...otherActions } = Devices;
const { deviceSetStateSuccess, deviceResetState, requestDeviceAction, getDeviceInfo } = otherActions;
const { showToast } = App;

let setStateTimeout = {};
let setStateInterval = {};
let requestTimeout = {};
let infoRequestTimeout = {};

function deviceSetState(deviceId: number, state: number, stateValue: number | null = null): ThunkAction {
	return (dispatch: Function, getState: Function): any => {
		const { gateways, devices } = getState();
		const { clientId, clientDeviceId } = devices.byId[deviceId] ? devices.byId[deviceId] : {};
		const { localKey = {} } = gateways.byId[clientId] ? gateways.byId[clientId] : {};
		const { address, key: token, ttl, supportLocal } = localKey;
		const tokenExpired = hasTokenExpired(ttl);

		if (address && token && ttl && !tokenExpired) {
			dispatch(requestDeviceAction(deviceId, state, true));

			clearRequestTimer(clientDeviceId);
			clearTimers(clientDeviceId);

			const url = format({
				pathname: '/device/command',
				query: {
					id: clientDeviceId,
					method: state,
					value: stateValue,
				},
			});
			const source = CancelToken.source();
			const payload = {
				address,
				url,
				requestParams: {
					method: 'GET',
					cancelToken: source.token,
				},
				token,
			};

			// Need to achieve timeout and cancel explicity because axios timeout does not work when ip is not reachable
			// https://github.com/axios/axios/issues/647
			requestTimeout[`${clientDeviceId}RTO`] = setTimeout(() => {
				source.cancel();
			}, 3000);

			return LocalApi(payload).then((response: Object): any => {

				clearRequestTimer(clientDeviceId);
				clearTimers(clientDeviceId);
				const { status } = response;
				if (status && status === 'success') {

					// 'GATEWAY_RESET_LOCAL_CONTROL_SUPPORT' has disabled 'supportLocal' property but still the local control properties
					// are valid and works like a charm, so re-enable 'supportLocal', so that local control icon(home) will be shown.
					if (!supportLocal) {
						dispatch(validateLocalControlSupport(clientId, true));
					}
					if (state !== 32) {
					// Every 1sec for the very next 10secs of action success, keep checking device state
					// by calling device/info.
						setStateTimeout[`${clientDeviceId}SSTO`] = setTimeout(() => {
							if (setStateInterval[`${clientDeviceId}SSTI`]) {
								clearInterval(setStateInterval[`${clientDeviceId}SSTI`]);
							}

							const { gateways: gatewaysLat } = getState();
							const { localKey: localKeyLat = {} } = gatewaysLat.byId[clientId];
							const { address: addressLat } = localKeyLat;
							if (addressLat) {
								// Final device/info call, to reset the device state.
								// Will be called after 10secs, that means device action has not been success yet(setStateTimeout not cleared).
								dispatch(getDeviceInfoLocal(deviceId, clientDeviceId, addressLat, token, state, true));
							} else {
								dispatch(requestDeviceAction(deviceId, state, false));
								// If local address is cleared/reset do cloud check instead
								const requestedState = methods[state];
								dispatch(getDeviceInfo(deviceId, requestedState, LiveApi));
								clearTimers(clientDeviceId);
							}
						}, 10000);

						setStateInterval[`${clientDeviceId}SSTI`] = setInterval(() => {
							const { devices: deviceLat, gateways: gatewaysLat } = getState();
							const device = deviceLat.byId[deviceId];
							if (device) {
								const { isInState } = device;
								const nextState = methods[state];

								// Incase if websocket updated the state do not go for device/info call.
								if (nextState === isInState) {
									clearTimers(clientDeviceId);
								} else {
									const { localKey: localKeyLat = {} } = gatewaysLat.byId[clientId];
									const { address: addressLat } = localKeyLat;
									if (addressLat) {
										dispatch(getDeviceInfoLocal(deviceId, clientDeviceId, addressLat, token, state, false));
									}
									// Cloud check is intentionally avoided here, as it might not be right to rely on cloud info
									// before 10secs. Cloud check is done once, after 10secs of 'setStateTimeout'.
								}
							} else {
								// clear timers and do nothing if the device is not available(LOGOUT can cause list to be reset)
								clearTimers(clientDeviceId);
							}
						}, 1000);
					}
					return response;
				}
				throw response;
			}).catch((): any => {
				clearRequestTimer(clientDeviceId);
				dispatch(requestDeviceAction(deviceId, state, false));

				// Can confirm that local control parameters currently present are not valid(address has changed or something)
				// In that case, if 'supportLocal' is not disabled do it here, so that local control icon(home) will not be shown
				if (supportLocal) {
					dispatch(validateLocalControlSupport(clientId, false));
				}
				return dispatch(deviceSetStateShared(deviceId, state, stateValue));
			});
		} else if (ttl && tokenExpired) {

			// if tokenExpired refreshes the token, do not `return` from this block, as
			// device has to be controlled using LiveApi(the block below).
			dispatch(getTokenForLocalControl(clientId));
		}
		dispatch(requestDeviceAction(deviceId, state, false));
		return dispatch(deviceSetStateShared(deviceId, state, stateValue));
	};
}

function clearTimers(id: number) {
	if (setStateTimeout[`${id}SSTO`]) {
		clearTimeout(setStateTimeout[`${id}SSTO`]);
	}
	if (setStateInterval[`${id}SSTI`]) {
		clearInterval(setStateInterval[`${id}SSTI`]);
	}
}

function clearRequestTimer(id: number) {
	if (requestTimeout[`${id}RTO`]) {
		clearTimeout(requestTimeout[`${id}RTO`]);
	}
	if (infoRequestTimeout[`${id}IRTO`]) {
		clearTimeout(infoRequestTimeout[`${id}IRTO`]);
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
		let payload = {
			address,
			url,
			requestParams: {
				method: 'GET',
			},
			token,
		};

		if (reset) {
			const source = CancelToken.source();
			payload = {
				address,
				url,
				requestParams: {
					method: 'GET',
					cancelToken: source.token,
				},
				token,
			};
			infoRequestTimeout[`${clientDeviceId}IRTO`] = setTimeout(() => {
				source.cancel();
			}, 3000);
		}

		return LocalApi(payload).then((response: Object): any => {
			clearRequestTimer(clientDeviceId);

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
			let { devices } = getState();
			let device = devices.byId[deviceId];
			if (reset && device) {
				let { isInState, value } = device;
				const data = {
					deviceId,
					value,
					state: isInState,
				};
				dispatch(showToast());
				dispatch(deviceResetState(data));
				clearTimers(clientDeviceId);
				clearRequestTimer(clientDeviceId);
			}
			throw err;
		});
	};
}

module.exports = {
	...otherActions,
	deviceSetState,
};
