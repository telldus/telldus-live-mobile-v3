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

// @flow

'use strict';

import type { Action } from '../Actions/Types';
import { createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';

const defaultDashboardId = 'defaultDashboardId';

export type State = {
	accessToken: any,
	isTokenValid: boolean,
	userProfile: any,
	pushToken: any,
	pushTokenRegistered: any,
	notificationText: any,
	registeredCredential: any,
	showChangeLog: boolean,
	deviceId: string,
	osVersion: string,
	deviceName: string,
	deviceModel: string,
	phonesList: Object,
	subscriptions: Object,
	hasVisitedCampaign: boolean,
	visibilityProExpireHeadsup: 'show' | 'hide_temp' | 'hide_perm' | 'force_show',
	generatePushError: string,
	playServicesInfo: Object,
	firebaseRemoteConfig: Object,
	accounts: Object,
	userId: string,
	activeDashboardId: string,
	iapTransactionConfig: Object,
	iapProducts: Array<Object>,
	iapAvailablePurchases: Array<Object>,
	switchAccountConf: {
		showAS: boolean,
		isLoggingOut: boolean,
	},
	socialAuthConfig: Object,
};

export const initialState = {
	accessToken: false,
	isTokenValid: false,
	userProfile: false,
	pushToken: false,
	pushTokenRegistered: false,
	notificationText: false,
	registeredCredential: false,
	showChangeLog: false,
	deviceId: '',
	osVersion: '',
	deviceName: '',
	deviceModel: '',
	phonesList: {}, // Included in v3.9, and not in migrations, make sure to supply default value while using this prop.
	subscriptions: {}, // Included in v3.12, and not in migrations, make sure to supply default value while using this prop.
	hasVisitedCampaign: false,
	visibilityProExpireHeadsup: 'show',
	generatePushError: '',
	playServicesInfo: {},
	firebaseRemoteConfig: {},
	accounts: {},
	userId: '',
	activeDashboardId: defaultDashboardId,
	iapTransactionConfig: {},
	iapProducts: [],
	iapAvailablePurchases: [],
	switchAccountConf: {
		showAS: false,
		isLoggingOut: false,
	},
	socialAuthConfig: {},
};

export default function reduceUser(state: State = initialState, action: Action): State {
	if (action.type === 'persist/REHYDRATE' && action.payload && action.payload.user) {

		const visibilityProExpireHeadsup = action.payload.user.visibilityProExpireHeadsup || 'show';
		let nextVPEValue = 'show';
		if (visibilityProExpireHeadsup === 'hide_temp') {
			nextVPEValue = 'show';
		} else if (visibilityProExpireHeadsup === 'force_show') {
			nextVPEValue = 'hide_perm';
		} else if (visibilityProExpireHeadsup === 'hide_perm') {
			nextVPEValue = 'hide_perm';
		}

		return {
			...state,
			...action.payload.user,
			showChangeLog: false,
			visibilityProExpireHeadsup: nextVPEValue,
			iapTransactionConfig: {},
			switchAccountConf: {
				showAS: false,
				isLoggingOut: false,
			},
			socialAuthConfig: {},
		};
	}
	if (action.type === 'USER_REGISTER') {
		return {
			...state,
			registeredCredential: action.accessToken,
		};
	}
	if (action.type === 'RECEIVED_ACCESS_TOKEN') {
		let accessToken = action.accessToken;
		if (state.accessToken) {
			accessToken.refresh_token = state.accessToken.refresh_token;
		}

		const { accounts = {}} = state;
		let newAccounts = {
			...accounts,
		};

		let userIdN = state.userId;
		let { userId } = accessToken;
		if (userId) {
			userIdN = userId;
			userId = userId.trim().toLowerCase();

			const existAccount = accounts[userId] || {};
			newAccounts[userId] = {
				...existAccount,
				accessToken,
			};
		} else if (userIdN) { // Refreshing access token
			userId = userIdN.trim().toLowerCase();
			const existAccount = accounts[userId] || {};
			const uId = existAccount.userId || userIdN;
			newAccounts[userId] = {
				...existAccount,
				accessToken: {
					...accessToken,
					userId: uId,
				},
			};
		}

		return {
			...state,
			accessToken,
			registeredCredential: false,
			isTokenValid: true,
			accounts: newAccounts,
			userId: userIdN,
		};
	}
	if (action.type === 'RECEIVED_ACCESS_TOKEN_OTHER_ACCOUNT') {
		let accessToken = action.accessToken;

		const { accounts = {}} = state;
		let newAccounts = {
			...accounts,
		};

		let userIdN = state.userId;
		let { userId } = accessToken || {};
		if (userId) {
			userId = userId.trim().toLowerCase();

			const existAccount = accounts[userId] || {};

			if (!existAccount) {
				return state;
			}

			const { refresh_token } = existAccount;

			newAccounts[userId] = {
				...existAccount,
				accessToken: {
					...accessToken,
					refresh_token,
				},
			};
		} else if (userIdN) { // Refreshing access token
			userId = userIdN.trim().toLowerCase();
			const existAccount = accounts[userId] || {};
			const uId = existAccount.userId || userIdN;

			const refresh_token = existAccount.refresh_token || state.accessToken.refresh_token;

			newAccounts[userId] = {
				...existAccount,
				accessToken: {
					...accessToken,
					userId: uId,
					refresh_token,
				},
			};
		}

		return {
			...state,
			accounts: newAccounts,
		};
	}
	if (action.type === 'RECEIVED_PUSH_TOKEN') {
		return {
			...state,
			pushToken: action.pushToken,
		};
	}
	if (action.type === 'GENERATE_PUSH_TOKEN_ERROR') {
		return {
			...state,
			generatePushError: action.generatePushError,
		};
	}
	if (action.type === 'PLAY_SERVICES_INFO') {
		return {
			...state,
			playServicesInfo: action.payload,
		};
	}
	if (action.type === 'PUSH_TOKEN_REGISTERED') {
		const {
			deviceId,
			osVersion,
			name: deviceName,
			model: deviceModel,
		} = action.payload;
		return {
			...state,
			pushTokenRegistered: true,
			deviceId,
			osVersion,
			deviceName,
			deviceModel,
		};
	}
	if (action.type === 'PUSH_TOKEN_UNREGISTERED') {
		return {
			...state,
			pushTokenRegistered: false,
		};
	}
	if (action.type === 'PUSH_TOKEN_DELETED') {
		return {
			...state,
			pushTokenRegistered: false,
			deviceId: '',
			osVersion: '',
			deviceName: '',
			deviceModel: '',
		};
	}
	if (action.type === 'RECEIVED_USER_PROFILE') {

		const { accounts = {} } = state;
		let newAccounts = {
			...accounts,
		};

		if (action.payload.email) { // TODO: Should use user id, once it is available.
			const email = action.payload.email.trim().toLowerCase();
			const existAccount = accounts[email] || {};

			// Required while upgrading from older version, and already logged in
			if (isEmpty(accounts)) {
				newAccounts[email] = {
					accessToken: {
						...state.accessToken,
						userId: action.payload.email, // TODO: Should use user id, once it is available.
					},
					...action.payload,
				};
			} else {
				newAccounts[email] = {
					...existAccount,
					...action.payload,
				};
			}
		}

		let userIdN = state.userId;
		if (action.payload.email) {
			userIdN = action.payload.email; // TODO: Should use user id, once it is available.
		}

		return {
			...state,
			userProfile: action.payload,
			accounts: newAccounts,
			userId: userIdN,
		};
	}
	if (action.type === 'RECEIVED_USER_PROFILE_OTHER') {

		const { accounts = {} } = state;
		let newAccounts = {
			...accounts,
		};

		const {
			email, // TODO: Should use user id, once it is available.
		} = action.payload;
		if (!email) {
			return state;
		}

		const userId = email.trim().toLowerCase();
		const account = accounts[userId];
		if (!account) {
			return state;
		}

		const updatedAccount = {
			...account,
			...action.payload,
		};

		newAccounts = {
			...newAccounts,
			[userId]: updatedAccount,
		};

		return {
			...state,
			accounts: newAccounts,
		};
	}
	if (action.type === 'LOGGED_OUT') {
		return {
			...initialState,
		};
	}
	if (action.type === 'LOCK_SESSION') {
		return {
			...state,
			isTokenValid: false,
		};
	}
	if (action.type === 'ERROR') {
		return {
			...state,
			notificationText: action.message.error_description,
		};
	}
	if (action.type === 'ACCEPT_EULA_SUCCESS') {
		let userProfile = { ...state.userProfile, eula: action.version };
		return {
			...state,
			userProfile,
		};
	}
	if (action.type === 'SHOW_CHANGE_LOG') {
		return {
			...state,
			showChangeLog: true,
		};
	}
	if (action.type === 'HIDE_CHANGE_LOG') {
		return {
			...state,
			showChangeLog: false,
		};
	}
	if (action.type === 'RECEIVED_PHONES_LIST') {
		// Store only those required attributes!
		const phonesList = action.payload.reduce((acc: Object, phone: Object): Object => {
			const {
				id,
				token,
				name,
				model,
				deviceId,
			} = phone;
			acc[id] = {
				token,
				name,
				model,
				deviceId,
			};
			return acc;
		}, {});

		return {
			...state,
			phonesList,
		};
	}
	if (action.type === 'RECEIVED_USER_SUBSCRIPTIONS') {

		let { accounts = {}, userId = '' } = state;
		let newAccounts = {
			...accounts,
		};

		const subscriptions = action.payload;

		userId = userId.trim().toLowerCase();
		const account = accounts[userId] || {};

		const updatedAccount = {
			...account,
			subscriptions,
		};

		newAccounts = {
			...newAccounts,
			[userId]: updatedAccount,
		};

		return {
			...state,
			subscriptions,
			accounts: newAccounts,
		};
	}
	if (action.type === 'RECEIVED_USER_SUBSCRIPTIONS_OTHER') {

		const { accounts = {}, userId: activeAccUserId = '' } = state;
		let newAccounts = {
			...accounts,
		};

		let {
			userId,
			subscriptions,
		} = action.payload;
		if (!userId) {
			return state;
		}

		userId = userId.trim().toLowerCase();
		const account = accounts[userId];
		if (!account) {
			return state;
		}

		const updatedAccount = {
			...account,
			subscriptions,
		};

		newAccounts = {
			...newAccounts,
			[userId]: updatedAccount,
		};

		// Update if the other account is the active one
		let activeAccountSubscriptions = state.subscriptions;
		if (userId === activeAccUserId.trim().toLowerCase()) {
			activeAccountSubscriptions = subscriptions;
		}

		return {
			...state,
			accounts: newAccounts,
			subscriptions: activeAccountSubscriptions,
		};
	}
	if (action.type === 'CAMPAIGN_VISITED') {
		return {
			...state,
			hasVisitedCampaign: action.payload,
		};
	}
	if (action.type === 'TOGGLE_VISIBILITY_PRO_EXPIRE_HEADSUP') {
		return {
			...state,
			visibilityProExpireHeadsup: action.payload,
		};
	}
	if (action.type === 'SET_FIREBASE_REMOTE_CONFIG') {
		return {
			...state,
			firebaseRemoteConfig: action.payload,
		};
	}
	if (action.type === 'SWITCH_USER_ACCOUNT') {
		let { userId } = action.payload;
		const { accounts = {} } = state;

		const existAccount = accounts[userId] || {};
		const {
			accessToken,
			activeDashboardId = defaultDashboardId,
		} = existAccount;

		if (!accessToken) {
			return state;
		}

		return {
			...state,
			accessToken,
			userId: accessToken.userId,
			activeDashboardId,
		};
	}
	if (action.type === 'LOGGED_OUT_SELECTED') {
		let { userId } = action.payload;
		const { accounts = {} } = state;

		return {
			...state,
			accounts: omit(accounts, userId),
		};
	}
	if (action.type === 'SELECT_DASHBOARD') {
		const { payload: { dashboardId } } = action;

		let { accounts = {}, userId = '' } = state;
		let newAccounts = {
			...accounts,
		};

		const subscriptions = action.payload;

		userId = userId.trim().toLowerCase();
		const account = accounts[userId] || {};

		const updatedAccount = {
			...account,
			subscriptions,
		};

		newAccounts = {
			...newAccounts,
			[userId]: updatedAccount,
		};

		return {
			...state,
			activeDashboardId: dashboardId,
			accounts: newAccounts,
		};
	}
	if (action.type === 'UPDATE_STATUS_IAP_TRANSACTION') {
		return {
			...state,
			iapTransactionConfig: action.payload,
		};
	}
	if (action.type === 'RECEIVED_IN_APP_PURCHASE_PRODUCTS') {
		return {
			...state,
			iapProducts: action.payload,
		};
	}
	if (action.type === 'RECEIVED_IN_APP_AVAILABLE_PURCHASES') {
		return {
			...state,
			iapAvailablePurchases: action.payload,
		};
	}
	if (action.type === 'TOGGLE_VISIBILITY_SWITCH_ACCOUNT_AS') {
		return {
			...state,
			switchAccountConf: action.payload,
		};
	}
	if (action.type === 'SET_SOCIAL_AUTH_CONFIG') {
		return {
			...state,
			socialAuthConfig: action.payload,
		};
	}
	return state;
}

export const getUserProfile = createSelector(
	[({ user }: Object): Object => user.userProfile],
	(userProfile: Object): Object => userProfile || {
		firstname: '',
		lastname: '',
		email: '',
		eula: 1,
	},
);
