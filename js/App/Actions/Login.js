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
import type { Action, ThunkAction, GrantType } from './Types';
import { publicKey, privateKey, authenticationTimeOut, apiServer } from '../../Config';

import {LiveApi} from '../Lib/LiveApi';
import { destroyAllConnections } from '../Actions/Websockets';
import { widgetAndroidDisableAll, widgetiOSRemoveDataFromKeychain } from './Widget';
import { setBoolean } from '../Lib/Analytics';

import {
	setUserIdentifierFirebaseCrashlytics,
	setUserNameFirebaseCrashlytics,
} from './Analytics';

type loginCredential = {
	username: string,
	password: string,
};

type loginCredentialSocial = {
	idToken: string,
};

const loginToTelldus = (credential: loginCredential | loginCredentialSocial, grantType?: GrantType = 'password'): ThunkAction => (dispatch: Function, getState: Function): Promise<any> => {
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
			'grant_type': grantType,
			'scope': 'live-app',
			...credential,
		},
	  })
		.then((response: Object): Object => {
			if (response.status === 200) {
				setBoolean('Password', true);
				dispatch(updateAccessToken({
					...response.data,
					username: credential.username || undefined, // TODO: Shall use user id, once it is available.
				}));
				return response;
			}
			throw response;
		})
		.catch((error: Object): Object => {
			setBoolean('Password', true);
			throw error;
		});
};

function updateAccessToken(accessToken: Object): Action {
	return {
		type: 'RECEIVED_ACCESS_TOKEN',
		accessToken: accessToken,
	};
}

function getUserProfile(_accessToken?: Object): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		const payload = {
			url: '/user/profile',
			requestParams: {
				method: 'GET',
			},
			_accessToken,
		};
		return dispatch(LiveApi(payload)).then((response: Object): Object => {
			dispatch({
				type: 'RECEIVED_USER_PROFILE',
				payload: {
					...payload,
					...response,
				},
			});
			dispatch(setUserIdentifierFirebaseCrashlytics());
			dispatch(setUserNameFirebaseCrashlytics());
			return response;
		}).catch((err: any) => {
			throw err;
		});
	};
}

function logoutFromTelldus(): ThunkAction {
	destroyAllConnections();
	widgetiOSRemoveDataFromKeychain();

	return (dispatch: Function): Function => {
		dispatch(widgetAndroidDisableAll());
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
