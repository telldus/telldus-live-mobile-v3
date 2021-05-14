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
} from 'react';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	ThemedScrollView,
	IconedSelectableBlock,
} from '../../../BaseComponents';

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

	const {
		formatMessage,
	} = useIntl();

	const { layout, defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	const { userId } = useSelector((state: Object): Object => state.user);
	const { metWeatherIds = {} } = useSelector((state: Object): Object => state.dashboard);

	useEffect(() => {
		onDidMount(formatMessage(i18n.addToDb), formatMessage(i18n.selectTypeToAdd));
	}, [formatMessage, onDidMount]);

	const {
		containerStyle,
	} = getStyles({layout});

	const dispatch = useDispatch();

	const { activeDashboardId } = defaultSettings;

	const userDbsAndMetWeatherIds = metWeatherIds[userId] || {};
	const metWeatherIdsInCurrentDb = userDbsAndMetWeatherIds[activeDashboardId] || [];


	const onPressNext = useCallback((selectedType: string) => {
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
	}, [metWeatherIdsInCurrentDb]);

	const onPress = useCallback((typeSelected: string) => {
		onPressNext(typeSelected);
	}, [onPressNext]);

	const blocks = useMemo((): Array<Object> => {
		const items = [{
			label: formatMessage(i18n.labelDevice),
			typeId: DEVICE_KEY,
			onPress,
			icon: 'devicealt',
		},
		{
			label: formatMessage(i18n.labelSensor),
			onPress,
			typeId: SENSOR_KEY,
			icon: 'sensor',
		},
		{
			label: formatMessage(i18n.labelWeather),
			onPress,
			typeId: MET_ID,
			icon: 'rain',
		},
		];
		return items.map((item: Object, index: number): Object => {
			return (
				<IconedSelectableBlock
					key={`${index}`}
					onPress={item.onPress}
					h1={item.label}
					icon={item.icon}
					onPressData={item.typeId}
					enabled
				/>
			);
		});
	}, [formatMessage, onPress]);

	return (
		<View
			level={3}
			style={{flex: 1}}>
			<ThemedScrollView
				level={3}
				style={{
					flex: 1,
				}}
				contentContainerStyle={{
					flexGrow: 1,
				}}>
				<View
					style={containerStyle}>
					{blocks}
				</View>
			</ThemedScrollView>
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
		},
	};
};

export default (SelectTypeScreen: Object);
