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
	SectionList,
	RefreshControl,
	LayoutAnimation,
} from 'react-native';
import {
	useSelector,
	useDispatch,
} from 'react-redux';

import {
	FloatingButton,
	View,
} from '../../../BaseComponents';
import {
	ActionSectionHeader,
	DeviceRow,
	JobRow,
	EventRow,
} from './SubViews';
import {
	DeviceHeader,
} from '../TabViews/SubViews';

import {
	LayoutAnimations,
	GeoFenceUtils,
} from '../../Lib';

import {
	getEvents,
	getDevices,
	getJobs,
} from '../../Actions';

import Theme from '../../Theme';

type Props = {
	navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
	currentScreen: string,
	intl: Object,
};

const ArrivingActions = (props: Props): Object => {
	const {
		navigation,
		appLayout,
		onDidMount,
		currentScreen,
		intl,
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

	const dispatch = useDispatch();

	const [checked, setChecked] = useState({});

	let { screenReaderEnabled } = useSelector((state: Object): Object => state.app);
	let { byId } = useSelector((state: Object): Object => state.devices);
	let jobs = useSelector((state: Object): Object => state.jobs) || [];
	let events = useSelector((state: Object): Object => state.events) || [];
	let { byId: gatewaysById } = useSelector((state: Object): Object => state.gateways) || [];

	const [ showDevices, setShowDevices ] = useState(false);
	const [ showEvents, setShowEvents ] = useState(false);
	const [ showJobs, setShowJobs ] = useState(false);

	const listData = GeoFenceUtils.prepareDataForListArrivingActions(
		showDevices ? byId : {},
		gatewaysById,
		showEvents ? events : {},
		showJobs ? jobs : {},
	);

	const {
		container,
	} = getStyles(appLayout);

	function onDeviceValueChange(args: Object) {
	}

	const [ confOnSetScroll, setConfOnSetScroll ] = useState({
		scrollEnabled: true,
		showRefresh: true,
	});
	const {
		scrollEnabled,
		showRefresh,
	} = confOnSetScroll;
	function _setScrollEnabled(enable: boolean) {
		setConfOnSetScroll({
			scrollEnabled: enable,
			showRefresh: enable,
		});
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

	function toggleShowDevices(collapsed: boolean) {
		LayoutAnimation.configureNext(LayoutAnimations.linearCUD(200));
		setShowDevices(collapsed);
	}

	function toggleShowEvents(collapsed: boolean) {
		LayoutAnimation.configureNext(LayoutAnimations.linearCUD(200));
		setShowEvents(collapsed);
	}

	function toggleShowJobs(collapsed: boolean) {
		LayoutAnimation.configureNext(LayoutAnimations.linearCUD(200));
		setShowJobs(collapsed);
	}

	function onToggleCheckBox(id: string) {
		const curr = checked[id] || false;
		setChecked({
			...checked,
			[id]: !curr,
		});
	}

	function renderDevice({item, index}: Object): Object {
		const checkBoxId = `${item.id}-device`;

		return (
			<DeviceRow
				key={`${item.id}${index}`}
				device={item}
				onDeviceValueChange={onDeviceValueChange}
				openRGBControl={openRGBControl}
				openThermostatControl={openThermostatControl}
				onToggleCheckBox={onToggleCheckBox}
				checkBoxId={checkBoxId}
				isChecked={checked[checkBoxId]}
				setScrollEnabled={_setScrollEnabled}/>
		);
	}

	function renderEvent({item}: Object): Object {
		const checkBoxId = `${item.id}-event`;

		return (
			<EventRow
				event={item}
				onToggleCheckBox={onToggleCheckBox}
				checkBoxId={checkBoxId}
				isChecked={checked[checkBoxId]}/>
		);
	}

	function renderJob({item}: Object): Object {
		const checkBoxId = `${item.id}-job`;

		return (
			<JobRow
				job={item}
				device={byId[item.deviceId]}
				onToggleCheckBox={onToggleCheckBox}
				checkBoxId={checkBoxId}
				isChecked={checked[checkBoxId]}/>
		);
	}

	const [ isRefreshing, setIsRefreshing ] = useState(false);
	async function onRefresh() {
		setIsRefreshing(true);
		try {
			await dispatch(getDevices());
			await dispatch(getEvents());
			await dispatch(getJobs());
		} catch (e) {
			// None
		} finally {
			setIsRefreshing(false);
		}
	}

	function renderRow(rowData: Object): Object {
		const isEHeader = rowData.section.header === Theme.Core.GeoFenceEventsHeaderKey;
		const isJHeader = rowData.section.header === Theme.Core.GeoFenceJobsHeaderKey;

		if (isEHeader) {
			return renderEvent({...rowData});
		} else if (isJHeader) {
			return renderJob({...rowData});
		}
		return renderDevice({...rowData});
	}

	function renderSectionHeader(sectionData: Object): Object {

		const isDHeader = sectionData.section.header === Theme.Core.GeoFenceDevicesHeaderKey;
		const isEHeader = sectionData.section.header === Theme.Core.GeoFenceEventsHeaderKey;
		const isJHeader = sectionData.section.header === Theme.Core.GeoFenceJobsHeaderKey;

		if (isDHeader || isEHeader || isJHeader) {
			return (
				<ActionSectionHeader
					title={sectionData.section.headerText}
					onToggle={isDHeader ? toggleShowDevices : isEHeader ? toggleShowEvents : toggleShowJobs}/>
			);
		}

		const { supportLocalControl, isOnline, websocketOnline } = sectionData.section.data[0];

		const { name } = gatewaysById[sectionData.section.header] || {};

		return (
			<DeviceHeader
				gateway={name}
				appLayout={appLayout}
				intl={intl}
				supportLocalControl={supportLocalControl}
				isOnline={isOnline}
				websocketOnline={websocketOnline}
				accessible={currentScreen === 'ArrivingActions'}
			/>
		);
	}

	function keyExtractor(item: Object, index: number): string {
		return `${item.id}${index}`;
	}

	let makeRowAccessible = 0;
	if (screenReaderEnabled && currentScreen === 'ArrivingActions') {
		makeRowAccessible = 1;
	}
	const extraData = {
		makeRowAccessible,
		appLayout,
	};

	return (
		<View style={container}>
			<SectionList
				sections={listData}
				renderItem={renderRow}
				renderSectionHeader={renderSectionHeader}
				stickySectionHeadersEnabled={true}
				refreshControl={
					<RefreshControl
						enabled={showRefresh}
						refreshing={isRefreshing}
						onRefresh={onRefresh}
					/>
				}
				keyExtractor={keyExtractor}
				extraData={extraData}
				scrollEnabled={scrollEnabled}
			/>
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'right_arrow_key'}}/>
		</View>
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
