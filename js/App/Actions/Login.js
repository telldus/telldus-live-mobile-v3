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

import axios from 'axios';
import type { Action, ThunkAction } from './Types';
import { apiServer } from 'Config';
import { publicKey, privateKey, authenticationTimeOut } from 'Config';
import { Answers } from 'react-native-fabric';
import RNFS from 'react-native-fs';
import {LiveApi} from 'LiveApi';
import { destroyAllConnections } from 'Actions_Websockets';

const loginToTelldus = (username:string, password:string): ThunkAction => (dispatch, getState) => {
	return axios({
		method: 'post',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		timeout: authenticationTimeOut,
		url: `${apiServer}/oauth2/accessToken`,
		data: {
			'client_id': publicKey,
			'client_secret': privateKey,
			'grant_type': 'password',
			'username': username,
			'password': password,
		},
	  })
		.then(response => {
			if (response.status === 200) {
				Answers.logLogin('Password', true);
				let token = response.data;
				let authData = {
					'client_id': publicKey,
					'client_secret': privateKey,
					'grant_type': 'password',
					'username': username,
					'password': password,
					 'timeout': authenticationTimeOut,
					'access_token': token.access_token,
					'expires_in': token.expires_in,
					'token_type': token.token_type,
					'scope': token.scope,
					'refresh_token': token.refresh_token,
				};
				writeToFile(JSON.stringify(authData));
				readFile();
				dispatch({
					type: 'RECEIVED_ACCESS_TOKEN',
					accessToken: response.data,
				});
				return response;
			}
		})
		.catch(error => {
			Answers.logLogin('Password', false);
			if (error.response) {
				let errorMessage = error.response.data.error_description ?
					error.response.data.error_description : error.response.data.error ?
						error.response.data.error : 'Unknown Error, Please try again later.';
				dispatch(showLoginError(errorMessage));
			} else if (error.request) {
				let errorMessage = !error.status && error.request._timedOut ? 'Timed out, try again?' : 'Network request failed. Check your internet connection';
				dispatch(showLoginError(errorMessage));
			} else {
				dispatch(showLoginError(error.message));
			}
			return error;
		});
};

function showLoginError(errorMessage: string): Action {
	return {
		type: 'REQUEST_MODAL_OPEN',
		payload: {
			data: errorMessage,
		},
	};
}

async function writeToFile(data) {
	// await FileSystem.writeToFile('auth.txt', data);
	// console.log('Data written successfully!');
var path = RNFS.DocumentDirectoryPath + '/auth.txt';

// write the file
RNFS.writeFile(path, data, 'utf8')
  .then((success) => {
    console.log('FILE WRITTEN!');
  })
  .catch((err) => {
    console.log(err.message);
  });
}

async function readFile() {
	// const fileContents = await FileSystem.readFile('auth.txt');
	// console.log(`read data from file: ${fileContents}`);
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
