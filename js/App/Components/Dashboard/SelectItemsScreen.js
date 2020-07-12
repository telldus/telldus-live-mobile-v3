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
	memo,
	useMemo,
	useCallback,
	useState,
	useEffect,
} from 'react';
import {
	useSelector,
	// useDispatch,
} from 'react-redux';
import {
	SectionList,
} from 'react-native';

import {
	View,
	FloatingButton,
} from '../../../BaseComponents';

import {
	EditDbListRow,
	EditDbListSection,
} from './SubViews';

import {
	prepareSensorsDevicesForAddToDbList,
} from '../../Lib/dashboardUtils';

import Theme from '../../Theme';

const SelectItemsScreen = memo<Object>((props: Object): Object => {

	const {
		onDidMount,
		route,
		navigation,
	} = props;

	// const dispatch = useDispatch();

	const { selectedType } = route.params || {};

	const [ selectedItems, setSelectedItems ] = useState({});

	const {
		layout,
		defaultSettings,
	} = useSelector((state: Object): Object => state.app);
	const {
		userId,
	} = useSelector((state: Object): Object => state.user);
	const { byId: gById } = useSelector((state: Object): Object => state.gateways);
	const { byId: dById } = useSelector((state: Object): Object => state.devices);
	const { byId: sById } = useSelector((state: Object): Object => state.sensors);
	const {
		sensorIds = {},
		deviceIds = {},
	} = useSelector((state: Object): Object => state.dashboard);
	// const { weather } = useSelector((state: Object): Object => state.thirdParties);

	const { activeDashboardId } = defaultSettings;

	const {
		type,
		byId,
	} = useMemo((): Object => {
		switch (selectedType) {
			case 'device':
				return {
					type: 'device',
					byId: dById,
				};
			case 'weather1':
				return {
					type: 'weather',
					byId: [],
				};
			case 'sensor':
			default:
				return {
					type: 'sensor',
					byId: sById,
				};
		}
	}, [selectedType, dById, sById]);

	useEffect(() => {
		onDidMount(`Select ${type}`);// TODO: translate
	}, [onDidMount, type]);

	const navigate = useCallback((screen: string, params: Object) => {
		navigation.navigate(screen, params);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [ refreshing, setRefreshing ] = useState(false);

	const dataSource = useMemo((): Array<Object> => {
		const userDbsAndSensorIds = sensorIds[userId] || {};
		const sensorIdsInCurrentDb = userDbsAndSensorIds[activeDashboardId] || [];

		const userDbsAndDeviceIds = deviceIds[userId] || {};
		const deviceIdsInCurrentDb = userDbsAndDeviceIds[activeDashboardId] || [];

		return prepareSensorsDevicesForAddToDbList(gById, byId, selectedType, {
			sensorIdsInCurrentDb,
			deviceIdsInCurrentDb,
		});
	}, [sensorIds, userId, activeDashboardId, deviceIds, gById, byId, selectedType]);

	const _onPress = useCallback((item: Object) => {
		const { id, data = {} } = item;

		const alreadyAdded = selectedItems[id];

		setSelectedItems({
			...selectedItems,
			[id]: alreadyAdded ? false : true,
		});

		if (selectedType === 'sensor' && !alreadyAdded) {
			const hasMultipleScales = Object.keys(data).length > 1;
			if (hasMultipleScales) {
				navigate('SelectScaleScreen', {
					item,
				});
			}
		}
	}, [navigate, selectedItems, selectedType]);

	const onPressNext = useCallback((params: Object) => {
		navigation.popToTop();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedItems]);

	const _renderRow = useCallback(({item}: Object): Object => {

		const selected = selectedItems[item.id];

		return (
			<EditDbListRow
				layout={layout}
				item={item}
				selectedType={selectedType}
				navigate={navigate}
				onPress={_onPress}
				selected={selected}/>
		);
	}, [selectedItems, layout, selectedType, navigate, _onPress]);

	const _renderSectionHeader = useCallback(({section}: Object): Object => {
		const { name = '' } = gById[section.header] || {};
		return (
			<EditDbListSection
				layout={layout}
				header={name}/>
		);
	}, [layout, gById]);

	const _keyExtractor = useCallback((item: Object, index: number): string => {
		return `${item.id}${index}`;
	}, []);

	const _onRefresh = useCallback(() => {
		setRefreshing(true);
	}, []);

	const {
		contentContainerStyle,
	} = getStyles({
		layout,
	});

	const hasSelected = useMemo((): boolean => {
		const _keys = Object.keys(selectedItems);
		const _len = _keys.length;
		let _hasSelected = false;
		for (let i = 0; i < _len; i++) {
			const _item = selectedItems[_keys[i]];
			if (_item) {
				_hasSelected = true;
				break;
			}
		}
		return _hasSelected;
	}, [selectedItems]);

	return (
		<View style={{flex: 1}}>
			<SectionList
				sections={dataSource}
				renderItem={_renderRow}
				renderSectionHeader={_renderSectionHeader}
				keyExtractor={_keyExtractor}
				onRefresh={_onRefresh}
				refreshing={refreshing}
				contentContainerStyle={contentContainerStyle}
				stickySectionHeadersEnabled={true}/>
			{hasSelected && <FloatingButton
				onPress={onPressNext}
				iconName={'checkmark'}/>
			}
		</View>
	);
});

const getStyles = ({layout}: Object): Object => {

	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		contentContainerStyle: {
			flexGrow: 1,
			paddingTop: padding / 2,
			paddingBottom: padding,
		},
	};
};

export default SelectItemsScreen;
