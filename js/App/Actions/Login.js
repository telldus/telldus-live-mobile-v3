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

import {
	updateAccessToken,
} from './Auth';
import type { ThunkAction, GrantType } from './Types';
import { publicKey, privateKey, authenticationTimeOut, apiServer } from '../../Config';

import {LiveApi} from '../Lib/LiveApi';
import { destroyAllConnections } from '../Actions/Websockets';
import { widgetDisableAll } from './Widget';
import {
	setBoolean,
} from '../Lib/Analytics';

import {
	getPremiumAccounts,
	isAutoRenew,
} from '../Lib/appUtils';

import {
	setUserNameFirebaseCrashlytics,
} from './Analytics';

type loginCredential = {|
	username: string,
	password: string,
|};

type loginCredentialSocial = {|
	idToken: string,
|};

type loginCredentialApple = {|
	id_token: string,
|};

const loginToTelldus = (credential: loginCredential | loginCredentialSocial | loginCredentialApple, grantType?: GrantType = 'password', extras?: Object = {
	isSwitchingAccount: false,
}): ThunkAction => (dispatch: Function, getState: Function): Promise<any> => {
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
		.then(async (response: Object): Object => {
			if (response.status === 200) {
				let responseUp = {};
				try {
					responseUp = await dispatch(getUserProfile(response.data, {
						performPostSuccess: false,
					}));
				} catch (e) {
					throw e;
				} finally {

					const {
						user: {
							userProfile = {},
						},
					} = getState();
					// Do not allow user to switch into same account multiple times
					if (extras.isSwitchingAccount && userProfile.uuid && (responseUp.uuid === userProfile.uuid)) {
						throw new Error('Already logged into this account.');
					}

					setBoolean('Password', 'true');
					dispatch(updateAccessToken({
						...response.data,
						userId: responseUp.uuid,
					}));
					return response;
				}
			}
			throw response;
		})
		.catch((error: Object): Object => {
			setBoolean('Password', 'true');
			throw error;
		});
};

/**
 *
 * @param {Object} _accessToken : Should have all attributes received upon login and cached in store.
 * @param {boolean} cancelAllPending : If true, will cancel all pending API calls if any.
 * @param {boolean} activeAccount : If true, will update active accounts user profile, else the account that belongs to the received user id
 */
function getUserProfile(_accessToken?: Object = undefined, extras?: Object = {}): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		const {
			cancelAllPending = false,
			activeAccount = true,
			performPostSuccess = true,
		} = extras;
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
				if (!performPostSuccess) {
					return response;
				}
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
	return (dispatch: Function): Function => {

		destroyAllConnections();
		dispatch(widgetDisableAll());

		return dispatch({
			type: 'LOGGED_OUT',
		});
	};
}

function logoutSelectedFromTelldus(data: Object): ThunkAction {
	return (dispatch: Function, getState: Function): Function => {

		destroyAllConnections();
		dispatch(widgetDisableAll());

		return dispatch({
			type: 'LOGGED_OUT_SELECTED',
			payload: {
				...data,
			},
		});
	};
}
function onSwitchAccount(payload: Object): ThunkAction {
	return (dispatch: Function, getState: Function): Function => {

		destroyAllConnections();
		dispatch(widgetDisableAll());

		return dispatch({
			type: 'SWITCH_USER_ACCOUNT',
			payload,
		});
	};
}

function prepareCommonGAProperties(): ThunkAction {
	return (dispatch: Function, getState: Function): Object => {
		const {
			user: {
				accounts = {},
				userProfile = {},
			},
		} = getState();

		const permission = typeof userProfile.permission === 'undefined' ? 0 : userProfile.permission;
		// eslint-disable-next-line no-bitwise
		const beta = (permission & 1) === 1 ? 'true' : 'false';

		const premAccounts = getPremiumAccounts(accounts);
		const isPremium = Object.keys(premAccounts).length > 0;

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
				beta,
			};
		}

		let dates = [];
		Object.keys(premAccounts).forEach((userId: string) => {
			const { pro, subscriptions } = premAccounts[userId];
			if (!isAutoRenew(subscriptions)) {
				dates.push(pro);
			}
		});

		return {
			isPremium: 'true',
			premiumDate: dates.length > 0 ? min(dates).toString() : '',
			beta,
		};
	};
}

module.exports = {
	loginToTelldus,
	logoutFromTelldus,
	getUserProfile,
	logoutSelectedFromTelldus,
	onSwitchAccount,
	prepareCommonGAProperties,
};
