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

import moment from 'moment';
import { format } from 'url';

import { LiveApi } from './LiveApi';
import { getRSAKey } from './RSA';
import type { ThunkAction } from '../Actions/Types';
import { localControlSuccess, localControlError } from '../Actions/LocalControl';
/**
 *
 * @id - The gateway ID, for which token has to be refreshed.
 *
 * This method requests for a new local control token, and the token is recieved through socket.
 * Upon successful receival it is decrypted and stored in the redux store.
 *
 */
function getTokenForLocalControl(id: number): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		return getRSAKey(false, ({ pemPub }: Object): any => {
			if (pemPub) {
				let formData = new FormData();
				let clientId = id.toString();
				formData.append('id', clientId);
				formData.append('publicKey', pemPub);
				const url = format({
					pathname: '/client/requestLocalKey',
				});
				const payload = {
					url,
					requestParams: {
						method: 'POST',
						body: formData,
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'multipart/form-data',
						},
					},
				};
				return dispatch(LiveApi(payload)).then((response: Object): Object => {
					if (response && response.uuid) {
						dispatch(localControlSuccess(id, response.uuid));
						return response;
					}
					throw response;
				}).catch((err: Object) => {
					dispatch(localControlError(id));
					throw err;
				});
			}
		});
	};
}

function hasTokenExpired(ttl: number): boolean {
	if (!ttl) {
		return true;
	}
	const now = moment();
	const expDate = moment.unix(ttl);
	const hasExpired = now.isSameOrAfter(expDate);
	return hasExpired;
}

module.exports = {
	getTokenForLocalControl,
	hasTokenExpired,
};
