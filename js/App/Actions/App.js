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

import DeviceInfo from 'react-native-device-info';
import axios from 'axios';

import type { ThunkAction, TicketData } from './Types';

import { osTicketKey } from '../../Config';
import { hasTokenExpired } from '../Lib';

import { ticketTopicIds } from '../../Constants';
const {
	LOCAL_CONTROL_TROUBLESHOOT,
	GENERAL,
} = ticketTopicIds;
const { dev, release } = LOCAL_CONTROL_TROUBLESHOOT;

const topicId = __DEV__ ? dev : release;
const topicIdGen = __DEV__ ? GENERAL.dev : GENERAL.release;
const url = __DEV__ ? 'http://stage.telldus.se/osticket/api/tickets.json' : 'https://support.telldus.com/api/tickets.json';

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

function createSupportTicketGeneral(gatewayId: number, ticketData: TicketData): ThunkAction {
	return (dispatch: Function, getState: Function): any => {
		const { gateways: {byId} } = getState();

		const gateway = byId[gatewayId] || {};
		const {
			online,
			version = '',
			name = '',
			type = '',
			websocketOnline,
		} = gateway || {};

		let data = JSON.stringify({
			'alert': false,
			'source': 'API',
			'autorespond': true,
			'subject': 'Support from App',
			'appVersion': DeviceInfo.getReadableVersion(),
			'topicId': topicIdGen,
			'phoneModel': DeviceInfo.getModel(),
			'osVersion': DeviceInfo.getSystemVersion(),
			'gatewayModel': type,
			'gatewayName': name,
			'gatewayVersion': version,
			'gatewayStatus': online ? 'online' : 'offline',
			'websocketStatus': websocketOnline ? 'online' : 'offline',
			...ticketData,
		});
		return dispatch(createSupportTicket(data));
	};
}

function createSupportTicket(data: string): ThunkAction {
	return (dispatch: Function, getState: Object): any => {
		return axios({
			method: 'post',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'X-API-Key': osTicketKey,
			},
			timeout: 5 * 1000,
			url,
			data,
		  })
			.then((response: Object): Object => {
				return response.data;
			}).catch((error: any) => {
				throw error;
			});
	};
}

module.exports = {
	...App,
	createSupportTicket,
	createSupportTicketLCT,
	createSupportTicketGeneral,
};

