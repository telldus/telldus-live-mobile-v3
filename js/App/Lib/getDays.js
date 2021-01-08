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

import { DAYS } from '../../Constants';
let dayjs = require('dayjs');
let _weekday = require('dayjs/plugin/weekday');
dayjs.extend(_weekday);

import { utils } from 'live-shared-data';
const { getDays } = utils;

const getWeekdays = (formatDate: Function): string[] => {
	let weekDays = [];
	if (formatDate) {
		for (let i = 1; i < 6; i++) {
			let day = dayjs().weekday(i);
			const weekday = formatDate(day, {weekday: 'long'});
			weekDays.push(weekday);
		}
		return weekDays;
	}
	return DAYS.slice(0, 5);
};

const getWeekends = (formatDate: Function): string[] => {
	let weekends = [];
	if (formatDate) {
		for (let i = 6; i < 8; i++) {
			let day = dayjs().weekday(i);
			const weekday = formatDate(day, {weekday: 'long'});
			weekends.push(weekday);
		}
		return weekends;
	}
	return DAYS.slice(5, 8);
};

const getTranslatableDays = (formatDate: Function): string[] => {
	let weekDays = [];
	for (let i = 1; i <= 7; i++) {
		let day = dayjs().weekday(i);
		const weekday = formatDate(day, {weekday: 'long'});
		weekDays.push(weekday);
	}
	return weekDays;
};

const getTranslatableDayNames = (formatDate: Function, type: 'short' | 'long' = 'long'): string[] => {
	let weekNames = [];
	for (let i = 0; i < 7; i++) {
		const day = dayjs().weekday(i);
		const weekname = formatDate(day, {weekday: type});
		weekNames.push(weekname);
	}
	return weekNames;
};

const getTranslatableMonthNames = (formatDate: Function, type: 'short' | 'long' = 'long'): string[] => {
	let monthNames = [];
	for (let i = 0; i < 12; i++) {
		const month = dayjs().month(i);
		const monthName = formatDate(month, {month: type});
		monthNames.push(monthName);
	}
	return monthNames;
};

module.exports = {
	...getDays,
	getWeekdays,
	getWeekends,
	getTranslatableDays,
	getTranslatableDayNames,
	getTranslatableMonthNames,
};
