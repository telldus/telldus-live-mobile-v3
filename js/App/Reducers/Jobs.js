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

import moment from 'moment-timezone';

import filter from 'lodash/filter';
import range from 'lodash/range';
import mapValues from 'lodash/mapValues';

export function parseJobsForListView(jobs: Array<Object> = [], gateways: Object = {}, devices: Object = {}): {sections:Object, sectionIds:Array<Object>} {
	if (!jobs || !jobs.length) {
		return {
			sections: {},
			sectionIds: [],
		};
	}

	const todayInWeek = parseInt(moment().format('d'), 10);
	const sectionIds = range(0, 8);
	let sections = sectionIds.reduce((memo, day) => ({
		...memo,
		[day]: [],
	}), {});

	jobs.forEach(job => {
		let tempDay;
		const device = devices.byId[job.deviceId];
		if (!device) {
			return;
		}
		const gateway = gateways.byId[device.clientId];
		if (!gateway) {
			return;
		}
		const { timezone } = gateway;

		if (job.type === 'sunrise') {
			const { sunrise } = gateway;
			const sunriseInMs = sunrise * 1000;
			const offsetInMs = job.offset * 60 * 1000;
			tempDay = moment(sunriseInMs + offsetInMs).tz(timezone);
		} else if (job.type === 'sunset') {
			const { sunset } = gateway;
			const sunsetInMs = sunset * 1000;
			const offsetInMs = job.offset * 60 * 1000;
			tempDay = moment(sunsetInMs + offsetInMs).tz(timezone);
		} else {
			tempDay = moment();
			tempDay.hours(job.hour);
			tempDay.minutes(job.minute);
		}

		job.effectiveHour = tempDay.format('HH');
		job.effectiveMinute = tempDay.format('mm');
		job.device = device;
		job.gateway = gateway;

		const now = moment().tz(timezone);
		if (job.weekdays) {
			job.weekdays.forEach(day => {
				if (day !== todayInWeek) {
					const relativeDay = (7 + day - todayInWeek) % 7; // 7 % 7 = 0
					return sections[relativeDay].push(job);
				}

				const nowInMinutes = now.hours() * 60 + now.minutes();
				const jobInMinutes = parseInt(job.effectiveHour, 10) * 60 + parseInt(job.effectiveMinute, 10);
				if (jobInMinutes >= nowInMinutes) {
					sections[0].push(job); // today
				} else {
					sections[7].push(job); // today, next week
				}
			});
		}
	});

	sections = mapValues(sections, _jobs => {
		_jobs.sort((a, b) => {
			const totalA = parseInt(a.effectiveHour, 10) * 60 + parseInt(a.effectiveMinute, 10);
			const totalB = parseInt(b.effectiveHour, 10) * 60 + parseInt(b.effectiveMinute, 10);
			if (totalA === totalB) {
				return 0;
			}
			if (totalA < totalB) {
				return -1;
			}
			if (totalA > totalB) {
				return 1;
			}
		});
		return _jobs;
	});

	const filteredSectionIds = filter(sectionIds, sectionId => sections[sectionId].length);
	return {
		sections,
		sectionIds: filteredSectionIds,
	};
}
