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
} from 'react-native';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import { useIntl } from 'react-intl';
let uuid = require('react-native-uuid');

import {
	View,
	FloatingButton,
	ThemedRefreshControl,
	EmptyView,
} from '../../../../BaseComponents';
import {
	DeviceRow,
} from '../../GeoFence/SubViews';
import {
	DeviceHeader,
} from '../../TabViews/SubViews';

import {
	prepareDevicesDataWithCustomStateForList,
	prepareDevicesWithNewStateValues,
} from '../../../Lib';

import {
	getDevices,
	getGateways,
} from '../../../Actions';

import Theme from '../../../Theme';

type Props = {
	navigation: Object,
	onPressNext: Function,
	route: Object,
	selectedDevicesInitial: Object,
	onSelectionChange: Function,
};

const CommonDevicesList: Object = React.memo<Object>((props: Props): Object => {
	const {
		navigation,
		onPressNext,
		onSelectionChange,
		route,
		selectedDevicesInitial = {},
	} = props;
	const {
		params = {},
	} = route;

	const intl = useIntl();

	const dispatch = useDispatch();
	const [selectedItems, setSelectedItems] = useState({
		selectedDevices: selectedDevicesInitial,
	});
	const {
		selectedDevices = {},
	} = selectedItems;

	let { screenReaderEnabled, layout: appLayout } = useSelector((state: Object): Object => state.app);
	let { byId } = useSelector((state: Object): Object => state.devices);
	let { byId: gatewaysById } = useSelector((state: Object): Object => state.gateways) || [];

	const [ devices, setDevices ] = useState(prepareDevicesWithNewStateValues(byId, selectedDevices));

	const devicesListLength = Object.keys(byId).length;
	useEffect(() => {
		setDevices(prepareDevicesWithNewStateValues(byId, selectedDevices));
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
		onSelectionChange(newSelected);
		setDevices(prepareDevicesWithNewStateValues(devices, newSelected.selectedDevices));
	}, [devices, onSelectionChange, selectedDevices, selectedItems]);

	const listData = useMemo((): Array<Object> => {
		return prepareDevicesDataWithCustomStateForList(
			devices,
			gatewaysById,
			{
				showDevices: true,
				previousSelectedDevices: {},
				selectedDevices,
				showPreFilledOnTop: true,
			});
	}, [devices, gatewaysById, selectedDevices]);

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
			...params,
			id,
			onPressOverride: onDeviceValueChange,
		});
	}, [navigation, onDeviceValueChange, params, selectedDevices]);

	const openThermostatControl = useCallback((id: number) => {
		const isSelected = !!selectedDevices[id];
		if (!isSelected) {
			return;
		}
		navigation.navigate('ThermostatControl', {
			...params,
			id,
			onPressOverride: onDeviceValueChange,
			timeoutPlusMinus: 0,
		});
	}, [navigation, onDeviceValueChange, params, selectedDevices]);

	const onChangeSelection = useCallback((type: 'device' | 'schedule' | 'event', id: string, data: Object) => {
		let newSelected = {...selectedItems};
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
		setSelectedItems(newSelected);
		onSelectionChange(newSelected);
	}, [onSelectionChange, selectedDevices, selectedItems]);

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
				setScrollEnabled={_setScrollEnabled}
				showPalette={false}
				showThermostatHeat={false}/>
		);
	}, [_setScrollEnabled, onChangeSelection, onDeviceValueChange, openRGBControl, openThermostatControl, selectedDevices]);

	const [ isRefreshing, setIsRefreshing ] = useState(false);

	const onRefresh = React.useCallback(() => {
		async function _onRefresh() {
			setIsRefreshing(true);
			try {
				await dispatch(getGateways());
				await dispatch(getDevices());
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
		return renderDevice({...rowData});
	}, [renderDevice]);

	const renderSectionHeader = useCallback((sectionData: Object): Object => {
		const isDHeader = sectionData.section.header === Theme.Core.GeoFenceDevicesHeaderKey;

		if (isDHeader) {
			return (
				<EmptyView/>
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
	}, [appLayout, gatewaysById, intl]);

	const keyExtractor = useCallback((item: Object, index: number): string => {
		return `${item.id}${index}`;
	}, []);

	const _onPressNext = useCallback(() => {
		onPressNext(selectedItems);
	}, [onPressNext, selectedItems]);

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
				iconName={'checkmark'}
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


export default CommonDevicesList;
