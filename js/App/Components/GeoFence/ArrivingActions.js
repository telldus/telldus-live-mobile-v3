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

'use strict';

import React, { useEffect, useState } from 'react';
import {
	ScrollView,
} from 'react-native';
import {
	useSelector,
} from 'react-redux';

import {
	FloatingButton,
} from '../../../BaseComponents';
import {
	ActionSectionHeader,
	DeviceRow,
} from './SubViews';

import Theme from '../../Theme';

type Props = {
	navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
};

const ArrivingActions = (props: Props): Object => {
	const {
		navigation,
		appLayout,
		onDidMount,
	} = props;

	useEffect(() => {
		onDidMount('2. Arriving actions', 'Select actions for when you arrive');
	}, []);

	function onPressNext() {
		navigation.navigate({
			routeName: 'LeavingActions',
			key: 'LeavingActions',
		});
	}

	const [checked, setChecked] = useState({});

	let { allIds, byId } = useSelector((state: Object): Object => state.devices);
	let jobs = useSelector((state: Object): Object => state.jobs) || [];
	let events = useSelector((state: Object): Object => state.events) || [];

	const {
		container,
		contentContainerStyle,
	} = getStyles(appLayout);

	function onDeviceValueChange(args: Object) {
	}

	function openRGBControl(id: number) {
		navigation.navigate({
			routeName: 'RGBControl',
			key: 'RGBControl',
			params: {
				id,
				onPressOverride: onDeviceValueChange,
			},
		});
	}

	function openThermostatControl(id: number) {
		navigation.navigate({
			routeName: 'ThermostatControl',
			key: 'ThermostatControl',
			params: {
				id,
				onPressOverride: onDeviceValueChange,
			},
		});
	}

	const [ showDevices, setShowDevices ] = useState(false);
	const [ showEvents, setShowEvents ] = useState(false);
	const [ showJobs, setShowJobs ] = useState(false);

	function toggleShowDevices(collapsed: boolean) {
		setShowDevices(collapsed);
	}

	function toggleShowEvents(collapsed: boolean) {
		setShowEvents(collapsed);
	}

	function toggleShowJobs(collapsed: boolean) {
		setShowJobs(collapsed);
	}

	function onToggleCheckBox(id: string) {
		const curr = checked[id] || false;
		setChecked({
			...checked,
			[id]: !curr,
		});
	}

	function renderDevice(device: Object, index: number): Object {
		return (
			<DeviceRow
				key={`${device.id}${index}`}
				device={device}
				onDeviceValueChange={onDeviceValueChange}
				openRGBControl={openRGBControl}
				openThermostatControl={openThermostatControl}
				onToggleCheckBox={onToggleCheckBox}
				isChecked={checked[device.id]}/>
		);
	}

	function renderEvent(event: Object): Object {

	}

	function renderJob(job: Object): Object {

	}

	let DEVICES;
	if (showDevices) {
		DEVICES = allIds.map((deviceId: string, index: number): () => Object => {
			let device = byId[deviceId];
			return renderDevice(device, index);
		});
	}

	let EVENTS;
	if (showEvents) {
		EVENTS = events.map((event: Object): () => Object => {
			return renderEvent(event);
		});
	}

	let JOBS;
	if (showJobs) {
		JOBS = jobs.map((job: Object): () => Object => {
			return renderJob(job);
		});
	}


	return (
		<ScrollView
			style={container}
			contentContainerStyle={contentContainerStyle}>
			<ActionSectionHeader title="Devices"
				onToggle={toggleShowDevices}
			/>
			{!!DEVICES && DEVICES}
			<ActionSectionHeader title="Events"
				onToggle={toggleShowEvents}
			/>
			{!!EVENTS && EVENTS}
			<ActionSectionHeader title="Schedules"
				onToggle={toggleShowJobs}
			/>
			{!!JOBS && JOBS}
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'right_arrow_key'}}
			/>
		</ScrollView>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		container: {
			flex: 1,
		},
		contentContainerStyle: {
			flexGrow: 1,
			paddingBottom: padding * 6,
		},
	};
};

export default ArrivingActions;
