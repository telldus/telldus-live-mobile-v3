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
import { combineReducers } from 'redux';
import filter from 'lodash/filter';
import range from 'lodash/range';
import mapValues from 'lodash/mapValues';

import {
	getTempDay,
} from '../Lib/scheduleUtils';

export function parseJobsForListView(jobs: Array<Object> = [], gateways: Object = {}, devices: Object = {}, userOptions: Object): {sections: Object, sectionIds: Array<Object>} {
	if (!jobs || !jobs.length) {
		return {
			sections: {'0': [], '1': [], '2': [], '3': [], '4': [], '5': [], '6': [], '7': []},
			sectionIds: [],
		};
	}

	const todayInWeek = parseInt(dayjs().format('d'), 10);
	const sectionIds = range(0, 8);
	let sections = sectionIds.reduce((memo: Object, day: number): Object => ({
		...memo,
		[day]: [],
	}), {});

	jobs.forEach((job: Object): any => {
		const device = devices.byId[job.deviceId];
		if (!device) {
			return;
		}
		const gateway = gateways.byId[device.clientId];
		if (!gateway) {
			return;
		}

		let tempDay = getTempDay(job, gateway);
		if (!tempDay) {
			return;
		}

		const { timezone } = gateway;
		job.gatewayTimezone = timezone;

		job.effectiveHour = tempDay.format('HH');
		job.effectiveMinute = tempDay.format('mm');

		const { name, deviceType, supportedMethods = {} } = device;
		job.deviceName = name;
		job.deviceType = deviceType;
		job.deviceSupportedMethods = supportedMethods;

		const now = dayjs().tz(timezone);
		if (!now) {
			return;
		}
		const { showInactive } = userOptions;
		const showJobs = showInactive || (!showInactive && job.active);
		if (job.weekdays && showJobs) {
			job.weekdays.forEach((day: number): Object | void => {
				let nonMutantJob = { ...job, expired: false };
				if (day !== todayInWeek) {
					const relativeDay = (7 + day - todayInWeek) % 7; // 7 % 7 = 0
					return sections[relativeDay].push(nonMutantJob);
				}

				const nowInMinutes = now.hour() * 60 + now.minute();
				const jobInMinutes = parseInt(nonMutantJob.effectiveHour, 10) * 60 + parseInt(nonMutantJob.effectiveMinute, 10);
				if (jobInMinutes >= nowInMinutes) {
					sections[0].push(nonMutantJob); // today
				} else {
					sections[7].push(nonMutantJob); // today, next week
					nonMutantJob = { ...nonMutantJob, expired: true };
					sections[0].push(nonMutantJob); // the expired jobs
				}
			});
		}
	});

	sections = mapValues(sections, (_jobs: Object): Object => {
		_jobs.sort((a: Object, b: Object): number | void => {
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

	const filteredSectionIds = filter(sectionIds, (sectionId: number): number => sections[sectionId].length);
	return {
		sections,
		sectionIds: filteredSectionIds,
	};
}

export type StateUserOptions = {
	showInactive: boolean,
};
export const initialState = {
	showInactive: true,
};

const userOptions = (state: StateUserOptions = initialState, action: Object): StateUserOptions => {
	if (action.type === 'persist/REHYDRATE') {
		if (action.payload && action.payload.jobsList && action.payload.jobsList.userOptions) {
			console.log('rehydrating userOptions');
			return {
				...state,
				...action.payload.jobsList.userOptions,
			};
		}
		return { ...state };
	}
	if (action.type === 'TOGGLE_INACTIVE_VISIBILITY') {
		const { showInactive } = action.payload;
		return {
			...state,
			showInactive,
		};
	}
	return state;
};

export default (combineReducers({
	userOptions,
}): Object);
