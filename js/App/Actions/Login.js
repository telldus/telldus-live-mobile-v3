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
 * @providesModule Actions_Login
 */

// @flow

'use strict';

import type { Action, ThunkAction } from './Types';
import { apiServer } from 'Config';
import { publicKey, privateKey } from 'Config';
import { Answers } from 'react-native-fabric';

import LiveApi from 'LiveApi';
import { destroyAllConnections } from 'Actions_Websockets';

// TODO: rewrite into proper ThunkAction that does its own dispatching
async function loginToTelldus(username:string, password:string): Promise<Action> {

	return new Promise((resolve, reject) => {
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
					'grant_type': 'password',
					'username': username,
					'password': password,
				}),
			}
		)
			.then((response) => response.json())
			.then((responseData) => {
				if (responseData.error) {
					throw responseData;
				}
				Answers.logLogin('Password', true);
				resolve({
					type: 'RECEIVED_ACCESS_TOKEN',
					accessToken: responseData,
				});
			})
			.catch((e) => {
				Answers.logLogin('Password', false);
				reject({
					type: 'ERROR',
					message: {
						...e,
						error_description: !e.error_description && e.message === 'Network request failed'
							? 'Network request failed. Check your internet connection' : e.error_description,
					},
				});
			});
	});

}

function updateAccessToken(accessToken:Object): Action {
	return {
		type: 'RECEIVED_ACCESS_TOKEN',
		accessToken: accessToken,
	};
}

function getUserProfile(): ThunkAction {
	return (dispatch, getState) => {
		const payload = {
			url: '/user/profile',
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then(response => dispatch({
			type: 'RECEIVED_USER_PROFILE',
			payload: {
				...payload,
				...response,
			},
		}));
	};
}

function logoutFromTelldus(): ThunkAction {
	destroyAllConnections();
	return (dispatch) => {
		return dispatch({
			type: 'LOGGED_OUT',
		});
	};

}

module.exports = {
	loginToTelldus,
	logoutFromTelldus,
	getUserProfile,
	updateAccessToken,
};
