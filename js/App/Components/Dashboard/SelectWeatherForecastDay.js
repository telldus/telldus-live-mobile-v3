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
	useDispatch,
} from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	ThemedScrollView,
	FloatingButton,
} from '../../../BaseComponents';

import {
	preAddDb,
} from '../../Actions/Dashboard';
import {
	getMetWeatherDataAttributes,
} from '../../Lib';

import {
	SelectForecastTimeDD,
} from './SubViews';

import Theme from '../../Theme';

const SelectWeatherForecastDay = memo<Object>((props: Object): Object => {
	const {
		onDidMount,
		navigation,
		route,
	} = props;

	const {
		formatDate,
		formatTime,
	} = useIntl();

	const {
		selectedType,
		id,
	} = route.params || {};

	const [ selectedIndex, setSelectedIndex ] = useState(0);

	const { layout } = useSelector((state: Object): Object => state.app);
	const { weather } = useSelector((state: Object): Object => state.thirdParties);

	useEffect(() => {// TODO: translate
		onDidMount('Select Day', 'Select any day');
	}, [onDidMount]);

	let {items, value} = useMemo((): Object => {
		const { timeAndInfo: {listData} } = getMetWeatherDataAttributes(weather, id, selectedType, false);
		let _items = [], _value = listData[0].time;
		listData.forEach((ti: Object, index: number) => {
			const { time } = ti;
			const _time = `${formatDate(time)} ${formatTime(time)}`;
			if (index === selectedIndex) {
				_value = _time;
			}
			_items.push({
				key: time,
				value: _time,
			});
		});
		return {
			items: _items,
			value: _value,
		};
	}, [formatDate, formatTime, id, selectedIndex, selectedType, weather]);

	const {
		container,
		body,
	} = getStyles({layout});

	const dispatch = useDispatch();

	const onPressNext = useCallback((params: Object) => {
		dispatch(preAddDb({}));
		navigation.navigate('SelectWeatherAttributes', {
			selectedType,
			id,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const saveSortingDB = useCallback((_value: string, itemIndex: number, data: Array<any>) => {
		setSelectedIndex(itemIndex);
	}, []);

	return (
		<View style={{flex: 1}}>
			<ThemedScrollView
				level={3}
				style={container}>
				<View
					level={3}
					style={body}>
					<SelectForecastTimeDD
						items={items}
						value={value}
						saveSortingDB={saveSortingDB}/>
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
		container: {
			flex: 1,
		},
		body: {
			flex: 1,
			paddingVertical: padding * 1.5,
			alignItems: 'center',
		},
	};
};

export default SelectWeatherForecastDay;
