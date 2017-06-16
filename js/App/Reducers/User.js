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

'use strict';

import type { Action } from 'Actions/Types';

import { createSelector } from 'reselect';

export type State = {
	accessToken: ?Object,
	userProfile: ?Object
};

const initialState = {
  accessToken: false,
  userProfile: false,
  pushToken: false,
  pushTokenRegistered: false
};

export default function reduceUser(state: State = initialState, action: Action): State {
  if (action.type === 'RECEIVED_ACCESS_TOKEN') {
    let accessToken = action.accessToken;
    if (state.accessToken) {
      accessToken.refresh_token = state.accessToken.refresh_token;
    }
    return {
      ...state,
      accessToken: accessToken,
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
  return state;
}

export const getUserProfile = createSelector(
	[ ({ user }) => user.userProfile ],
	(userProfile) => userProfile || { firstname: '', lastname: '', email: '' },
);
