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
import _ from 'lodash';

import i18n from '../Translations/common';

const messages = defineMessages({
	dayAgo: {
		id: 'sensor.dayAgo',
		defaultMessage: '{value} day ago',
		description: 'How long ago a sensor was update',
	},
	daysAgo: {
		id: 'sensor.daysAgo',
		defaultMessage: '{value} days ago',
		description: 'How long ago a sensor was update',
	},
	hourAgo: {
		id: 'sensor.hourAgo',
		defaultMessage: '{value} hour ago',
		description: 'How long ago a sensor was update',
	},
	hoursAgo: {
		id: 'sensor.hoursAgo',
		defaultMessage: '{value} hours ago',
		description: 'How long ago a sensor was update',
	},
	justNow: {
		id: 'sensor.justNow',
		defaultMessage: 'just now',
		description: 'How long ago a sensor was update',
	},
	minuteAgo: {
		id: 'sensor.minuteAgo',
		defaultMessage: '{value} minute ago',
		description: 'How long ago a sensor was update',
	},
	minutesAgo: {
		id: 'sensor.minutesAgo',
		defaultMessage: '{value} minutes ago',
		description: 'How long ago a sensor was update',
	},
});


function formatLastUpdated(minutes: number, lastUpdated:number, formatMessage: Function): string {
	if (minutes <= 0) {
		return formatMessage(messages.justNow);
	}
	if (minutes === 1) {
		return formatMessage(messages.minuteAgo, {value: '1'});
	}
	if (minutes < 60) {
		return formatMessage(messages.minutesAgo, {value: minutes});
	}
	const hours = Math.round(minutes / 60);
	if (hours === 1) {
		return formatMessage(messages.hourAgo, {value: '1'});
	}
	if (hours < 24) {
		return formatMessage(messages.hoursAgo, {value: hours});
	}
	const days = Math.round(minutes / 60 / 24);
	if (days === 1) {
		return formatMessage(messages.dayAgo, {value: '1'});
	}
	if (days <= 7) {
		return formatMessage(messages.daysAgo, {value: days});
	}
	try {
		return moment.unix(lastUpdated).format('MM-DD-YYYY');
	} catch (exception) {
		reportException(exception);
		return `${formatMessage(i18n.unknown)}`;
	}
}

function checkIfLarge(value: string): boolean {
	const max = 4;
	let parts = value.split('.');
	let intLength = parts[0] ? parts[0].replace(/[^0-9]/g, '').length : 0;
	let fracLength = parts[1] ? parts[1].length : 0;
	let absLength = fracLength >= 1 ? 1 + intLength : intLength;
	return (absLength > max);
}

function getPowerConsumed(sensors: Array<Object>, clientDeviceId: number): string | null {
	let sensor = _.find(sensors, (item) => {
		return item.sensorId === clientDeviceId;
	});
	if (sensor && sensor.data && !_.isEmpty(sensor.data)) {
		let data = _.find(sensor.data, (item) => {
			return item.name === 'watt' && item.scale === '2';
		});
		return data ? data.value : null;
	}
	return null;
}

module.exports = {
	formatLastUpdated,
	checkIfLarge,
	getPowerConsumed,
};
