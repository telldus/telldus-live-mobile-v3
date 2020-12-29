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

import EventsContainer from './EventsContainer';

import EventsList from './EventsList';
import SetEventName from './SetEventName';
import AddEventTriggers from './AddEventTriggers';
import AddEventConditions from './AddEventConditions';
import AddEventActions from './AddEventActions';
import EditEvent from './EditEvent';

const EventsScreenConfigs = [
	{
		name: 'EventsList',
		Component: EventsList,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SetEventName',
		Component: SetEventName,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'AddEventTriggers',
		Component: AddEventTriggers,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'AddEventConditions',
		Component: AddEventConditions,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'AddEventActions',
		Component: AddEventActions,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'EditEvent',
		Component: EditEvent,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
];

export default EventsScreenConfigs;
