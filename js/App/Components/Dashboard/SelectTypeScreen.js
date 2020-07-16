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
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	ThemedScrollView,
	FloatingButton,
} from '../../../BaseComponents';
import {
	TypeBlock,
} from './SubViews';

import {
	preAddDb,
} from '../../Actions/Dashboard';
import {
	MET_ID,
	DEVICE_KEY,
	SENSOR_KEY,
	getRandomNumberNotinArray,
} from '../../Lib';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

const SelectTypeScreen = memo<Object>((props: Object): Object => {
	const {
		onDidMount,
		navigation,
	} = props;

	const [ selectedType, setSelectedType ] = useState(DEVICE_KEY);

	const {
		formatMessage,
	} = useIntl();

	const { layout, defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	const { userId } = useSelector((state: Object): Object => state.user);
	const { metWeatherIds = {} } = useSelector((state: Object): Object => state.dashboard);

	useEffect(() => {// TODO: translate
		onDidMount('Select Type', 'Select either device or sensor');
	}, [onDidMount]);

	const {
		containerStyle,
	} = getStyles({layout});

	const dispatch = useDispatch();

	const { activeDashboardId } = defaultSettings;

	const userDbsAndMetWeatherIds = metWeatherIds[userId] || {};
	const metWeatherIdsInCurrentDb = userDbsAndMetWeatherIds[activeDashboardId] || [];


	const onPressNext = useCallback((params: Object) => {
		dispatch(preAddDb({}));
		if (selectedType === MET_ID) {
			const uniqueId = getRandomNumberNotinArray(metWeatherIdsInCurrentDb);
			navigation.navigate('SetCoordinates', {
				selectedType,
				uniqueId,
			});
		} else {
			navigation.navigate('SelectItemsScreen', {selectedType});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedType]);

	const onPress = useCallback((typeSelected: string) => {
		setSelectedType(typeSelected);
	}, []);

	const blocks = useMemo((): Array<Object> => {
		const items = [{
			label: formatMessage(i18n.labelDevice),
			typeId: DEVICE_KEY,
			onPress,
		},
		{
			label: formatMessage(i18n.labelSensor),
			onPress,
			typeId: SENSOR_KEY,
		},
		{
			label: 'MET Weather', // TODO: translate
			onPress,
			typeId: MET_ID,
		},
		];
		return items.map((item: Object, index: number): Object => {
			return (
				<TypeBlock
					key={`${index}`}
					layout={layout}
					onPress={item.onPress}
					label={item.label}
					typeId={item.typeId}
					selected={selectedType === item.typeId}/>
			);
		});
	}, [formatMessage, layout, onPress, selectedType]);

	return (
		<View style={{flex: 1}}>
			<ThemedScrollView
				level={3}>
				<View
					style={containerStyle}>
					{blocks}
				</View>
			</ThemedScrollView>
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'right_arrow_key'}}/>
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
		containerStyle: {
			flex: 1,
			flexDirection: 'row',
			paddingTop: padding / 2,
			flexWrap: 'wrap',
			marginLeft: padding / 2,
		},
	};
};

export default SelectTypeScreen;
