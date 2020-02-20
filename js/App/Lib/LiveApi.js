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

import axios from 'axios';
import { parse } from 'url';

const CancelToken = axios.CancelToken;
let axiosSources = {};

import type { ThunkAction } from '../Actions/Types';
import { apiServer, publicKey, privateKey } from '../../Config';

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

export function LiveApi({ url, requestParams, _accessToken, cancelAllPending = false }: {url: string, requestParams: Object, _accessToken?: Object, cancelAllPending?: boolean }): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		const { user: { accessToken, userId = '' } } = getState();

		const { path } = parse(url);
		let source = {};
		if (path) {
			const sourcesUserIds = Object.keys(axiosSources);
			if (cancelAllPending) {
				sourcesUserIds.map((sourceUserId: string) => {
					const userSources = axiosSources[sourceUserId];
					Object.keys(userSources).forEach((sources: Object) => {
						if (userSources[sources] && userSources[sources].cancel) {
							userSources[sources].cancel();
						}
					});
					delete axiosSources[sourceUserId];
				});
			}
			const currUserSources = axiosSources[userId] || {};
			if (currUserSources[path]) {
				source = currUserSources[path];
			} else {
				source = CancelToken.source("API call Cancelled by 'cancelAllPending'");
				currUserSources[path] = source;
			}
			axiosSources[userId] = currUserSources;
		}

		requestParams = {
			cancelToken: source.token,
			...requestParams,
		};

		return doApiCall(url, requestParams, _accessToken || accessToken, dispatch).then((response: Object): any => {
			const currUserSources = axiosSources[userId] || {};
			delete currUserSources[path];

			if (!response) {
				throw (new Error('unexpected error: response empty'));
			}

			return response;
		}).catch((error: Object): any => {
			const currUserSources = axiosSources[userId] || {};
			delete currUserSources[path];

			const { data } = error.response;
			if (!axios.isCancel(error)) {
				return error;
			} else if (data && (data.error === 'invalid_token' || data.error === 'expired_token')) {
				return error;
			}

			throw error;
		});
	};
}

async function doApiCall(url: string, requestParams: Object, accessToken: Object, dispatch: Function): any {
	let response;
	try {
		response = await callEndPoint(url, requestParams, accessToken);

		if (!response.error) {
			// All is well, so return the data from the API.
			return response;
		}

		throw new Error(response.error);
	} catch (err) {
		const { data } = err.response;

		if (data && (data.error !== 'invalid_token' && data.error !== 'expired_token')) {
			// An error from the API we cannot recover from
			throw err;
		}

		let accessTokenRefreshed = await dispatch(refreshAccessToken(url, requestParams, accessToken)); // Token has expired, so we'll try to get a new one.

		return callEndPoint(url, requestParams, accessTokenRefreshed); // retry api call
	}
}

async function callEndPoint(url: string, requestParams: Object, accessToken: Object): Object {
	let params = {};

	if (!accessToken) {
		throw new Error('LiveApi: need accessToken');
	}

	if (requestParams.headers) {
		const headers = { ...requestParams.headers, 'Authorization': `Bearer ${accessToken.access_token}` };
		params = { ...requestParams, headers };
	} else {
		params = Object.assign({}, requestParams, {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken.access_token}`,
			},
		});
	}

	let response = await axios(`${apiServer}/oauth2${url}`, params);
	let { data = {} } = response;
	return data;
}

// create new token with refresh token
export function refreshAccessToken(url?: string = '', requestParams?: Object = {}, accessToken: Object): any {
	return (dispatch: Function, getState: Function): Promise<any> => {
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
			.then((response: Object): any => response.json())
			.then((response: Object): any => {
				if (response.error) {
					// We couldn't get a new access token with the refresh_token, so we lock the session.
					dispatch({
						type: 'LOCK_SESSION',
					});
					throw response;
				}

				// import 'updateAccessToken' fails on doing module.exports from Actions/Login'
				// works on exporting 'updateAccessToken' directly(cant be do as there are multiple exports already). need to investigate.
				dispatch({
					type: 'RECEIVED_ACCESS_TOKEN',
					accessToken: {
						...response,
					},
				});
				return response;
			}).catch((err: any) => {
				throw err;
			});
	};
}
