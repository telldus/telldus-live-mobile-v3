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

import type { ThunkAction, TicketData } from './Types';

import DeviceInfo from 'react-native-device-info';

import { osTicketKey } from '../../Config';
import { hasTokenExpired } from '../Lib';

import { ticketTopicIds } from '../../Constants';
const { LOCAL_CONTROL_TROUBLESHOOT } = ticketTopicIds;
const { dev, release } = LOCAL_CONTROL_TROUBLESHOOT;

const topicId = __DEV__ ? dev : release;
const url = __DEV__ ? 'http://stage.telldus.se/osticket/api/tickets.json' : 'http://support.telldus.com/api/tickets.json';

// Device actions that are shared by both Web and Mobile.
import { actions } from 'live-shared-data';
const { App } = actions;

function createSupportTicketLCT(gatewayId: number, ticketData: TicketData): ThunkAction {
	return (dispatch: Function, getState: Function): any => {
		const { user, gateways: {byId} } = getState();
		const { userProfile = {} } = user;
		const { email, firstname, lastname } = userProfile;

		const gateway = byId[gatewayId];
		const { localKey = {}, online, uuid } = gateway || {};
		const { key, ttl, address, macAddress } = localKey;
		let tokenExpired = hasTokenExpired(ttl);
		const keyInfo = !key ? 'null' : tokenExpired ? 'expired' : true;

		const deviceUniqueID = DeviceInfo.getUniqueID();

		return DeviceInfo.getIPAddress().then((ip: string): any => {
			let data = JSON.stringify({
				'alert': false,
				'subject': 'Local control does not work',
				'name': `${firstname} ${lastname}`,
				'source': 'API',
				'autorespond': true,
				'topicId': topicId,
				'online': online,
				'key': keyInfo,
				'uuid': uuid === null ? 'null' : uuid,
				'phoneIP': ip === null ? 'null' : ip,
				'gatewayIP': address === null ? 'null' : address,
				'macAddress': macAddress === null ? 'null' : macAddress,
				'deviceName': DeviceInfo.getDeviceName(),
				'appVersion': DeviceInfo.getReadableVersion(),
				'deviceUniqueID': deviceUniqueID,
				'liveAccount': email,
				...ticketData,
			});
			return dispatch(createSupportTicket(data));
		  });
	};
}

function createSupportTicketGlobal(gatewayId: number, ticketData: TicketData): ThunkAction {
	return (dispatch: Function, getState: Function): any => {
		const { user, gateways: {byId} } = getState();
		const { userProfile = {} } = user;
		const { email, firstname, lastname } = userProfile;

		const gateway = byId[gatewayId];
		const { localKey = {}, online, uuid } = gateway || {};
		const { key, ttl, address, macAddress } = localKey;
		let tokenExpired = hasTokenExpired(ttl);
		const keyInfo = !key ? 'null' : tokenExpired ? 'expired' : true;

		const deviceUniqueID = DeviceInfo.getUniqueID();

		return DeviceInfo.getIPAddress().then((ip: string): any => {
			let data = JSON.stringify({
				'alert': false,
				'subject': '',
				'name': `${firstname} ${lastname}`,
				'source': 'API',
				'autorespond': true,
				'topicId': topicId,
				'online': online,
				'key': keyInfo,
				'uuid': uuid === null ? 'null' : uuid,
				'phoneIP': ip === null ? 'null' : ip,
				'gatewayIP': address === null ? 'null' : address,
				'macAddress': macAddress === null ? 'null' : macAddress,
				'deviceName': DeviceInfo.getDeviceName(),
				'appVersion': DeviceInfo.getReadableVersion(),
				'deviceUniqueID': deviceUniqueID,
				'liveAccount': email,
				...ticketData,
			});
			return dispatch(createSupportTicket(data));
		  });
	};
}

function createSupportTicket(data: string): ThunkAction {
	return (dispatch: Function, getState: Object): any => {
		return fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': osTicketKey,
			},
			body: data,
		}).then((response: Object): any => response.json())
			.then((responseJson: Object): any => {
				return responseJson;
			})
			.catch((error: any) => {
				throw error;
			});
	};
}

function authorizeAppForTwitter(base64EncodedKeySecret: string): ThunkAction {
	return (dispatch: Function, getState: Function): Promise<any> => {
		const formData = new FormData();
		formData.append('grant_type', 'client_credentials');
		return axios({
			method: 'post',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': `Basic ${base64EncodedKeySecret}`,
			},
			url: 'https://api.twitter.com/oauth2/token',
			data: formData,
		}).then((response: Object): Object => {
			if (response.data && response.data.access_token) {
				return response.data;
			}
			throw response;
		}).catch((error: Object) => {
			if (error.response) {
				console.log(error.response.data);
				console.log(error.response.status);
				console.log(error.response.headers);
			  } else if (error.request) {
				console.log(error.request);
			  } else {
				console.log('Error', error.message);
			  }
			  console.log(error.config);
		});
	};
}

function getSupportTweets(base64EncodedKeySecret: string, count?: number = 10): ThunkAction {
	return async (dispatch: Function, getState: Function): Promise<any> => {
		try {
			const { access_token } = await dispatch(authorizeAppForTwitter(base64EncodedKeySecret));
			return axios({
				method: 'get',
				headers: {
					'Accept-Encoding': 'gzip',
					'Authorization': `Bearer ${access_token}`,
				},
				url: `https://api.twitter.com/1.1/statuses/user_timeline.json?count=${count}&screen_name=telldus_status&exclude_replies=true&trim_user=true`,
			}).then((response: Object): Object => {
				if (response.data && response.data) {
					return response.data;
				}
				throw response;
			}).catch((error: Object) => {
				if (error.response) {
					console.log(error.response.data);
					console.log(error.response.status);
					console.log(error.response.headers);
			  } else if (error.request) {
					console.log(error.request);
			  } else {
					console.log('Error', error.message);
			  }
			  console.log(error.config);
			});
		} catch (error) {
			console.log(error);
		}
	};
}

module.exports = {
	...App,
	createSupportTicket,
	createSupportTicketLCT,
	createSupportTicketGlobal,
	authorizeAppForTwitter,
	getSupportTweets,
};

