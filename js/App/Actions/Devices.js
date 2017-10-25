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

import {LiveApi} from 'LiveApi';
import { supportedMethods, methods } from 'Config';

import { format } from 'url';
import moment from 'moment';

let setStateTimeout = {};

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
		if (setStateTimeout[deviceId]) {
			clearTimeout(setStateTimeout[deviceId]);
		}
		const payload = { // $FlowFixMe
			url: `/device/command?id=${deviceId}&method=${state}&value=${stateValue}`,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response =>{
			if (state !== 32) {
				setStateTimeout[deviceId] = setTimeout(() => {
					let { devices } = getState();
					let device = devices.byId[deviceId];
					let currentState = device.isInState;
					let requestedState = methods[state];
					if (currentState !== requestedState || device.methodRequested !== '') {
						dispatch(getDeviceInfo(deviceId, requestedState));
					}
				}, 10000);
			}
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
			if (state !== 32) {
				let value = device.value, deviceState = device.isInState;
				let { dimmer } = getState();
				// handle Dimmer sliding action,reset state by getting the initial state from 'dimmer' reducer,
				// as the value in 'device' reducer is modified by 'SET_DIMMER_VALUE' action.
				if (state === 16 && dimmer.deviceId === deviceId) {
					value = dimmer.initialValue;
					deviceState = dimmer.initialState;
				}
				dispatch({
					type: 'DEVICE_RESET_STATE',
					payload: {
						deviceId,
						state: deviceState,
						value,
					},
				});
			}
		});
	};
}

export function requestDeviceAction(deviceId: number, method: number): Action {
	return {
		type: 'REQUEST_DEVICE_ACTION',
		payload: {
			deviceId,
			method,
		},
	};
}


// calculates the from and to timestamp by considering the tzoffset of the client/location.
function getTimeStamp(tzOffset: number) {
	let prevTimestamp = 0;
	let toTimestamp = parseInt(moment().format('X'), 10) + tzOffset;
	let lastWeek = parseInt(moment().subtract(7, 'days').format('X'), 10);
	let fromTimestamp = lastWeek + tzOffset + prevTimestamp;
	return { fromTimestamp, toTimestamp };
}

export function getDeviceHistory(device: Object): ThunkAction {
	return (dispatch, getState) => {
		const {
			gateways: { byId },
		} = getState();
		let tzOffset = byId[device.clientId].tzoffset;
		// fromTimestamp : one week before from current time.
		// toTimestamp : current time.
		let { fromTimestamp, toTimestamp } = getTimeStamp(tzOffset);
		const payload = {
			url: `/device/history?id=${device.id}&from=${fromTimestamp}&to=${toTimestamp}`,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => {
			dispatch({
				type: 'DEVICE_HISTORY',
				payload: {
					deviceId: device.id,
					timestamp: { fromTimestamp, toTimestamp },
					...response,
				},
			});
		});
	};
}

export function getDeviceInfo(deviceId: number, requestedState: string): ThunkAction {
	return (dispatch: Dispatch, getState: Function) => {
		const payload = {
			url: `/device/info?id=${deviceId}&supportedMethods=${supportedMethods}`,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => {
			let { devices } = getState();
			let device = devices.byId[deviceId];
			let currentState = device.isInState;
			let newState = methods[parseInt(response.state, 10)];
			if (newState === currentState) {
				dispatch({
					type: 'DEVICE_RESET_STATE',
					payload: {
						deviceId,
						state: newState,
						value: response.statevalue,
					},
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
						value: response.statevalue,
						method: response.state,
					},
				});
			}
		});
	};
}
