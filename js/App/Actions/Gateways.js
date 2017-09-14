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

import type { ThunkAction, Dispatch } from './Types';
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
	let {clientId, uuid, name, timezone} = {...clientInfo};
	return (dispatch, getState) => {
		register(clientId, uuid, dispatch);
		setName(clientId, name, dispatch);
		setTimezone(clientId, timezone, dispatch);
	};
}

function register(id: string, uuid: string, dispatch: Dispatch) {
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
	}).catch(err => {
		console.log('err register', err);
	});
}

function setName(id: string, name: string, dispatch: Dispatch) {
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
		console.log('err setName', err);
	});
}

function setTimezone(id: string, timezone: string, dispatch: Dispatch) {
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
		console.log('err setTimezone', err);
	});
}

module.exports = { getGateways, addNewGateway, activateGateway };
