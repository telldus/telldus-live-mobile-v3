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

let dayjs = require('dayjs');
let utc = require('dayjs/plugin/utc');
let _timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(_timezone);
import { reportException } from './Analytics';
import * as RNLocalize from 'react-native-localize';

import { utils } from 'live-shared-data';
const { sensorUtils, addSensorUtils } = utils;

import i18n from '../Translations/common';


function formatLastUpdated(minutes: number, lastUpdated: number, formatMessage: Function): string {
	if (minutes <= 0) {
		return formatMessage(i18n.justNow);
	}
	if (minutes === 1) {
		return formatMessage(i18n.minuteAgo, {value: '1'});
	}
	if (minutes < 60) {
		return formatMessage(i18n.minutesAgo, {value: minutes});
	}
	const hours = Math.round(minutes / 60);
	if (hours === 1) {
		return formatMessage(i18n.hourAgo, {value: '1'});
	}
	if (hours < 24) {
		return formatMessage(i18n.hoursAgo, {value: hours});
	}
	const days = Math.round(minutes / 60 / 24);
	if (days === 1) {
		return formatMessage(i18n.dayAgo, {value: '1'});
	}
	if (days <= 7) {
		return formatMessage(i18n.daysAgo, {value: days});
	}
	try {
		return dayjs.unix(lastUpdated).format('MM-DD-YYYY');
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

const formatSensorLastUpdate = (time: string, intl: Object, timestamp: number, gatewayTimezone?: string = RNLocalize.getTimeZone(), sensorLastUpdatedMode?: string = '0'): string => {
	const { formatRelativeTime, formatTime, formatMessage, formatDate } = intl;

	const timeAgo = time.replace(/[0-9]/g, '').trim();
	dayjs.tz.setDefault(gatewayTimezone);

	const now = dayjs().unix();

	const m = dayjs.unix(timestamp);
	const diff = dayjs().diff(m, 'day', true);
	if (diff > 7) {
		dayjs.tz.setDefault();
		return formatDate(m);
	}

	if (sensorLastUpdatedMode === '1') {
		return `${formatDate(m)} ${formatTime(m)}`;
	}

	// 'now' from 'FormattedRelative' matches only when 1 sec is added to dayjs.unix()
	// This prevent from showing 'in 1 second' which is illogic!
	let futureTimes = [];
	for (let i = 1; i < 5; i++) {
		const secs = dayjs.unix(now).add(i, 'second').unix() - dayjs().unix();
		futureTimes.push(formatRelativeTime(secs, undefined, {numeric: 'auto'}).replace(/[0-9]/g, '').trim());// As a CAUTION
	}

	const relNow = formatRelativeTime(0, undefined, {numeric: 'auto'}).replace(/[0-9]/g, '').trim();

	let pastSeconds = [];
	for (let i = 1; i < 4; i++) {
		const secs = dayjs().unix() - dayjs.unix(now).subtract(i, 'second').unix();
		pastSeconds.push(formatRelativeTime(-secs).replace(/[0-9]/g, '').trim());
	}

	if (timeAgo === relNow || (futureTimes.indexOf(timeAgo) !== -1) || (pastSeconds.indexOf(timeAgo) !== -1)) {
		dayjs.tz.setDefault();
		return formatMessage(i18n.justNow);
	}

	dayjs.tz.setDefault();
	return time;
};

module.exports = {
	formatLastUpdated,
	checkIfLarge,
	...sensorUtils,
	formatSensorLastUpdate,
	...addSensorUtils,
};
