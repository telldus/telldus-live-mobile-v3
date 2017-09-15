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
 * @providesModule Actions_Gateways
 */

// @flow

'use strict';

import type { ThunkAction } from './Types';
import { getWebsocketAddress } from 'Actions_Websockets';

import LiveApi from 'LiveApi';
import { format } from 'url';

function getGateways(): ThunkAction {
	return (dispatch, getState) => {
		const url = format({
			pathname: '/clients/list',
			query: {
				extras: 'timezone,suntime,tzoffset',
			},
		});
		const payload = {
			url,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => {
			dispatch({
				type: 'RECEIVED_GATEWAYS',
				payload: {
					...payload,
					...response,
				},
			});
			response.client.forEach(gateway => {
				dispatch(getWebsocketAddress(gateway.id));
			});
		});
	};
}

function addNewGateway(): ThunkAction {
	return (dispatch, getState) => {
		const url = format({
			pathname: '/clients/list',
			query: {
				extras: {
					autodetect: 1,
				},
			},
		});
		const payload = {
			url,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => {
			if (response.client) {
				dispatch({
					type: 'ADD_GATEWAY_REQUEST',
					payload: {
						clients: response.client,
					},
				});
			}
		}).catch(err => {
			let message = err.message ? err.message : err.error ? err.error : 'Unknown Error';
			dispatch({
				type: 'GLOBAL_ERROR_SHOW',
				payload: {
					source: 'Add_Location',
					message: message,
				},
			});
		});
	};
}

function activateGateway(clientInfo: Object): ThunkAction {
	return (dispatch, getState) => {
		if (clientInfo.activationCode) {
			let {activationCode, name, timezone} = {...clientInfo};
			dispatch(getGatewayInfo(activationCode, successResponse => {
				let {id, uuid} = {...successResponse};
				dispatch(register(id, uuid, regSuccessResponse => {
					dispatch(setName(id, name));
					dispatch(setTimezone(id, timezone));
				}, regErrorResponse => {
				}));
			}, errorResponse => {
			}));
		} else {
			let {clientId, uuid, name, timezone} = {...clientInfo};
			dispatch(register(clientId, uuid, regSuccessResponse => {
				dispatch(setName(clientId, name));
				dispatch(setTimezone(clientId, timezone));
			}, regErrorResponse => {
			}));
		}
	};
}

function getGatewayInfo(code: string, successCallback?: Function, errorCallback?: Function): ThunkAction {
	return (dispatch, getState) => {
		const url = format({
			pathname: '/client/info',
			query: {
				code,
			},
		});
		const payload = {
			url,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => {
			if (response.id && successCallback && typeof successCallback === 'function') {
				successCallback(response);
			}
		}).catch(err => {
			if (errorCallback && typeof errorCallback === 'function') {
				errorCallback(err);
			}
			let message = err.message ? err.message : err.error ? err.error : 'Unknown Error';
			dispatch({
				type: 'REQUEST_MODAL_OPEN',
				payload: {
					data: message,
				},
			});
		});
	};
}

function register(id: string, uuid: string, successCallback?: Function, errorCallback?: Function): ThunkAction {
	return (dispatch, getState) => {
		const url = format({
			pathname: '/client/register',
			query: {
				id,
				uuid,
			},
		});
		const payload = {
			url,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => {
			if (response.status === 'success' && successCallback && typeof successCallback === 'function') {
				successCallback(response);
			}
		}).catch(err => {
			if (errorCallback && typeof errorCallback === 'function') {
				errorCallback(err);
			}
			let message = err.message ? err.message : err.error ? err.error : 'Unknown Error';
			dispatch({
				type: 'REQUEST_MODAL_OPEN',
				payload: {
					data: message,
				},
			});
		});
	};
}

function setName(id: string, name: string): ThunkAction {
	return (dispatch, getState) => {
		const url = format({
			pathname: '/client/setName',
			query: {
				id,
				name,
			},
		});
		const payload = {
			url,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => {
		}).catch(err => {
			let message = err.message ? err.message : err.error ? err.error : 'Unknown Error';
			dispatch({
				type: 'REQUEST_MODAL_OPEN',
				payload: {
					data: message,
				},
			});
		});
	};
}

function setTimezone(id: string, timezone: string): ThunkAction {
	return (dispatch, getState) => {
		const url = format({
			pathname: '/client/setTimezone',
			query: {
				id,
				timezone,
			},
		});
		const payload = {
			url,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => {
		}).catch(err => {
			let message = err.message ? err.message : err.error ? err.error : 'Unknown Error';
			dispatch({
				type: 'REQUEST_MODAL_OPEN',
				payload: {
					data: message,
				},
			});
		});
	};
}

module.exports = { getGateways, addNewGateway, activateGateway };
