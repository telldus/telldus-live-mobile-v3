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
	useState,
	useMemo,
} from 'react';
import {
	useSelector,
} from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	ThemedScrollView,
	FloatingButton,
} from '../../../BaseComponents';

import {
	getSupportedWeatherProviders,
	capitalize,
} from '../../Lib';
import {
	useAppTheme,
} from '../../Hooks/Theme';

import {
	ListRow,
} from './SubViews';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

const SelectWeatherAttributes = memo<Object>((props: Object): Object => {
	const {
		onDidMount,
		navigation,
		route,
	} = props;

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const {
		selectedType,
		latitude,
		longitude,
		time,
		timeKey,
		uniqueId,
	} = route.params || {};

	const [ selectedIndexes, setSelectedIndexes ] = useState([0]);

	const { layout } = useSelector((state: Object): Object => state.app);

	useEffect(() => {
		onDidMount(formatMessage(i18n.selectSettings), formatMessage(i18n.selectOneOrMoreTypes));
	}, [formatMessage, onDidMount]);

	const listData = useMemo((): Array<Object> => {
		const {
			supportedScales,
		} = getSupportedWeatherProviders(formatMessage)[selectedType];
		return Object.keys(supportedScales).map((key: string): Object => {
			return {
				property: key,
				label: supportedScales[key].label,
			};
		});
	}, [formatMessage, selectedType]);

	const {
		container,
		body,
	} = getStyles({layout});
	const {
		colors,
		selectedThemeSet,
	} = useAppTheme();

	const onPressNext = useCallback((params: Object) => {
		const selectedAttributes = {};
		listData.forEach((ld: Object, index: number) => {
			if (selectedIndexes.indexOf(index) !== -1) {
				selectedAttributes[ld.property] = ld;
			}
		});
		navigation.navigate('SetNameMetWeather', {
			uniqueId,
			latitude,
			longitude,
			selectedType,
			time,
			selectedAttributes,
			timeKey,
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [latitude, listData, longitude, selectedIndexes, selectedType, time, timeKey, uniqueId]);

	const onPress = useCallback((value: number) => {
		let _selectedIndexes = [];
		const itemIndex = selectedIndexes.indexOf(value);
		if (itemIndex !== -1) {
			_selectedIndexes = selectedIndexes.filter((el: number, index: number): boolean => index !== itemIndex);
		} else {
			_selectedIndexes = [
				...selectedIndexes,
				value,
			];
		}
		setSelectedIndexes(_selectedIndexes);
	}, [selectedIndexes]);

	const properties = useMemo((): Array<Object> => {
		return listData.map((item: Object, index: number): Object => {
			const {
				label,
			} = item;

			const selected = selectedIndexes.indexOf(index) !== -1;

			const backgroundColor = selectedThemeSet.key === 2 ? 'transparent' : colors.inAppBrandPrimary;

			return (
				<ListRow
					key={`${index}`}
					layout={layout}
					onPress={onPress}
					label={label}
					rowData={index}
					leftIcon={'sensor'}
					iconContainerStyle={{
						backgroundColor,
					}}
					rightIcon={selected ? 'favorite' : 'favorite-outline'}
				/>
			);
		});
	}, [colors.inAppBrandPrimary, layout, listData, onPress, selectedIndexes, selectedThemeSet.key]);

	const sLength = selectedIndexes.length;

	const onPressToggleAll = useCallback(() => {
		if (sLength === 0) {
			const indexes = listData.map((j: Object, i: number): number => i);
			setSelectedIndexes(indexes);
		} else {
			setSelectedIndexes([]);
		}
	}, [listData, sLength]);

	return (
		<View style={{flex: 1}}>
			<ThemedScrollView
				level={3}
				style={container}>
				<View
					level={3}
					style={body}>
					<ListRow
						key={'-1'}
						layout={layout}
						onPress={onPressToggleAll}
						label={sLength === 0 ? capitalize(formatMessage(i18n.selectAll)) : capitalize(formatMessage(i18n.deSelectAll))}
						rowData={-1}
						rightIcon={sLength === 0 ? 'favorite' : 'favorite-outline'}
					/>
					{properties}
				</View>
			</ThemedScrollView>
			{sLength > 0 && (
				<FloatingButton
					onPress={onPressNext}
					imageSource={{uri: 'right_arrow_key'}}/>
			)}
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
		body: {
			flex: 1,
			paddingVertical: padding * 1.5,
		},
	};
};

export default (SelectWeatherAttributes: Object);
