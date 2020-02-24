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
import { format } from 'url';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';

// User actions that are shared by both Web and Mobile.
import { actions } from 'live-shared-data';
const { User } = actions;

const { getUserSubscriptions } = User;

import type { ThunkAction, Action } from './Types';
import { publicKey, privateKey, apiServer } from '../../Config';
import { LiveApi } from '../Lib';
import { setBoolean } from '../Lib/Analytics';

import {
	getUserProfile,
} from './Login';

const prepareDeviceId = (deviceId: string = ''): string => {
	deviceId = deviceId.trim();
	return (!deviceId || deviceId.length === 0) ? DeviceInfo.getUniqueID() : deviceId;
};

/*
 * registers the app at the telldus server for receiving push notification, with push token and other device information.
 */
const registerPushToken = (token: string, name: string, model: string, manufacturer: string, osVersion: string, deviceId: string = '', pushServiceId: number ): ThunkAction => (dispatch: Function): Promise<any> => {
	deviceId = prepareDeviceId(deviceId);
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
	return dispatch(LiveApi(payload)).then((response: Object): any => {
		if ((!response.error) && (response.status === 'success')) {
			dispatch({
				type: 'PUSH_TOKEN_REGISTERED',
				token: token,
				payload: {
					...payload,
					...response,
					deviceId,
					osVersion,
					name,
					model,
				},
			});
			return response;
		}
		throw response;
	}).catch((e: Object) => {
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
const unregisterPushToken = (token: string): ThunkAction => (dispatch: Function): Promise<any> => {
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
	return dispatch(LiveApi(payload)).then((response: Object): any => {
		if ((!response.error) && (response.status === 'success')) {
			dispatch({
				type: 'PUSH_TOKEN_UNREGISTERED',
				token: token,
				payload: {
					...payload,
					...response,
				},
			});
			return response;
		}
		throw response;
	}).catch((e: Object) => {
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

const registerUser = (email: string, firstName: string, lastName: string): ThunkAction => (dispatch: Function, getState: Function): Promise<any> => {
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
		.then((response: Object): Object => response.json())
		.then((responseData: Object): any => {
			if (responseData.error) {
				throw responseData;
			}
			setBoolean('Email', true);
			dispatch({
				type: 'USER_REGISTER',
				accessToken: {
					...responseData,
					userId: email || undefined, // TODO: Should use user id, once it is available.
					// https://code.telldus.com/telldus/live-api/issues/143
				},
			});
			return responseData;
		}).catch((e: Object): any => {
			setBoolean('Email', false);
			throw e;
		});
};

const forgotPassword = (email: string): ThunkAction => (dispatch: Function, getState: Function): Promise<any> => {
	let formData = new FormData();
	formData.append('email', email);
	formData.append('client_id', publicKey);
	formData.append('client_secret', privateKey);
	return fetch(
		`${apiServer}/oauth2/user/forgotPassword`,
		{
			method: 'POST',
			body: formData,
		}
	)
		.then((response: Object): Object => response.json())
		.then((responseData: Object): any => {
			if (responseData.error) {
				throw responseData;
			}
			return responseData;
		}).catch((e: Object): any => {
			throw e;
		});
};

const showChangeLog = (): Action => {
	return {
		type: 'SHOW_CHANGE_LOG',
	};
};

const hideChangeLog = (): Action => {
	return {
		type: 'HIDE_CHANGE_LOG',
	};
};

function deletePushToken(token: string): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		const url = format({
			pathname: '/user/deletePushToken',
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
		return dispatch(LiveApi(payload)).then((response: Object): Object => {
			const { status } = response;
			if (status && status === 'success') {
				dispatch({
					type: 'PUSH_TOKEN_DELETED',
					token: token,
					payload: {
						...response,
					},
				});
				return response;
			}
			throw response;
		}).catch((err: any) => {
			throw err;
		});
	};
}

function getPhonesList(): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		const payload = {
			url: '/user/listPhones',
			requestParams: {
				method: 'GET',
			},
		};
		return dispatch(LiveApi(payload)).then((response: Object): Object => {
			const { phone } = response;
			if (phone) {
				dispatch(receivedPhonesList(phone));
			}
			return response;
		}).catch((err: any) => {
			throw err;
		});
	};
}

const receivedPhonesList = (payload: Array<Object> = []): Action => {
	return {
		type: 'RECEIVED_PHONES_LIST',
		payload,
	};
};

type OPTIONS = {
	product: string,
	quantity: number,
	subscription: 0 | 1,
	paymentProvider: string,
	returnUrl: string,
};
// See https://ca-api.telldus.com/explore/user/createTransaction
function createTransaction(options: OPTIONS, isMobile?: boolean = false): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		let formData = new FormData();
		Object.keys(options).map((key: string) => {
			formData.append(key, options[key]);
		});
		const { user: { accessToken } } = getState();
		return axios({
			method: 'post',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken.access_token}`,
			},
			url: `${apiServer}/oauth2/user/createTransaction`,
			data: formData,
		}).then((response: Object): Object => {
			if (response.data && response.data.id) {
				return response.data;
			}
			throw response;
		}).catch((err: Object): Object => {
			throw err;
		});
	};
}

function campaignVisited(value: boolean): Action {
	return {
		type: 'CAMPAIGN_VISITED',
		payload: value,
	};
}

function toggleVisibilityExchangeOffer(value: 'show' | 'hide_temp' | 'hide_perm' | 'force_show'): Action {
	return {
		type: 'TOGGLE_VISIBILITY_EXCHANGE_OFFER',
		payload: value,
	};
}

function toggleVisibilityProExpireHeadsup(value: 'show' | 'hide_temp' | 'hide_perm' | 'force_show'): Action {
	return {
		type: 'TOGGLE_VISIBILITY_PRO_EXPIRE_HEADSUP',
		payload: value,
	};
}

function updateAllAccountsInfo(): ThunkAction {
	return (dispatch: Function, getState: Function) => {

		const {
			user: {
				accounts = {},
				userId: activeUserId = '',
			},
		} = getState();

		Object.keys(accounts).forEach((userId: string) => {
			const { accessToken } = accounts[userId];
			if (accessToken && (activeUserId.trim().toLowerCase() !== userId.trim().toLowerCase())) {
				dispatch(getUserProfile(accessToken, false, false));
				dispatch(getUserSubscriptions(accessToken));
			}
		});
	};
}

module.exports = {
	...User,
	registerPushToken,
	registerUser,
	unregisterPushToken,
	showChangeLog,
	hideChangeLog,
	forgotPassword,
	getPhonesList,
	deletePushToken,
	createTransaction,
	campaignVisited,
	toggleVisibilityExchangeOffer,
	toggleVisibilityProExpireHeadsup,
	updateAllAccountsInfo,
};
