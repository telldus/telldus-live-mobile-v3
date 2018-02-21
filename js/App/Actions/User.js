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
 * @providesModule Actions_User
 */

'use strict';

import type { ThunkAction } from './types';

import {LiveApi} from 'LiveApi';
import { publicKey, privateKey, apiServer } from '../../Config';

import { format } from 'url';
import { reportError } from '../Lib';
import { Answers } from 'react-native-fabric';

/*
 * registers the app at the telldus server for receiving push notification, with push token and other device information.
 */
export const registerPushToken = (token: String, name: String, model: String, manufacturer: String, osVersion: String, deviceId: String, pushServiceId: Number ): ThunkAction => dispatch => {
	const url = format({
		pathname: '/user/registerPushToken',
		query: {
			token,
			name,
			model,
			manufacturer,
			osVersion,
			deviceId,
			pushServiceId,
		},
	});
	const payload = {
		url,
		requestParams: {
			method: 'GET',
		},
	};
	return LiveApi(payload).then(response => {
		if ((!response.error) && (response.status === 'success')) {
			dispatch({
				type: 'PUSH_TOKEN_REGISTERED',
				token: token,
				payload: {
					...payload,
					...response,
				},
			});
			return response;
		}
		throw response;
	}).catch(e => {
		let log = JSON.stringify(e);
		reportError(log);
		if (e === 'TypeError: Network request failed') {
			dispatch({
				type: 'ERROR',
				message: {
					error: e,
					error_description: 'Network request failed. Check your internet connection',
				},
			});
		}
		throw e;
	});
};

/*
 * unregisters the app at the telldus server from receiving push notification, with the registered push token.
 */
export const unregisterPushToken = (token: String): ThunkAction => dispatch => {
	const url = format({
		pathname: '/user/unregisterPushToken',
		query: {
			token,
		},
	});
	const payload = {
		url,
		requestParams: {
			method: 'GET',
		},
	};
	return LiveApi(payload).then(response => {
		if ((!response.error) && (response.status === 'success')) {
			dispatch({
				type: 'PUSH_TOKEN_UNREGISTERED',
				token: token,
				payload: {
					...payload,
					...response,
				},
			});
		}
	}).catch(e => {
		if (e === 'TypeError: Network request failed') {
			dispatch({
				type: 'ERROR',
				message: {
					error: e,
					error_description: 'Network request failed. Check your internet connection',
				},
			});
		}
	});
};

export const RegisterUser = (email: String, firstName: String, lastName: String): ThunkAction => (dispatch, getState) => {
	let formData = new FormData();
	formData.append('email', email);
	formData.append('firstname', firstName);
	formData.append('lastname', lastName);
	formData.append('client_id', publicKey);
	formData.append('client_secret', privateKey);
	return fetch(
		`${apiServer}/oauth2/user/register`,
		{
			method: 'POST',
			body: formData,
		}
	)
		.then((response) => response.json())
		.then((responseData) => {
			if (responseData.error) {
				throw responseData;
			}
			Answers.logSignUp('Email', true);
			dispatch({
				type: 'USER_REGISTER',
				accessToken: responseData,
			});
			return responseData;
		}).catch(e => {
			Answers.logSignUp('Email', false);
			throw e;
		});
};
