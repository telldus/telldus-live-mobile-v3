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

import type { Action } from 'Actions_Types';
import { Crashlytics } from 'react-native-fabric';

import { createSelector } from 'reselect';

export type State = {
	accessToken: any,
	isTokenValid: boolean,
	userProfile: any,
	pushToken: any,
	pushTokenRegistered: any,
	notificationText: any,
	registeredCredential: any,
};

const initialState = {
	accessToken: false,
	isTokenValid: false,
	userProfile: false,
	pushToken: false,
	pushTokenRegistered: false,
	notificationText: false,
	registeredCredential: false,
};

export default function reduceUser(state: State = initialState, action: Action): State {
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
	if (action.type === 'PUSH_TOKEN_REGISTERED') {
		return {
			...state,
			pushTokenRegistered: true,
		};
	}
	if (action.type === 'RECEIVED_USER_PROFILE') {
		Crashlytics.setUserName(`${action.payload.firstname} ${action.payload.lastname}`);
		Crashlytics.setUserEmail(action.payload.email);
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
	return state;
}

export const getUserProfile = createSelector(
	[({ user }) => user.userProfile],
	(userProfile) => userProfile || {
		firstname: '',
		lastname: '',
		email: '',
	},
);
