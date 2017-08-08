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

import LiveApi from './LiveApi';
import moment from 'moment-timezone';

type Time = {
	hour: number,
	minute: number,
};

export default function getSuntime(clientId: number, type: string): Promise<Time> {
	const request = {
		url: `/client/info?id=${clientId}&extras=suntime,timezone`,
		requestParams: {
			method: 'GET',
		},
	};

	return LiveApi(request).then((response: Object): Time => {
		const time = moment(response[type] * 1000).tz(response.timezone);

		return {
			hour: time.hour(),
			minute: time.minute(),
		};
	});
}
