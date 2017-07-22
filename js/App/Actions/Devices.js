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

import type { Action, ThunkAction } from './Types';

import LiveApi from 'LiveApi';
import { supportedMethods } from 'Config';

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
	return (dispatch) => {
		const payload = { // $FlowFixMe
			url: `/device/command?id=${deviceId}&method=${state}&value=${stateValue}`,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => dispatch({
			type: 'DEVICE_SET_STATE',
			payload: {
				...payload,
				...response,
			},
		}));
	};
}

export function turnOn(deviceId: number): ThunkAction {
	return (dispatch) => {
		const payload = {
			url: `/device/turnOn?id=${deviceId}`,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => dispatch({
			type: 'DEVICE_TURN_ON',
			payload: {
				...payload,
				...response,
			},
		}));
	};
}

export function turnOff(deviceId: number): ThunkAction {
	return (dispatch) => {
		const payload = {
			url: `/device/turnOff?id=${deviceId}`,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => dispatch({
			type: 'DEVICE_TURN_OFF',
			payload: {
				...payload,
				...response,
			},
		}));
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

export function up(deviceId: number): ThunkAction {
	return (dispatch) => {
		const payload = {
			url: `/device/up?id=${deviceId}`,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => dispatch({
			type: 'DEVICE_UP',
			payload: {
				...payload,
				...response,
			},
		}));
	};
}

export function down(deviceId: number): ThunkAction {
	return (dispatch) => {
		const payload = {
			url: `/device/down?id=${deviceId}`,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => dispatch({
			type: 'DEVICE_DOWN',
			payload: {
				...payload,
				...response,
			},
		}));
	};
}

export function stop(deviceId: number): ThunkAction {
	return (dispatch) => {
		const payload = {
			url: `/device/stop?id=${deviceId}`,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => dispatch({
			type: 'DEVICE_STOP',
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

// calculates the from and to timestamp by considering the tzoffset of the client/location.
function getTimeStamp(tzOffset: number) {
	let prevTimestamp = 0;
	let toTimestamp = Math.floor(Date.now() / 1000) + tzOffset;
	let d = new Date();
	let m = d.getMonth();
	d.setMonth(d.getMonth() - 1);
	if (d.getMonth() === m) {
		d.setDate(0);
	}
	d.setHours(0, 0, 0);
	d.setMilliseconds(0);
	let fromTimestamp = Math.floor(d / 1000) + tzOffset + prevTimestamp;
	return { fromTimestamp, toTimestamp };
}

export function getDeviceHistory(device: Object): ThunkAction {
	return (dispatch, getState) => {
		const {
			gateways: { byId },
		} = getState();
		let tzOffset = byId[device.clientId].tzoffset;
		/*
		toTimestamp is always the current date/time and fromTimestamp, as of now kept 1 month
		behind toTimestamp.
		There can be more history thought of fetching those during list infinite scroll.
		*/
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
