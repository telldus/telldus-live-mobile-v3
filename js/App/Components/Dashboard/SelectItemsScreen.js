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
	useDispatch,
} from 'react-redux';
import {
	SectionList,
} from 'react-native';
import { useIntl } from 'react-intl';

import {
	View,
	FloatingButton,
} from '../../../BaseComponents';
import {
	EditDbListRow,
	EditDbListSection,
} from './SubViews';

import {
	addToDashboardBatch,
	preAddDb,
} from '../../Actions/Dashboard';
import {
	prepareSensorsDevicesForAddToDbList,
	DEVICE_KEY,
	SENSOR_KEY,
} from '../../Lib/dashboardUtils';
import {
	MET_ID,
} from '../../Lib/thirdPartyUtils';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

const SelectItemsScreen = memo<Object>((props: Object): Object => {

	const {
		onDidMount,
		route,
		navigation,
	} = props;

	const {
		formatMessage,
	} = useIntl();
	const dispatch = useDispatch();

	const { selectedType } = route.params || {};

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
		dbExtras = {},
	} = useSelector((state: Object): Object => state.dashboard);
	const { weather } = useSelector((state: Object): Object => state.thirdParties);

	const { preAddToDb = {} } = dbExtras;
	const { activeDashboardId } = defaultSettings;

	const {
		byId,
		typeLabel,
		typeLabelP,
	} = useMemo((): Object => {
		switch (selectedType) {
			case DEVICE_KEY:
				return {
					type: DEVICE_KEY,
					byId: dById,
					typeLabel: formatMessage(i18n.labelDevice).toLowerCase(),
					typeLabelP: formatMessage(i18n.devices).toLowerCase(),
				};
			case MET_ID:
				return {
					type: MET_ID,
					byId: weather,
					typeLabel: formatMessage(i18n.labelWeather).toLowerCase(),
					typeLabelP: formatMessage(i18n.labelWeather).toLowerCase(),
				};
			case SENSOR_KEY:
			default:
				return {
					type: SENSOR_KEY,
					byId: sById,
					typeLabel: formatMessage(i18n.labelSensor).toLowerCase(),
					typeLabelP: formatMessage(i18n.sensors).toLowerCase(),
				};
		}
	}, [selectedType, dById, formatMessage, weather, sById]);

	useEffect(() => {
		onDidMount(
			formatMessage(i18n.selectDValue, {value: typeLabel}),
			formatMessage(i18n.selectOneOrMoreDValues, {values: typeLabelP})
		);
	}, [formatMessage, onDidMount, typeLabel, typeLabelP]);

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

		const alreadyAdded = preAddToDb[id];

		dispatch(preAddDb({
			...preAddToDb,
			[id]: alreadyAdded ? false : {},
		}));

		if (selectedType === SENSOR_KEY && !alreadyAdded) {
			const hasMultipleScales = Object.keys(data).length > 1;
			if (hasMultipleScales) {
				navigate('SelectScaleScreen', {
					item,
				});
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [navigate, preAddToDb, selectedType]);

	const onPressNext = useCallback((params: Object) => {
		let _selectedItems = {};
		Object.keys(preAddToDb).map((item: string) => {
			if (preAddToDb[item]) {
				_selectedItems[item] = preAddToDb[item];
			}
		});
		dispatch(addToDashboardBatch(selectedType, _selectedItems));
		navigation.popToTop();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [preAddToDb, selectedType]);

	const _renderRow = useCallback(({item}: Object): Object => {

		const selected = preAddToDb[item.id];

		return (
			<EditDbListRow
				layout={layout}
				item={item}
				selectedType={selectedType}
				navigate={navigate}
				onPress={_onPress}
				selected={selected}/>
		);
	}, [preAddToDb, layout, selectedType, navigate, _onPress]);

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
		const _keys = Object.keys(preAddToDb);
		const _len = _keys.length;
		let _hasSelected = false;
		for (let i = 0; i < _len; i++) {
			const _item = preAddToDb[_keys[i]];
			if (_item) {
				_hasSelected = true;
				break;
			}
		}
		return _hasSelected;
	}, [preAddToDb]);

	return (
		<View
			level={3}
			style={{flex: 1}}>
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

export default (SelectItemsScreen: Object);
