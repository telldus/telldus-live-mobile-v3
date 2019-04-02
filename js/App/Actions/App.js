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

import type { ThunkAction } from './Types';

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

function createSupportTicketLCT(gatewayId: number, message: string, error: string, router: string, connectionType: string, connectionEffectiveType: string): ThunkAction {
	return (dispatch: Function, getState: Object): any => {
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
				'message': message,
				'errorMsg': error,
				'subject': 'Local control does not work',
				'name': `${firstname} ${lastname}`,
				'email': email,
				'source': 'API',
				'autorespond': true,
				'topicId': topicId,
				'online': online,
				'key': keyInfo,
				'uuid': uuid,
				'phoneIp': ip,
				'gatewayIp': address,
				'macAddress': macAddress,
				'connectionType': connectionType,
				'connectionEffectiveType': connectionEffectiveType,
				'deviceName': DeviceInfo.getDeviceName(),
				'deviceUniqueID': deviceUniqueID,
				router: router,
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

module.exports = {
	...App,
	createSupportTicket,
	createSupportTicketLCT,
};

