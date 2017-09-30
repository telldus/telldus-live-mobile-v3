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

import { REHYDRATE } from 'redux-persist/constants';

const initialState = {
	session: {
		id: undefined,
		ttl: undefined,
	},
};

export default function reduceWebsockets(state: Object = { ...initialState }, action: Object): Object {
	if (action.type === REHYDRATE && action.payload.websockets) {
		return {
			...state,
			session: {
				...action.payload.websockets.session,
				ttl: action.payload.websockets.session.ttl,
			},
		};
	}
	if (action.type === 'SESSION_ID_AUTHENTICATED') {
		const { sessionId, ttl } = action.payload;
		return {
			...state,
			session: {
				id: sessionId,
				ttl: ttl,
			},
		};
	}
	if (action.type === 'LOGGED_OUT') {
		return {
			...initialState,
		};
	}
	return state;
}
