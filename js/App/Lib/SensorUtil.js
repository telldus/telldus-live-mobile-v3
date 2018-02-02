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

import moment from 'moment';
import { reportException } from 'Analytics';
import { defineMessages } from 'react-intl';

import i18n from '../Translations/common';

const messages = defineMessages({
	dayAgo: {
		id: 'sensor.dayAgo',
		defaultMessage: 'day ago',
		description: 'How long ago a sensor was update',
	},
	daysAgo: {
		id: 'sensor.daysAgo',
		defaultMessage: 'days ago',
		description: 'How long ago a sensor was update',
	},
	hourAgo: {
		id: 'sensor.hourAgo',
		defaultMessage: 'hour ago',
		description: 'How long ago a sensor was update',
	},
	hoursAgo: {
		id: 'sensor.hoursAgo',
		defaultMessage: 'hours ago',
		description: 'How long ago a sensor was update',
	},
	justNow: {
		id: 'sensor.justNow',
		defaultMessage: 'just now',
		description: 'How long ago a sensor was update',
	},
	minuteAgo: {
		id: 'sensor.minuteAgo',
		defaultMessage: 'minute ago',
		description: 'How long ago a sensor was update',
	},
	minutesAgo: {
		id: 'sensor.minutesAgo',
		defaultMessage: 'minutes ago',
		description: 'How long ago a sensor was update',
	},
});


function formatLastUpdated(minutes: number, lastUpdated:number, formatMessage: Function): string {
	if (minutes <= 0) {
		return formatMessage(messages.justNow);
	}
	if (minutes === 1) {
		return `1 ${formatMessage(messages.minuteAgo)}`;
	}
	if (minutes < 60) {
		return `${minutes} ${formatMessage(messages.minutesAgo)}`;
	}
	const hours = Math.round(minutes / 60);
	if (hours === 1) {
		return `1 ${formatMessage(messages.hourAgo)}`;
	}
	if (hours < 24) {
		return `${hours} ${formatMessage(messages.hoursAgo)}`;
	}
	const days = Math.round(minutes / 60 / 24);
	if (days === 1) {
		return `1 ${formatMessage(messages.dayAgo)}`;
	}
	if (days <= 7) {
		return `${days} ${formatMessage(messages.daysAgo)}`;
	}
	try {
		return moment.unix(lastUpdated).format('MM-DD-YYYY');
	} catch (exception) {
		reportException(exception);
		return `${formatMessage(i18n.unknown)}`;
	}
}

module.exports = {
	formatLastUpdated,
};
