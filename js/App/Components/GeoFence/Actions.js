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

import React, { useState } from 'react';
import {
	SectionList,
	RefreshControl,
	LayoutAnimation,
} from 'react-native';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	FloatingButton,
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
	setFenceArrivingActions,
	setFenceLeavingActions,
} from '../../Actions';

import Theme from '../../Theme';

type Props = {
	navigation: Object,
	onPressNext: Function,
	iconName?: string,
	imageSource?: Object,
	currentScreen: string,
};

const Actions = (props: Props): Object => {
	const {
		navigation,
		onPressNext,
		iconName,
		imageSource,
		currentScreen,
	} = props;

	const intl = useIntl();

	const dispatch = useDispatch();

	const [selectedItems, setSelectedItems] = useState({
		selectedDevices: {},
		selectedSchedules: {},
		selectedEvents: {},
	});
	const {
		selectedDevices = {},
		selectedSchedules = {},
		selectedEvents = {},
	} = selectedItems;

	let { screenReaderEnabled, layout: appLayout } = useSelector((state: Object): Object => state.app);
	let { byId } = useSelector((state: Object): Object => state.devices);
	let jobs = useSelector((state: Object): Object => state.jobs) || [];
	let events = useSelector((state: Object): Object => state.events) || [];
	let { byId: gatewaysById } = useSelector((state: Object): Object => state.gateways) || [];

	const [ showDevices, setShowDevices ] = useState(false);
	const [ showEvents, setShowEvents ] = useState(false);
	const [ showJobs, setShowJobs ] = useState(false);

	const listData = GeoFenceUtils.prepareDataForListGeoFenceActions(
		showDevices ? byId : {},
		gatewaysById,
		showEvents ? events : {},
		showJobs ? jobs : {},
	);

	function onDeviceValueChange(args: Object) {
		const {
			deviceId,
			...others
		} = args;
		const isSelected = !!selectedDevices[deviceId];
		if (!isSelected) {
			return;
		}
		let newSelected = {...selectedItems};
		newSelected.selectedDevices[deviceId] = {
			...others,
		};
		setSelectedItems(newSelected);
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

	function onChangeSelection(type: 'device' | 'schedule' | 'event', id: string, data: Object) {
		let newSelected = {...selectedItems};
		if (type === 'device') {
			if (selectedDevices[id]) {
				delete newSelected.selectedDevices[id];
			} else {
				newSelected.selectedDevices[id] = data;
			}
		} else if (type === 'schedule') {
			if (selectedSchedules[id]) {
				delete newSelected.selectedSchedules[id];
			} else {
				newSelected.selectedSchedules[id] = data;
			}
		} else if (type === 'event') {
			if (selectedEvents[id]) {
				delete newSelected.selectedEvents[id];
			} else {
				newSelected.selectedEvents[id] = data;
			}
		}
		setSelectedItems(newSelected);
	}

	function renderDevice({item, index}: Object): Object {
		const checkBoxId = item.id;
		return (
			<DeviceRow
				key={`${item.id}${index}`}
				device={item}
				onDeviceValueChange={onDeviceValueChange}
				openRGBControl={openRGBControl}
				openThermostatControl={openThermostatControl}
				onChangeSelection={onChangeSelection}
				checkBoxId={checkBoxId}
				isChecked={!!selectedDevices[checkBoxId]}
				setScrollEnabled={_setScrollEnabled}/>
		);
	}

	function renderEvent({item}: Object): Object {
		const checkBoxId = item.id;

		return (
			<EventRow
				event={item}
				onChangeSelection={onChangeSelection}
				checkBoxId={checkBoxId}
				isChecked={!!selectedEvents[checkBoxId]}/>
		);
	}

	function renderJob({item}: Object): Object {
		const checkBoxId = item.id;

		return (
			<JobRow
				job={item}
				device={byId[item.deviceId]}
				onChangeSelection={onChangeSelection}
				checkBoxId={checkBoxId}
				isChecked={!!selectedSchedules[checkBoxId]}/>
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
			/>
		);
	}

	function _onPressNext() {
		if (currentScreen === 'ArrivingActions') {
			dispatch(setFenceArrivingActions({
				devices: selectedDevices,
				events: selectedSchedules,
				schedules: selectedEvents,
			}));
		} else if (currentScreen === 'LeavingActions') {
			dispatch(setFenceLeavingActions({
				devices: selectedDevices,
				events: selectedSchedules,
				schedules: selectedEvents,
			}));
		}
		onPressNext();
	}

	function keyExtractor(item: Object, index: number): string {
		return `${item.id}${index}`;
	}

	let makeRowAccessible = 0;
	if (screenReaderEnabled) {
		makeRowAccessible = 1;
	}
	const extraData = {
		makeRowAccessible,
		appLayout,
	};

	return (
		<View style={{flex: 1}}>
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
				onPress={_onPressNext}
				iconName={iconName}
				imageSource={imageSource}
			/>
		</View>
	);
};

export default Actions;
