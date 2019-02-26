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

function LocalApi({ address, url, requestParams, token }: {address: string, url: string, requestParams: Object, token: string}): Promise<any> {
	return new Promise((resolve: Function, reject: Function): Promise<any> => {
		return doApiCall(address, url, requestParams, token).then((response: Object): any => {
			if (!response) {
				return reject(new Error('unexpected error: response empty'));
			}
			resolve(response);
		}).catch((error: Object): any => {
			reject(error);
		});
	});
}

async function doApiCall(address: string, url: string, requestParams: Object, token: string): any {
	let response = await callEndPoint(address, url, requestParams, token);
	if (!response.error) {
		// All is well, so return the data from the API.
		return response;
	}

	throw new Error(response.error);
}

async function callEndPoint(address: string, url: string, requestParams: Object, token: string): Object {
	let params = {};

	if (!token) {
		throw new Error('LiveApi: need accessToken');
	}

	if (requestParams.headers) {
		const headers = { ...requestParams.headers, 'Authorization': `Bearer ${token}` };
		params = { ...requestParams, headers };
	} else {
		params = Object.assign({}, requestParams, {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			},
		});
	}
	let response = await axios(`http://${address}/api${url}`, params);
	let { data = {} } = response;
	return data;
}

module.exports = {
	LocalApi,
};
