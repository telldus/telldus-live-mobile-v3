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

import React, {
	useState,
	useEffect,
	useMemo,
	useCallback,
} from 'react';
import {
	SectionList,
	LayoutAnimation,
} from 'react-native';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import { useIntl } from 'react-intl';
import uuid from 'react-native-uuid';

import {
	View,
	FloatingButton,
	ThemedRefreshControl,
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
	useDialogueBox,
} from '../../Hooks/Dialoguebox';

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
	getGateways,
} from '../../Actions';

import Theme from '../../Theme';
import isEmpty from 'lodash/isEmpty';
import { i18n } from 'live-shared-data';

type Props = {
	navigation: Object,
	onPressNext: Function,
	iconName?: string,
	imageSource?: Object,
	currentScreen: string,
	isEdit: boolean,
};

const Actions = React.memo<Object>((props: Props): Object => {
	const {
		navigation,
		onPressNext,
		iconName,
		imageSource,
		currentScreen,
		isEdit,
	} = props;

	const intl = useIntl();

	const dispatch = useDispatch();

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	let { fence = {}} = useSelector((state: Object): Object => state.fences);
	const {
		arriving = {},
		leaving = {},
	} = fence;
	const [selectedItems, setSelectedItems] = useState({
		selectedDevices: GeoFenceUtils.prepareActionsInitialState(currentScreen, arriving, leaving, 'devices', isEdit),
		selectedSchedules: GeoFenceUtils.prepareActionsInitialState(currentScreen, arriving, leaving, 'schedules', isEdit),
		selectedEvents: GeoFenceUtils.prepareActionsInitialState(currentScreen, arriving, leaving, 'events', isEdit),
	});
	const {
		selectedDevices = {},
		selectedSchedules = {},
		selectedEvents = {},
	} = selectedItems;

	let { screenReaderEnabled, layout: appLayout } = useSelector((state: Object): Object => state.app);
	let { byId } = useSelector((state: Object): Object => state.devices);
	let _jobs = useSelector((state: Object): Object => state.jobs);
	let jobs = useMemo((): Array<Object> => {
		return _jobs || [];
	}, [_jobs]);
	let _events = useSelector((state: Object): Object => state.events);
	let events = useMemo((): Array<Object> => {
		return _events || [];
	}, [_events]);
	let { byId: gatewaysById } = useSelector((state: Object): Object => state.gateways) || [];

	const [ showDevices, setShowDevices ] = useState(Object.keys(selectedDevices).length > 0);
	const [ showEvents, setShowEvents ] = useState(Object.keys(selectedEvents).length > 0);
	const [ showJobs, setShowJobs ] = useState(Object.keys(selectedSchedules).length > 0);

	const [ devices, setDevices ] = useState(GeoFenceUtils.prepareDevicesWithNewStateValues(byId, selectedDevices));

	const devicesListLength = Object.keys(byId).length;
	useEffect(() => {
		setDevices(GeoFenceUtils.prepareDevicesWithNewStateValues(byId, selectedDevices));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [devicesListLength]);

	const onDeviceValueChange = useCallback((args: Object) => {
		const {
			deviceId,
		} = args;
		const isSelected = !!selectedDevices[deviceId];

		if (!isSelected) {
			return;
		}
		let newSelected = {
			...selectedItems,
			selectedDevices: {
				...selectedItems.selectedDevices,
				[deviceId]: {
					...args,
					uuid: uuid.v1(),
				},
			},
		};
		setSelectedItems(newSelected);
		setDevices(GeoFenceUtils.prepareDevicesWithNewStateValues(devices, newSelected.selectedDevices));
	}, [devices, selectedDevices, selectedItems]);

	const listData = useMemo((): Array<Object> => {
		return GeoFenceUtils.prepareDataForListGeoFenceActions(
			devices,
			gatewaysById,
			events,
			jobs,
			{
				showJobs,
				showDevices,
				showEvents,
				arriving: isEdit ? (currentScreen === 'LeavingActions' ? leaving : arriving) : arriving,
				selectedDevices,
				selectedSchedules,
				selectedEvents,
				showPreFilledOnTop: currentScreen === 'LeavingActions' || isEdit,
			});
	}, [arriving, currentScreen, devices, events, gatewaysById, isEdit, jobs, leaving, selectedDevices, selectedEvents, selectedSchedules, showDevices, showEvents, showJobs]);

	const [ confOnSetScroll, setConfOnSetScroll ] = useState({
		scrollEnabled: true,
		showRefresh: true,
	});
	const {
		scrollEnabled,
		showRefresh,
	} = confOnSetScroll;
	const _setScrollEnabled = useCallback((enable: boolean) => {
		setConfOnSetScroll({
			scrollEnabled: enable,
			showRefresh: enable,
		});
	}, []);

	const openRGBControl = useCallback((id: number) => {
		const isSelected = !!selectedDevices[id];
		if (!isSelected) {
			return;
		}
		navigation.navigate('RGBControl', {
			id,
			onPressOverride: onDeviceValueChange,
		});
	}, [navigation, onDeviceValueChange, selectedDevices]);

	const openThermostatControl = useCallback((id: number) => {
		const isSelected = !!selectedDevices[id];
		if (!isSelected) {
			return;
		}
		navigation.navigate('ThermostatControl', {
			id,
			onPressOverride: onDeviceValueChange,
			timeoutPlusMinus: 0,
		});
	}, [navigation, onDeviceValueChange, selectedDevices]);

	const toggleShowDevices = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(200));
		setShowDevices(!showDevices);
	}, [showDevices]);

	const toggleShowEvents = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(200));
		setShowEvents(!showEvents);
	}, [showEvents]);

	const toggleShowJobs = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(200));
		setShowJobs(!showJobs);
	}, [showJobs]);

	const onChangeSelection = useCallback((type: 'device' | 'schedule' | 'event', id: string, data: Object) => {
		let newSelected = {...selectedItems};
		if (type === 'device') {
			if (selectedDevices[id]) {
				delete newSelected.selectedDevices[id];
			} else {
				newSelected = {
					...newSelected,
					selectedDevices: {
						...newSelected.selectedDevices,
						[id]: {
							...data,
							uuid: uuid.v1(),
						},
					},
				};
			}
		} else if (type === 'schedule') {
			if (selectedSchedules[id]) {
				delete newSelected.selectedSchedules[id];
			} else {
				newSelected = {
					...newSelected,
					selectedSchedules: {
						...newSelected.selectedSchedules,
						[id]: {
							...data,
							uuid: uuid.v1(),
						},
					},
				};
			}
		} else if (type === 'event') {
			if (selectedEvents[id]) {
				delete newSelected.selectedEvents[id];
			} else {
				newSelected = {
					...newSelected,
					selectedEvents: {
						...newSelected.selectedEvents,
						[id]: {
							...data,
							uuid: uuid.v1(),
						},
					},
				};
			}
		}
		setSelectedItems(newSelected);
	}, [selectedDevices, selectedEvents, selectedItems, selectedSchedules]);

	const toggleActiveState = useCallback((type: 'schedule' | 'event', id: string, data: Object) => {
		let newSelected = {...selectedItems};
		if (type === 'schedule') {
			newSelected = {
				...newSelected,
				selectedSchedules: {
					...newSelected.selectedSchedules,
					[id]: {
						...data,
						uuid: uuid.v1(),
					},
				},
			};
		} else if (type === 'event') {
			newSelected = {
				...newSelected,
				selectedEvents: {
					...newSelected.selectedEvents,
					[id]: {
						...data,
						uuid: uuid.v1(),
					},
				},
			};
		}
		setSelectedItems(newSelected);
	}, [selectedItems]);

	const renderDevice = useCallback(({item, index, section}: Object): Object => {
		const checkBoxId = item.id;

		const sectionLength = section.data.length;
		const isLast = index === sectionLength - 1;

		return (
			<DeviceRow
				key={`${item.id}${index}`}
				device={item}
				isLast={isLast}
				onDeviceValueChange={onDeviceValueChange}
				openRGBControl={openRGBControl}
				openThermostatControl={openThermostatControl}
				onChangeSelection={onChangeSelection}
				checkBoxId={checkBoxId}
				isChecked={!!selectedDevices[checkBoxId]}
				setScrollEnabled={_setScrollEnabled}/>
		);
	}, [_setScrollEnabled, onChangeSelection, onDeviceValueChange, openRGBControl, openThermostatControl, selectedDevices]);

	const renderEvent = useCallback(({item, index, section}: Object): Object => {
		const { id } = item;

		const sectionLength = section.data.length;
		const isLast = index === sectionLength - 1;

		return (
			<EventRow
				key={`${item.id}${index}`}
				isLast={isLast}
				event={selectedEvents[id] || item}
				onChangeSelection={onChangeSelection}
				checkBoxId={id}
				isChecked={!!selectedEvents[id]}
				toggleActiveState={toggleActiveState}/>
		);
	}, [onChangeSelection, selectedEvents, toggleActiveState]);

	const renderJob = useCallback(({item, index, section}: Object): Object => {
		const { id } = item;

		const sectionLength = section.data.length;
		const isLast = index === sectionLength - 1;

		return (
			<JobRow
				key={`${item.id}${index}`}
				isLast={isLast}
				job={selectedSchedules[id] || item}
				device={devices[item.deviceId]}
				onChangeSelection={onChangeSelection}
				checkBoxId={id}
				isChecked={!!selectedSchedules[id]}
				toggleActiveState={toggleActiveState}/>
		);
	}, [devices, onChangeSelection, selectedSchedules, toggleActiveState]);

	const [ isRefreshing, setIsRefreshing ] = useState(false);

	const onRefresh = React.useCallback(() => {
		async function _onRefresh() {
			setIsRefreshing(true);
			try {
				await dispatch(getGateways());
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

	const renderRow = useCallback((rowData: Object): Object => {
		const isEHeader = rowData.section.header === Theme.Core.GeoFenceEventsHeaderKey;
		const isJHeader = rowData.section.header === Theme.Core.GeoFenceJobsHeaderKey;

		if (isEHeader) {
			return renderEvent({...rowData});
		} else if (isJHeader) {
			return renderJob({...rowData});
		}
		return renderDevice({...rowData});
	}, [renderDevice, renderEvent, renderJob]);

	const renderSectionHeader = useCallback((sectionData: Object): Object => {

		const isDHeader = sectionData.section.header === Theme.Core.GeoFenceDevicesHeaderKey;
		const isEHeader = sectionData.section.header === Theme.Core.GeoFenceEventsHeaderKey;
		const isJHeader = sectionData.section.header === Theme.Core.GeoFenceJobsHeaderKey;

		if (isDHeader || isEHeader || isJHeader) {
			return (
				<ActionSectionHeader
					title={intl.formatMessage(sectionData.section.headerText)}
					expanded={isDHeader ? showDevices : isEHeader ? showEvents : showJobs}
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
	}, [appLayout, gatewaysById, intl, showDevices, showEvents, showJobs, toggleShowDevices, toggleShowEvents, toggleShowJobs]);

	const _onPressNext = useCallback(() => {
		let deviceInvalidAction = null;
		for (let i = 0; i < Object.keys(selectedDevices).length; i++) {
			const key = Object.keys(selectedDevices)[i];
			const dAction = selectedDevices[key];
			if (!dAction || isEmpty(dAction) || !dAction.method) {
				deviceInvalidAction = key;
			}
		}
		if (deviceInvalidAction) {
			const {
				name,
			} = byId[deviceInvalidAction];
			toggleDialogueBoxState({
				show: true,
				showHeader: true,
				imageHeader: true,
				text: intl.formatMessage(i18n.noDeviceActionSelected, {
					deviceName: name,
				}),
				showPositive: true,
			});
			return;
		}
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
	}, [byId, currentScreen, dispatch, intl, onPressNext, selectedDevices, selectedEvents, selectedSchedules, toggleDialogueBoxState]);

	const keyExtractor = useCallback((item: Object, index: number): string => {
		return `${item.id}${index}`;
	}, []);

	let makeRowAccessible = 0;
	if (screenReaderEnabled) {
		makeRowAccessible = 1;
	}
	const extraData = {
		makeRowAccessible,
		appLayout,
	};

	const {
		style,
		contentContainerStyle,
	} = getStyles(appLayout);

	return (
		<View style={{flex: 1}}>
			<SectionList
				style={style}
				contentContainerStyle={contentContainerStyle}
				sections={listData}
				renderItem={renderRow}
				renderSectionHeader={renderSectionHeader}
				stickySectionHeadersEnabled={true}
				refreshControl={
					<ThemedRefreshControl
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

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		style: {
			flex: 1,
		},
		contentContainerStyle: {
			flexGrow: 1,
			paddingTop: padding,
			paddingBottom: padding * 6,
		},
	};
};


export default (Actions: Object);
