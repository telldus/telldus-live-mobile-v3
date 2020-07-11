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
} from 'react-redux';
import {
	SectionList,
} from 'react-native';

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
	} = props;

	const { selectedType } = route.params || {};

	const { layout } = useSelector((state: Object): Object => state.app);
	const { byId: gById } = useSelector((state: Object): Object => state.gateways);
	const { byId: dById } = useSelector((state: Object): Object => state.devices);
	const { byId: sById } = useSelector((state: Object): Object => state.sensors);
	const { weather } = useSelector((state: Object): Object => state.thirdParties);

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

	const [ refreshing, setRefreshing ] = useState(false);

	const dataSource = useMemo((): Array<Object> => {
		return prepareSensorsDevicesForAddToDbList(gById, byId, selectedType, {
			weather,
		});
	}, [gById, byId, weather, selectedType]);

	const _renderRow = useCallback(({item}: Object): Object => {
		return (
			<EditDbListRow
				layout={layout}
				item={item}
				selectedType={selectedType}/>
		);
	}, [layout, selectedType]);

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

	return (
		<SectionList
			sections={dataSource}
			renderItem={_renderRow}
			renderSectionHeader={_renderSectionHeader}
			keyExtractor={_keyExtractor}
			onRefresh={_onRefresh}
			refreshing={refreshing}
			contentContainerStyle={contentContainerStyle}
			stickySectionHeadersEnabled={true}/>
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
