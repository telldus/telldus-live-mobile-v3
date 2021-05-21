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
import EditEvent from './EditEvent';
import SelectTriggerType from './SelectTriggerType';
import SelectConditionType from './SelectConditionType';
import SelectActionType from './SelectActionType';
import SelectGroup from './SelectGroup';

import SelectBlockHeaterTrigger from './SelectBlockHeaterTrigger';
import SelectTimeTrigger from './SelectTimeTrigger';
import SelectSensorTrigger from './SelectSensorTrigger';
import SelectDeviceTrigger from './SelectDeviceTrigger';
import SelectSuntimeTrigger from './SelectSuntimeTrigger';

import SelectWeekdayCondition from './SelectWeekdayCondition';
import SelectTimeCondition from './SelectTimeCondition';
import SelectSensorCondition from './SelectSensorCondition';
import SelectDeviceCondition from './SelectDeviceCondition';
import SelectSuntimeCondition from './SelectSuntimeCondition';

import SelectDeviceAction from './SelectDeviceAction';
import SelectSMSAction from './SelectSMSAction';
import SelectEmailAction from './SelectEmailAction';
import SelectUrlAction from './SelectUrlAction';
import SelectPushAction from './SelectPushAction';

import SelectGroupEvent from './SelectGroupEvent';
import SetEventGroupName from './SetEventGroupName';

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
		name: 'EditEvent',
		Component: EditEvent,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectTriggerType',
		Component: SelectTriggerType,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectConditionType',
		Component: SelectConditionType,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectActionType',
		Component: SelectActionType,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectBlockHeaterTrigger',
		Component: SelectBlockHeaterTrigger,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectTimeTrigger',
		Component: SelectTimeTrigger,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectSensorTrigger',
		Component: SelectSensorTrigger,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectDeviceTrigger',
		Component: SelectDeviceTrigger,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectSuntimeTrigger',
		Component: SelectSuntimeTrigger,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectSuntimeCondition',
		Component: SelectSuntimeCondition,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectDeviceCondition',
		Component: SelectDeviceCondition,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectSensorCondition',
		Component: SelectSensorCondition,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectTimeCondition',
		Component: SelectTimeCondition,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectWeekdayCondition',
		Component: SelectWeekdayCondition,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectPushAction',
		Component: SelectPushAction,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectUrlAction',
		Component: SelectUrlAction,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectEmailAction',
		Component: SelectEmailAction,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectSMSAction',
		Component: SelectSMSAction,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectDeviceAction',
		Component: SelectDeviceAction,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectGroupEvent',
		Component: SelectGroupEvent,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SetEventGroupName',
		Component: SetEventGroupName,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
	{
		name: 'SelectGroup',
		Component: SelectGroup,
		ContainerComponent: EventsContainer,
		options: {
			headerShown: false,
		},
	},
];

export default EventsScreenConfigs;
