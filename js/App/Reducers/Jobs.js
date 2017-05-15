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
 * @providesModule Reducers/Jobs
 */

'use strict';

import type { Action } from '../actions/types';

import moment from 'moment-timezone';

import filter from 'lodash/filter';
import range from 'lodash/range';
import mapValues from 'lodash/mapValues';

export type State = ?Object;

const initialState = [];
const jobInitialState = {};

function reduceJob(state: State = jobInitialState, action: Action): State {
	switch (action.type) {
		case 'RECEIVED_JOBS':
			let newJob = {
				id: parseInt(state.id, 10),
				deviceId: parseInt(state.deviceId, 10),
				method: parseInt(state.method, 10),
				methodValue: parseInt(state.methodValue, 10),
				nextRunTime: parseInt(state.nextRunTime, 10),
				type: state.type,
				hour: parseInt(state.hour, 10),
				minute: parseInt(state.minute, 10),
				offset: parseInt(state.offset, 0),
				randomInterval: parseInt(state.randomInterval, 10),
				retries: parseInt(state.retries, 10),
				retryInterval: parseInt(state.retryInterval, 10),
				reps: parseInt(state.reps, 10),
				active: Boolean(state.active),
				weekdays: state.weekdays.split(',').map(day => parseInt(day, 10)),
			};
			return newJob;
		default:
			return state;
	}
}

export default function reduceJobs(state: State = initialState, action: Action): State {
	if (action.type === 'RECEIVED_JOBS') {
		return action.payload.job.map(jobState =>
			reduceJob(jobState, action)
		);
	}

	return state;
}

export function parseJobsForListView(jobs = [], gateways = [], devices = []) {
	if (!jobs || !jobs.length) {
		return {
			items: {},
			sectionIds: [],
		};
	}

	// TODO: move lookup to its reducer
	const gatewaysById = gateways.reduce((memo, gateway) => ({
		...memo,
		[gateway.id]: gateway,
	}), {});
	// TODO: move lookup to its reducer
	const devicesById = devices.reduce((memo, device) => ({
		...memo,
		[device.id]: device,
	}), {});

	const todayInWeek = parseInt(moment().format('d'), 10);
	const sectionIds = range(0, 8);
	let items = sectionIds.reduce((memo, day) => ({
		...memo,
		[day]: [],
	}), {});

	jobs.forEach(job => {
		let tempDay;
		const device = devicesById[job.deviceId];
		if (!device) {
			return;
		}
		const gateway = gatewaysById[device.clientId];
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

		const now = moment().tz(timezone);
		job.weekdays.forEach(day => {
			if (day !== todayInWeek) {
				const relativeDay = (7 + day - todayInWeek) % 7; // 7 % 7 = 0
				return items[relativeDay].push(job);
			}

			const nowInMinutes = now.hours() * 60 + now.minutes();
			const jobInMinutes = parseInt(job.effectiveHour, 10) * 60 + parseInt(job.effectiveMinute, 10);
			if (jobInMinutes >= nowInMinutes) {
				items[0].push(job); // today
			} else {
				items[7].push(job); // today, next week
			}
		});
	});

	items = mapValues(items, _jobs => {
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

	const filteredSectionIds = filter(sectionIds, sectionId => items[sectionId].length);
	return {
		items,
		sectionIds: filteredSectionIds,
	};
}
