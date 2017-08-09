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
 * @providesModule Actions_Devices
 */

// @flow

'use strict';

import type { Action, ThunkAction, Dispatch } from './Types';

import LiveApi from 'LiveApi';
import { supportedMethods, methods } from 'Config';

import { format } from 'url';

export function getDevices(): ThunkAction {
	return (dispatch) => {
		const url = format({
			pathname: '/devices/list',
			query: {
				supportedMethods,
				includeIgnored: 1,
			},
		});
		const payload = {
			url,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => dispatch({
			type: 'RECEIVED_DEVICES',
			payload: {
				...payload,
				...response,
			},
		}));
	};
}

export function processWebsocketMessageForDevice(action:string, data:Object): Action {
	switch (action) {
		case 'setState':
			return {
				type: 'DEVICE_SET_STATE',
				payload: data,
			};
		default:
			return {
				type: 'DEVICE_WEBSOCKET_UNHANDLED',
				payload: data,
			};
	}
}

export function deviceSetState(deviceId: number, state:number, stateValue:number|null = null): ThunkAction {

	return (dispatch, getState) => {
		const payload = { // $FlowFixMe
			url: `/device/command?id=${deviceId}&method=${state}&value=${stateValue}`,
			requestParams: {
				method: 'GET',
			},
		};

		return LiveApi(payload).then(response =>{
			setTimeout(() => {
				let { devices } = getState();
				let device = devices.byId[deviceId];
				if (device.methodRequested !== '') {
					getDeviceInfo(deviceId, state, device.isInState, dispatch);
				}
			}, 2000);
		}).catch(error => {
			let { devices } = getState();
			let device = devices.byId[deviceId];
			dispatch({
				type: 'GLOBAL_ERROR_SHOW',
				payload: {
					source: 'device',
					deviceId,
					message: error.message,
				},
			});
			dispatch({
				type: 'DEVICE_RESET_STATE',
				deviceId,
				state: device.isInState,
			});
		});
	};
}

export function requestTurnOn(deviceId: number): Action {
	return {
		type: 'REQUEST_TURNON',
		payload: { deviceId },
	};
}

export function requestTurnOff(deviceId: number): Action {
	return {
		type: 'REQUEST_TURNOFF',
		payload: { deviceId },
	};
}

export function bell(deviceId: number): ThunkAction {
	return (dispatch) => {
		const payload = {
			url: `/device/bell?id=${deviceId}`,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => dispatch({
			type: 'DEVICE_BELL',
			payload: {
				...payload,
				...response,
			},
		}));
	};
}

export function learn(deviceId: number): ThunkAction {
	return (dispatch) => {
		const payload = {
			url: `/device/learn?id=${deviceId}`,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => dispatch({
			type: 'DEVICE_LEARN',
			payload: {
				...payload,
				...response,
			},
		}));
	};
}

export function getDeviceInfo(deviceId: number, requestedState: number, currentState: string, dispatch: Dispatch) {
	const payload = {
		url: `/device/info?id=${deviceId}&supportedMethods=${supportedMethods}`,
		requestParams: {
			method: 'GET',
		},
	};
	return LiveApi(payload).then(response => {
		let newState = methods[parseInt(response.state, 10)];
		requestedState = methods[requestedState];
		if (newState === currentState) {
			dispatch({
				type: 'DEVICE_RESET_STATE',
				deviceId,
				state: response.state,
			});
			if (requestedState !== newState) {
				dispatch({
					type: 'GLOBAL_ERROR_SHOW',
					payload: {
						source: 'device',
						deviceId,
						message: '',
					},
				});
			}
		} else {
			dispatch({
				type: 'DEVICE_SET_STATE',
				payload: {
					deviceId,
					value: response.stateValue,
					method: response.state,
				},
			});
		}
	});
}
