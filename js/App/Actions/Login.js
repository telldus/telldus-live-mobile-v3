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
const gravatar = require('gravatar-api');
import {
	ImageCacheManager,
} from 'react-native-cached-image';
import max from 'lodash/max';
import min from 'lodash/min';

import type { Action, ThunkAction, GrantType } from './Types';
import { publicKey, privateKey, authenticationTimeOut, apiServer } from '../../Config';

import {LiveApi} from '../Lib/LiveApi';
import { destroyAllConnections } from '../Actions/Websockets';
import { widgetAndroidDisableAll, widgetiOSRemoveDataFromKeychain } from './Widget';
import {
	setBoolean,
} from '../Lib/Analytics';

import {
	getPremiumAccounts,
	isAutoRenew,
} from '../Lib/appUtils';

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
					userId: credential.username || undefined, // TODO: Should use user id, once it is available.
				})); // https://code.telldus.com/telldus/live-api/issues/143
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

/**
 *
 * @param {Object} _accessToken : Should have all attributes received upon login and cached in store.
 * @param {boolean} cancelAllPending : If true, will cancel all pending API calls if any.
 * @param {boolean} activeAccount : If true, will update active accounts user profile, else the account that belongs to the received user id
 */
function getUserProfile(_accessToken?: Object = undefined, cancelAllPending?: boolean = false, activeAccount?: boolean = true): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		const payload = {
			url: '/user/profile',
			requestParams: {
				method: 'GET',
			},
			_accessToken,
			cancelAllPending,
		};
		return dispatch(LiveApi(payload)).then((response: Object): Object => {
			if (response && response.email) {
				if (activeAccount) {
					dispatch({
						type: 'RECEIVED_USER_PROFILE',
						payload: {
							...payload,
							...response,
						},
					});
				} else {
					dispatch({
						type: 'RECEIVED_USER_PROFILE_OTHER',
						payload: {
							...payload,
							...response,
						},
					});
				}

				dispatch(setUserIdentifierFirebaseCrashlytics());
				dispatch(setUserNameFirebaseCrashlytics());

				try {
					let options = {
						email: response.email,
						parameters: { 'size': '200', 'd': 'mm' },
						secure: true,
					};
					const url = gravatar.imageUrl(options);
					ImageCacheManager().downloadAndCacheUrl(url, {
						useQueryParamsInCacheKey: true,
					});
				} catch (e) {
					// Just ignore
				} finally {
					return response;
				}
			}
			throw response;
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

function logoutSelectedFromTelldus(data: Object): ThunkAction {
	destroyAllConnections();
	widgetiOSRemoveDataFromKeychain();

	return (dispatch: Function): Function => {
		dispatch(widgetAndroidDisableAll());
		return dispatch({
			type: 'LOGGED_OUT_SELECTED',
			payload: {
				...data,
			},
		});
	};
}
function onSwitchAccount(payload: Object): ThunkAction {
	destroyAllConnections();
	widgetiOSRemoveDataFromKeychain();

	return (dispatch: Function): Function => {
		dispatch(widgetAndroidDisableAll());
		return dispatch({
			type: 'SWITCH_USER_ACCOUNT',
			payload,
		});
	};
}

function prepareGAPremiumProperties(): ThunkAction {
	return (dispatch: Function, getState: Function): Object => {
		const {
			user: {
				accounts = {},
			},
		} = getState();

		let isPremium = false, premiumDate = '';

		const premAccounts = getPremiumAccounts(accounts);
		isPremium = Object.keys(premAccounts).length > 0;

		if (!isPremium) {
			let dates = [];
			Object.keys(accounts).forEach((userId: string) => {
				const { pro = -1 } = accounts[userId];
				dates.push(pro);
			});

			let greatestTS = max(dates);
			greatestTS = greatestTS === -1 ? '' : greatestTS;

			return {
				isPremium: 'false',
				premiumDate: greatestTS.toString(),
			};
		}

		let dates = [], hasARecurringSubs = false;
		Object.keys(premAccounts).forEach((userId: string) => {
			const { pro, subscriptions } = premAccounts[userId];
			if (isAutoRenew(subscriptions)) {
				hasARecurringSubs = true;
			}
			dates.push(pro);
		});

		premiumDate = hasARecurringSubs ? '' : min(dates).toString();

		return {
			isPremium: 'true',
			premiumDate,
		};
	};
}

module.exports = {
	loginToTelldus,
	logoutFromTelldus,
	getUserProfile,
	updateAccessToken,
	logoutSelectedFromTelldus,
	onSwitchAccount,
	prepareGAPremiumProperties,
};
