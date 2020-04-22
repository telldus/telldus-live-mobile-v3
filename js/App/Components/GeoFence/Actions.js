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

const Actions = React.memo<Object>((props: Props): Object => {
	const {
		navigation,
		onPressNext,
		iconName,
		imageSource,
		currentScreen,
	} = props;

	const intl = useIntl();

	const dispatch = useDispatch();

	let { fence = {}} = useSelector((state: Object): Object => state.fences);
	const {
		arriving = {},
		leaving = {},
	} = fence;
	const action = currentScreen === 'ArrivingActions' ? arriving : leaving;
	const initialSelection = {
		selectedDevices: action.devices || {},
		selectedSchedules: action.schedules || {},
		selectedEvents: action.events || {},
	};
	const [selectedItems, setSelectedItems] = useState(initialSelection);
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

	const [ devices, setDevices ] = useState(GeoFenceUtils.prepareDevicesWithNewStateValues(byId, selectedDevices));

	function onDeviceValueChange(args: Object) {
		const {
			deviceId,
		} = args;
		const isSelected = !!selectedDevices[deviceId];
		if (!isSelected) {
			return;
		}
		let newSelected = {...selectedItems};
		newSelected.selectedDevices[deviceId] = {
			...args,
		};
		setSelectedItems(newSelected);
		setDevices(GeoFenceUtils.prepareDevicesWithNewStateValues(devices, newSelected.selectedDevices));
	}

	const listData = GeoFenceUtils.prepareDataForListGeoFenceActions(
		showDevices ? devices : {},
		gatewaysById,
		showEvents ? events : {},
		showJobs ? jobs : {},
	);

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
		const isSelected = !!selectedDevices[id];
		if (!isSelected) {
			return;
		}
		navigation.navigate('RGBControl', {
			id,
			onPressOverride: onDeviceValueChange,
		});
	}

	function openThermostatControl(id: number) {
		const isSelected = !!selectedDevices[id];
		if (!isSelected) {
			return;
		}
		navigation.navigate('ThermostatControl', {
			id,
			onPressOverride: onDeviceValueChange,
			timeoutPlusMinus: 0,
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

	function toggleActiveState(type: 'schedule' | 'event', id: string, data: Object) {
		let newSelected = {...selectedItems};
		if (type === 'schedule') {
			newSelected.selectedSchedules[id] = data;
		} else if (type === 'event') {
			newSelected.selectedEvents[id] = data;
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
		const { id } = item;

		return (
			<EventRow
				event={selectedEvents[id] || item}
				onChangeSelection={onChangeSelection}
				checkBoxId={id}
				isChecked={!!selectedEvents[id]}
				toggleActiveState={toggleActiveState}/>
		);
	}

	function renderJob({item}: Object): Object {
		const { id } = item;

		return (
			<JobRow
				job={selectedSchedules[id] || item}
				device={devices[item.deviceId]}
				onChangeSelection={onChangeSelection}
				checkBoxId={id}
				isChecked={!!selectedSchedules[id]}
				toggleActiveState={toggleActiveState}/>
		);
	}

	const [ isRefreshing, setIsRefreshing ] = useState(false);

	const onRefresh = React.useCallback(() => {
		async function _onRefresh() {
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
		_onRefresh();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
				events: selectedEvents,
				schedules: selectedSchedules,
			}));
		} else if (currentScreen === 'LeavingActions') {
			dispatch(setFenceLeavingActions({
				devices: selectedDevices,
				events: selectedEvents,
				schedules: selectedSchedules,
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
});

export default Actions;
