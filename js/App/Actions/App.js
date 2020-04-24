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

import type { ThunkAction, TicketData, Action } from './Types';

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
	return async (dispatch: Function, getState: Function): any => {
		const { user, gateways: {byId} } = getState();
		const { userProfile = {} } = user;
		const { email, firstname, lastname } = userProfile;

		const gateway = byId[gatewayId];
		const {
			localKey = {},
			online,
			uuid,
			websocketOnline,
			websocketConnected,
		} = gateway || {};
		const { key, ttl, address, macAddress, uuid: localUuid } = localKey;
		const tokenExpired = hasTokenExpired(ttl);
		const keyInfo = !key ? 'null' : tokenExpired ? 'expired' : true;
		const ttlString = ttl === null ? 'null' : `${ttl} (${(new Date(ttl * 1000)).toUTCString()})`;

		let websocketStatus = 'offline and disconnected';
		if (websocketOnline && websocketConnected) {
			websocketStatus = 'online and connected';
		} else if (websocketOnline) {
			websocketStatus = 'online and disconnected';
		} else if (websocketConnected) {
			websocketStatus = 'offline and connected';
		}

		const deviceUniqueID = DeviceInfo.getUniqueId();
		const deviceName = await DeviceInfo.getDeviceName();

		return DeviceInfo.getIpAddress().then((ip: string): any => {
			let data = JSON.stringify({
				'alert': false,
				'subject': 'Local control does not work',
				'name': `${firstname} ${lastname}`,
				'source': 'API',
				'autorespond': true,
				'topicId': topicId,
				'online': online,
				'websocketStatus': websocketStatus,
				'key': keyInfo,
				'uuid': uuid,
				'localUuid': localUuid === null ? 'null' : localUuid,
				'ttl': ttlString,
				'phoneIP': ip === null ? 'null' : ip,
				'gatewayIP': address === null ? 'null' : address,
				'macAddress': macAddress === null ? 'null' : macAddress,
				'deviceName': deviceName,
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

function createSupportInAppDebugData(debugData: Object): ThunkAction {
	return (dispatch: Function, getState: Function): any => {

		const { user } = getState();
		const { userProfile = {} } = user;
		const { email } = userProfile;

		let stringifiedData = '';
		Object.keys(debugData).forEach((d: any) => {
			const item = debugData[d];
			if (typeof item === 'object') {
				stringifiedData += `${d}: ${JSON.stringify(item)}\n`;
			} else {
				stringifiedData += `${d}: ${item}\n`;
			}
		});

		let data = JSON.stringify({
			'alert': false,
			'source': 'API',
			'autorespond': true,
			'subject': 'Gateway and Network Info',
			'message': stringifiedData,
			email,
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

const setNetworkConnectionInfo = (payload: Object): Action => {
	return {
		type: 'SET_NETWORK_CONNECTION_INFO',
		payload,
	};
};

const onReceivedInAppPurchaseProducts = (products: Array<Object>): Action => {
	return {
		type: 'RECEIVED_IN_APP_PURCHASE_PRODUCTS',
		payload: products,
	};
};

module.exports = {
	...App,
	createSupportTicket,
	createSupportTicketLCT,
	createSupportTicketGeneral,
	setNetworkConnectionInfo,
	createSupportInAppDebugData,
	onReceivedInAppPurchaseProducts,
};

