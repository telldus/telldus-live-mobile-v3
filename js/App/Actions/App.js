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

import { APIKey } from '../../Config';

import { ticketTopicIds } from '../../Constants';
const { LOCAL_CONTROL_TROUBLESHOOT } = ticketTopicIds;
const { dev, release } = LOCAL_CONTROL_TROUBLESHOOT;

const topicId = __DEV__ ? dev : release;

// Device actions that are shared by both Web and Mobile.
import { actions } from 'live-shared-data';
const { App } = actions;

function createSupportTicket(message: string): ThunkAction {
	return (dispatch: Function, getState: Object): any => {
		const { user } = getState();
		const { userProfile = {} } = user;
		const { email, firstname, lastname } = userProfile;

		let data = JSON.stringify({
			'alert': false,
			'message': message,
			'errorMsg': 'errorMsg',
			'subject': 'Local control does not work',
			'name': `${firstname} ${lastname}`,
			'email': email,
			'source': 'Web',
			'autorespond': true,
			'topicId': topicId,
		});
		return fetch('http://stage.telldus.se/osticket/api/tickets.json', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': APIKey,
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
};

