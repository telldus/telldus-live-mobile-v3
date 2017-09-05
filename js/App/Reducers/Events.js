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
 * @providesModule Reducers_Events
 */

// @flow

'use strict';

import type { Action } from 'Actions_Types';
import { REHYDRATE } from 'redux-persist/constants';

import moment from 'moment-timezone';

import filter from 'lodash/filter';
import range from 'lodash/range';
import mapValues from 'lodash/mapValues';

export type State = ?Object;

const initialState = [];
const eventInitialState = {};


function reduceEvent(state: Object = eventInitialState, action: Action): State {
	switch (action.type) {
		case 'RECEIVED_EVENTS':
			let newEvent = {
				id: parseInt(state.id, 10),
				description: state.description,
                minRepeatInterval: parseInt(state.minRepeatInterval, 10),
                active: !!state.active,
                trigger: state.trigger,
                condition: state.condition,
                action: state.action,                
			};
			return newEvent;
		case 'EVENT_SET_STATE':
			return {
				...state,
				active: action.payload
			};
		default:
			return state;
	}
}

export default function reduceEvents(state: Array<Object> = initialState, action: Object): Array<Object> {
	if (action.type === REHYDRATE) {
		console.log('rehydrating events');
		if (action.payload.events) {
			return [
				...state,
				...action.payload.events,
			];
		}
		return [...state];
	}
	if (action.type === 'RECEIVED_EVENTS') {
		return action.payload.event
		             .map(eventState =>
			             // TODO: pass in received state as action.payload (see gateways reducer)
			             reduceEvent(eventState, action)
		             );
	}
	if (action.type === 'LOGGED_OUT') {
		return [];
	}

	return state;
}

export function parseEventsForListView(events: Array<Object> = [], gateways: Object = {}, devices: Object = {}): {sections:Object, sectionIds:Array<Object>} {
	if (!events || !events.length) {
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

	events.forEach(event => {
		let tempDay;
		const device = devices.byId[event.deviceId];
		if (!device) {
			return;
		}
		const gateway = gateways.byId[device.clientId];
		if (!gateway) {
			return;
		}
		const { timezone } = gateway;

		if (event.type === 'sunrise') {
			const { sunrise } = gateway;
			const sunriseInMs = sunrise * 1000;
			const offsetInMs = event.offset * 60 * 1000;
			tempDay = moment(sunriseInMs + offsetInMs).tz(timezone);
		} else if (event.type === 'sunset') {
			const { sunset } = gateway;
			const sunsetInMs = sunset * 1000;
			const offsetInMs = event.offset * 60 * 1000;
			tempDay = moment(sunsetInMs + offsetInMs).tz(timezone);
		} else {
			tempDay = moment();
			tempDay.hours(event.hour);
			tempDay.minutes(event.minute);
		}

		event.effectiveHour = tempDay.format('HH');
		event.effectiveMinute = tempDay.format('mm');
		event.device = device;
		event.gateway = gateway;

		const now = moment().tz(timezone);
		event.weekdays.forEach(day => {
			if (day !== todayInWeek) {
				const relativeDay = (7 + day - todayInWeek) % 7; // 7 % 7 = 0
				return sections[relativeDay].push(event);
			}

			const nowInMinutes = now.hours() * 60 + now.minutes();
			const eventInMinutes = parseInt(event.effectiveHour, 10) * 60 + parseInt(event.effectiveMinute, 10);
			if (eventInMinutes >= nowInMinutes) {
				sections[0].push(event); // today
			} else {
				sections[7].push(event); // today, next week
			}
		});
	});

	sections = mapValues(sections, _events => {
		_events.sort((a, b) => {
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
		return _events;
	});

	const filteredSectionIds = filter(sectionIds, sectionId => sections[sectionId].length);
	return {
		sections,
		sectionIds: filteredSectionIds,
	};
}
