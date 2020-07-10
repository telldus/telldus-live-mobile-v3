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
} from 'react';
import {
	useSelector,
} from 'react-redux';
import {
	SectionList,
} from 'react-native';

import {
	View,
	NavigationHeaderPoster,
} from '../../../BaseComponents';
import {
	EditDbListRow,
	EditDbListSection,
} from './SubViews';

import {
	prepareSensorsDevicesForAddToDbList,
} from '../../Lib/dashboardUtils';

import Theme from '../../Theme';

const EditDbList = memo<Object>((props: Object): Object => {

	const {
		navigation,
		screenProps,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);
	const { byId: gById } = useSelector((state: Object): Object => state.gateways);
	const { byId: dById } = useSelector((state: Object): Object => state.devices);
	const { byId: sById } = useSelector((state: Object): Object => state.sensors);

	const [ refreshing, setRefreshing ] = useState(false);

	const dataSource = useMemo((): Array<Object> => {
		return prepareSensorsDevicesForAddToDbList(gById, dById, sById);
	}, [gById, dById, sById]);

	const _renderRow = useCallback(({item}: Object): Object => {
		return (
			<EditDbListRow
				layout={layout}
				item={item}/>
		);
	}, [layout]);

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
		container,
		contentContainerStyle,
	} = getStyles({
		layout,
	});

	return (
		<View
			level={3}
			style={container}>
			<NavigationHeaderPoster
				h1={'Edit Dashboard'}
				h2={'Add or Remove dashboard items'}
				align={'right'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...screenProps}/>
			<SectionList
				sections={dataSource}
				renderItem={_renderRow}
				renderSectionHeader={_renderSectionHeader}
				keyExtractor={_keyExtractor}
				onRefresh={_onRefresh}
				refreshing={refreshing}
				contentContainerStyle={contentContainerStyle}
				stickySectionHeadersEnabled={true}/>
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
		container: {
			flex: 1,
		},
		contentContainerStyle: {
			flexGrow: 1,
			paddingTop: padding / 2,
			paddingBottom: padding,
		},
	};
};

export default EditDbList;
