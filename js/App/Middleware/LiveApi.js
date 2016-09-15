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
 */

'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { apiServer, publicKey, privateKey } from 'Config';
import { updateAccessToken } from 'Actions';

export default function (store) {
	return next => action => {
		if (action.type == 'LIVE_API_CALL') {
			call(store, action.payload.url, action.payload.requestParams)
			.then((response) => {
				if(action.callback) {
					var callbackResponse = action.callback.call(callbackResponse, response);
				}
				if(action.returnPayload) {
					var response = Object.assign({}, response, action.returnPayload);
				}
				return next({
					type: action.returnType,
					payload: response
				});
			})
			.catch(function (e) {
				console.log(e);
				return e;
			});
		} else {
			return next(action);
		}
	}
}

async function call(store, url, requestParams): Promise<Action> {
	var accessToken = store.getState().user.accessToken;
	const authParams = {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + accessToken.access_token
		}
	};
	var params = Object.assign({}, requestParams, {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + accessToken.access_token
		}
	});
	return new Promise((resolve, reject) => {
		fetch( `${apiServer}/oauth2${url}`, params)
		.then((response) => response.text())
		.then((text) => JSON.parse(text))
		.then((responseData) => {
			if (responseData.error) {
				switch (responseData.error) {
					case 'expired_token':
						fetch(
							`${apiServer}/oauth2/accessToken`,
							{
								method: 'POST',
								headers: {
									'Accept': 'application/json',
									'Content-Type': 'application/json',
								},
								body: JSON.stringify({
									'client_id': publicKey,
									'client_secret': privateKey,
									'grant_type': 'refresh_token',
									'refresh_token': accessToken.refresh_token
								})
							}
						)
						.then((response) => response.json())
						.then((responseData) => {
							if (responseData.error) {
								throw responseData;
							}
							store.dispatch(updateAccessToken(responseData));
							var params = Object.assign({}, requestParams, {
								headers: {
									'Accept': 'application/json',
									'Content-Type': 'application/json',
									'Authorization': 'Bearer ' + responseData.access_token
								}
							});
							fetch(`${apiServer}/oauth2${url}`, params)
							.then((response) => response.text())
							.then((text) => JSON.parse(text))
							.then((responseData) => {
								if (responseData.error) {
									throw responseData;
								}
								resolve(responseData);
							});
						})
					default:
						throw responseData;
				}
			}
			resolve(responseData);
		})
		.catch(function (e) {
			reject(e);
		});
	});

}
