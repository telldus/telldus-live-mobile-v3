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

import { googleAPIKey } from 'Config';

import type { ThunkAction } from './Types';
import { getWebsocketAddress } from 'Actions_Websockets';

import {getAppData} from './AppData';
import {LiveApi} from 'LiveApi';
import { format } from 'url';

import { reportError } from 'Analytics';

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
				autodetect: 1,
				extras: 'timezone',
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
			return response;
		}).catch(err => {
			throw err;
		});
	};
}

function getGatewayInfo(uniqueParam: Object, extras?: string|null = null): ThunkAction {
	return (dispatch, getState) => {
		const url = format({
			pathname: '/client/info',
			query: {
				...uniqueParam,
				extras,
			},
		});
		const payload = {
			url,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => {
			return response;
		}).catch(err => {
			throw err;
		});
	};
}

function activateGateway(clientInfo: Object): ThunkAction {
	return (dispatch, getState) => {
		const url = format({
			pathname: '/client/register',
			query: {
				id: clientInfo.clientId,
				uuid: clientInfo.uuid,
			},
		});
		const payload = {
			url,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => {
			if (response.status === 'success') {
				let { longitude, latitude } = clientInfo.coordinates;
				Promise.all([
					dispatch(setName(clientInfo.clientId, clientInfo.name)),
					dispatch(setTimezone(clientInfo.clientId, clientInfo.timezone)),
					dispatch(setCoordinates(clientInfo.clientId, longitude, latitude)),
				]).then(val => {
					dispatch(getAppData());
					dispatch(getGateways());
					return val;
				});
				return response;
			}
			throw response;
		}).catch(err => {
			let log = JSON.stringify(err);
			reportError(log);
			throw err;
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
			return response;
		}).catch(err => {
			return err;
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
			return response;
		}).catch(err => {
			return err;
		});
	};
}

function setCoordinates(id: string, longitude: number, latitude: number): ThunkAction {
	return (dispatch, getState) => {
		const url = format({
			pathname: '/client/setCoordinates',
			query: {
				id,
				longitude,
				latitude,
			},
		});
		const payload = {
			url,
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => {
			return response;
		}).catch(err => {
			return err;
		});
	};
}

function getGeoCodePosition(address: string): ThunkAction {
	return (dispatch: Function, getState: Object) => {
		const googleUrl = 'https://maps.google.com/maps/api/geocode/json';
		const url = format({
			pathname: googleUrl,
			query: {
				key: googleAPIKey,
				address,
			},
		});
		const payload = {
			url,
			requestParams: {
				method: 'GET',
			},
		};
		return fetch(payload)
			.then((response) => response.json())
			.then((responseData) => {
				if (responseData.error) {
					throw responseData;
				}
				return responseData;
			}).catch(e => {
				throw e;
			});
	};
}

module.exports = {
	getGateways,
	addNewGateway,
	activateGateway,
	getGatewayInfo,
	getGeoCodePosition,
};
