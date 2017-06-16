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
 * @providesModule LiveApi
 */

'use strict';

import { apiServer, publicKey, privateKey } from 'Config';
import { updateAccessToken } from 'Actions/Login';

import type { Action } from './types';

// TODO: fix this pattern, pass store via component tree
import { getStore } from '../Store/ConfigureStore';

/*
 * When the user authenticates (logging in) the app receives two tokens.
 * One access token and one refresh token. The access token is only valid for a short time. A couple of hours or so.
 * When the access token expires it must be refreshed using the refresh token.
 *
 * Since it is currently not possible to know when it expires the app tries to use it until it receives an error.
 * When it receives the error it refreshes the access token and then retries the original call.
 *
 * The validity of the refresh token is about a year or so and will be renewed when used.
 */

export default ({ url, requestParams }) => {
	return new Promise((resolve, reject) => {
		return doApiCall(url, requestParams).then(response => {
			if (!response) {
				return reject(new Error('unexpected error: response empty', {
					response,
				}));
			}
			resolve(response);
		}).catch(error => {
			reject(error);
		});
	});
};

async function doApiCall(url, requestParams): Action {
	let response = await callEndPoint(url, requestParams);
	if (!response.error) {
		// All is well, so return the data from the API.
		return response;
	}
	if (response.error !== 'invalid_token' && response.error !== 'expired_token') {
		// An error from the API we cannot recover from
		throw new Error(
			response.error,
			{
				url,
				requestParams,
				response,
			}
		);
	}

	response = await refreshAccessToken(url, requestParams); // Token has expired, so we'll try to get a new one.

	response = await callEndPoint(url, requestParams); // retry api call
	if (!response.error) {
		// All is well, so return the data from the API.
		return response;
	}

	throw new Error(
		response.error,
		{
			url,
			requestParams,
			response,
		}
	);
}

async function callEndPoint(url, requestParams) {
	const accessToken = getStore().getState().user.accessToken;
	if (!accessToken) {
		throw new Error('LiveApi: need accessToken');
	}

	const params = Object.assign({}, requestParams, {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${accessToken.access_token}`,
		},
	});

	let response = await fetch(`${apiServer}/oauth2${url}`, params);
	response = await response.text();
	return JSON.parse(response);
}

// create new token with refresh token
async function refreshAccessToken(url, requestParams) {
	const store = getStore();
	const accessToken = store.getState().user.accessToken;
	const { dispatch } = store;

	return fetch(`${apiServer}/oauth2/accessToken`, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			'client_id': publicKey,
			'client_secret': privateKey,
			'grant_type': 'refresh_token',
			'refresh_token': accessToken.refresh_token,
		}),
	})
		.then(response => response.json())
		.then(response => {
			if (response.error) {
				// We couldn't get a new access token with the refresh_token, so we logout the user.
				return dispatch({
					type: 'LOGGED_OUT',
					payload: response,
				});
			}
			dispatch(updateAccessToken(response));
		});
}
