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
import type { Action, ThunkAction } from './Types';
import { publicKey, privateKey, authenticationTimeOut, apiServer } from '../../Config';
import { Answers } from 'react-native-fabric';

import {LiveApi} from '../Lib/LiveApi';
import { destroyAllConnections } from '../Actions/Websockets';

type loginCredential = {
	username: string,
	password: string,
};

type loginCredentialSocial = {
	idToken: string,
};

const loginToTelldus = (credential: loginCredential | loginCredentialSocial): ThunkAction => (dispatch: Function, getState: Function): Promise<any> => {
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
			...credential,
		},
	  })
		.then((response: Object): Object => {
			if (response.status === 200) {
				Answers.logLogin('Password', true);
				dispatch({
					type: 'RECEIVED_ACCESS_TOKEN',
					accessToken: response.data,
				});
				return response;
			}
			throw response;
		})
		.catch((error: Object): Object => {
			Answers.logLogin('Password', false);
			throw error;
		});
};

function updateAccessToken(accessToken: Object): Action {
	return {
		type: 'RECEIVED_ACCESS_TOKEN',
		accessToken: accessToken,
	};
}

function getUserProfile(): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		const payload = {
			url: '/user/profile',
			requestParams: {
				method: 'GET',
			},
		};
		return LiveApi(payload).then((response: Object): Function => dispatch({
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
	return (dispatch: Function): Function => {
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
