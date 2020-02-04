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

import { setUserIdentifier, setUserName } from '../Lib/Analytics';

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
	visibilityExchangeOffer: 'show' | 'hide_temp' | 'hide_perm' | 'force_show',
	visibilityProExpireHeadsup: 'show' | 'hide_temp' | 'hide_perm' | 'force_show',
	generatePushError: string,
	playServicesInfo: Object,
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
	visibilityExchangeOffer: 'show',
	visibilityProExpireHeadsup: 'show',
	generatePushError: '',
	playServicesInfo: {},
};

export default function reduceUser(state: State = initialState, action: Action): State {
	if (action.type === 'persist/REHYDRATE' && action.payload && action.payload.user) {
		const visibilityExchangeOffer = action.payload.user.visibilityExchangeOffer || 'show';
		let nextVEOValue = 'show';
		if (visibilityExchangeOffer === 'hide_temp') {
			nextVEOValue = 'show';
		} else if (visibilityExchangeOffer === 'force_show') {
			nextVEOValue = 'hide_perm';
		} else if (visibilityExchangeOffer === 'hide_perm') {
			nextVEOValue = 'hide_perm';
		}

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
			visibilityExchangeOffer: nextVEOValue,
			visibilityProExpireHeadsup: nextVPEValue,
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
		return {
			...state,
			accessToken: accessToken,
			registeredCredential: false,
			isTokenValid: true,
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
		setUserIdentifier(action.payload.email);
		setUserName(`${action.payload.firstname} ${action.payload.lastname}`);
		return {
			...state,
			userProfile: action.payload,
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
		return {
			...state,
			subscriptions: {
				...action.payload,
			},
		};
	}
	if (action.type === 'CAMPAIGN_VISITED') {
		return {
			...state,
			hasVisitedCampaign: action.payload,
		};
	}
	if (action.type === 'TOGGLE_VISIBILITY_EXCHANGE_OFFER') {
		return {
			...state,
			visibilityExchangeOffer: action.payload,
		};
	}
	if (action.type === 'TOGGLE_VISIBILITY_PRO_EXPIRE_HEADSUP') {
		return {
			...state,
			visibilityProExpireHeadsup: action.payload,
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
