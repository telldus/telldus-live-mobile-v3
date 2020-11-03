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
import { utils } from 'live-shared-data';
const { scheduleUtils } = utils;
import isEqual from 'lodash/isEqual';
let dayjs = require('dayjs');
let utc = require('dayjs/plugin/utc');
let _timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(_timezone);

import i18n from '../Translations/common';
import capitalize from './capitalize';
import {
	getSelectedDays,
	getWeekdays,
	getWeekends,
	getTranslatableDays,
} from './getDays';

const getRepeatTime = (type: string, {intl}: Object): string => {
	let { formatMessage } = intl;
	if (type === 'sunrise') {
		return formatMessage(i18n.sunrise);
	} else if (type === 'sunset') {
		return formatMessage(i18n.sunset);
	}
	return formatMessage(i18n.time);
};

const getRepeatDescription = ({
	type, weekdays, intl,
}: Object): string => {
	const { formatMessage, formatDate } = intl;
	const selectedDays: string[] = getSelectedDays(weekdays, formatDate);
	const repeatTime: string = (type === 'time') ? '' : getRepeatTime(type, {
		intl,
	});
	const DAYS = getTranslatableDays(formatDate);

	let repeatDays: string = '';
	if (selectedDays.length === DAYS.length) {
		repeatDays = formatMessage(i18n.repeatDays, { value: repeatTime });
	} else if (isEqual(selectedDays, getWeekdays(formatDate))) {
		repeatDays = formatMessage(i18n.repeatWeekday, { value: repeatTime });
	} else if (isEqual(selectedDays, getWeekends(formatDate))) {
		repeatDays = formatMessage(i18n.repeatWeekend, { value: repeatTime });
	} else {
		for (let day of selectedDays) {
			repeatDays += `${day.slice(0, 3).toLowerCase()}, `;
		}
		repeatDays = capitalize(repeatDays.slice(0, -2));
	}
	return repeatDays.trim();
};

const getTempDay = (job: Object, gateway: Object): Object => {
	const { timezone, sunrise, sunset } = gateway;
	let tempDay;
	if (job.type === 'sunrise') {
		const sunriseInMs = sunrise * 1000;
		const offsetInMs = job.offset * 60 * 1000;
		tempDay = dayjs(sunriseInMs + offsetInMs).tz(timezone);
	} else if (job.type === 'sunset') {
		const sunsetInMs = sunset * 1000;
		const offsetInMs = job.offset * 60 * 1000;
		tempDay = dayjs(sunsetInMs + offsetInMs).tz(timezone);
	} else {
		tempDay = dayjs();
		tempDay = tempDay.hour(job.hour);
		tempDay = tempDay.minute(job.minute);
	}
	return tempDay;
};

module.exports = {
	...scheduleUtils,
	getRepeatTime,
	getRepeatDescription,
	getTempDay,
};
