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
 * @providesModule Actions/User
 */

'use strict';

import type { ThunkAction } from './types';

import LiveApi from 'LiveApi';

import { format } from 'url';

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
		if((!response.error) && (response.status == 'success')) {
			dispatch({
				type: 'PUSH_TOKEN_REGISTERED',
				token: token,
				payload: {
					...payload,
					...response,
				},
			});
		} 
	}).catch(e => {
		if(e == 'TypeError: Network request failed') {
			dispatch({
				type: 'ERROR',
			    message: {
			      error:e,
			      error_description: 'Network request failed. Check your internet connection',
			    },
			});
		}else{
			reject(e);
		}
	});
};

/*
 * unregisters the app at the telldus server from receiving push notification, with the registered push token.
 */
export const unregisterPushToken = (token: String): ThunkAction => dispatch => {
	const url = format({
		pathname: '/user/unregisterPushToken',
		query: {
			token
		},
	});
	const payload = {
		url,
		requestParams: {
			method: 'GET',
		},
	};
	return LiveApi(payload).then(response => {
		if((!response.error) && (response.status == 'success')) {
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
		if(e == 'TypeError: Network request failed') {
			dispatch({
				type: 'ERROR',
			    message: {
			      error: e,
			      error_description: 'Network request failed. Check your internet connection',
			    },
			});
		}else{
			reject(e);
		}
	})
};
