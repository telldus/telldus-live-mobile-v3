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
import { CancelToken } from 'axios';

import { validateLocalControlSupport, resetLocalControlAddress } from './Gateways';
import { LocalApi } from '../Lib/LocalApi';
import { hasTokenExpired, getTokenForLocalControl } from '../Lib/LocalControl';
import type { ThunkAction } from './Types';

let requestTimeout = {};

const initiateGatewayLocalTest = (): ThunkAction => {
	return (dispatch: Function, getState: Function) => {
		let { gateways: { byId } } = getState();
		for (let key in byId) {
			const { localKey = {}, id } = byId[key];
			const { address, key: token, ttl } = localKey;
			const tokenExpired = hasTokenExpired(ttl);

			if (address && ttl && tokenExpired) {
				dispatch(getTokenForLocalControl(id));
			}

			// if 'address' is not available means, either it has never been auto-discovered or action 'RESET_LOCAL_CONTROL_ADDRESS'
			// has already been called on this gateway.
			if (address && token && ttl && !tokenExpired) {
				dispatch(testGatewayLocalControl(address, token, id));
			}
		}
	};
};

const testGatewayLocalControl = (address: string, token: string, clientId: number): ThunkAction => {
	return (dispatch: Function, getState: Function): Promise<any> => {
		const url = format({
			pathname: '/system/info',
		});
		const source = CancelToken.source();
		const payload = {
			address,
			url,
			requestParams: {
				method: 'GET',
				cancelToken: source.token,
			},
			token,
		};

		// Need to achieve timeout and cancel explicity because axios timeout does not work when ip is not reachable
		// https://github.com/axios/axios/issues/647
		requestTimeout[clientId] = setTimeout(() => {
			source.cancel();
		}, 3000);
		return LocalApi(payload).then((response: Object): any => {
			if (requestTimeout[clientId]) {
				clearTimeout(requestTimeout[clientId]);
			}
			const { product } = response;
			if (product) {
				return dispatch(validateLocalControlSupport(clientId, true));
			}
			throw response;
		}).catch(() => {
			if (requestTimeout[clientId]) {
				clearTimeout(requestTimeout[clientId]);
			}

			// This clear/reset the local control 'address' completely.
			// It is important to clear because, if not, upon any device action local control will be tried first,
			// and if address is not reachable, it will cause an unnecessary delay each time.
			dispatch(resetLocalControlAddress(clientId, address));
		});
	};
};

module.exports = {
	testGatewayLocalControl,
	initiateGatewayLocalTest,
};
