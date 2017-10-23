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
import { showToast } from 'Actions_App';

import { format } from 'url';
import moment from 'moment';

export function getDevices(): ThunkAction {
	return (dispatch: Dispatch): Promise<any> => {
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
		return LiveApi(payload).then((response: Object): Dispatch => dispatch({
			type: 'RECEIVED_DEVICES',
			payload: {
				...payload,
				...response,
			},
		}));
	};
}

export function processWebsocketMessageForDevice(action: string, data: Object): Action {
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

export function deviceSetState(deviceId: number, state: number, stateValue: number | null = null): ThunkAction {

	return (dispatch: Dispatch, getState: Function): Promise<any> => {
		const payload = { // $FlowFixMe
			url: `/device/command?id=${deviceId}&method=${state}&value=${stateValue}`,
			requestParams: {
				method: 'GET',
			},
		};

		return LiveApi(payload).then((response: Object) =>{
			if (state !== 32) {
				let setStateTimeout = setTimeout(() => {
					let { devices } = getState();
					let device = devices.byId[deviceId];
					let currentState = device.isInState;
					let requestedState = methods[state];
					if (currentState !== requestedState || device.methodRequested !== '') {
						getDeviceInfo(deviceId, requestedState, currentState, dispatch);
					}
					clearTimeout(setStateTimeout);
				}, 2000);
			}
		}).catch((error: Object) => {
			let { devices } = getState();
			let device = devices.byId[deviceId];
			dispatch(showToast('device'));
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
function getTimeStamp(tzOffset: number): Object {
	let prevTimestamp = 0;
	let toTimestamp = parseInt(moment().format('X'), 10) + tzOffset;
	let lastWeek = parseInt(moment().subtract(7, 'days').format('X'), 10);
	let fromTimestamp = lastWeek + tzOffset + prevTimestamp;
	return { fromTimestamp, toTimestamp };
}

export function getDeviceHistory(device: Object): ThunkAction {
	return (dispatch: Dispatch, getState: Function): Promise<any> => {
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
		return LiveApi(payload).then((response: Object) => {
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

export function getDeviceInfo(deviceId: number, requestedState: string, currentState: string, dispatch: Dispatch): Promise<any> {
	const payload = {
		url: `/device/info?id=${deviceId}&supportedMethods=${supportedMethods}`,
		requestParams: {
			method: 'GET',
		},
	};
	return LiveApi(payload).then((response: Object) => {
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
				dispatch(showToast('device'));
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
}
