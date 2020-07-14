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
	ListRow,
} from './SubViews';

import Theme from '../../Theme';

const SelectWeatherAttributes = memo<Object>((props: Object): Object => {
	const {
		onDidMount,
		navigation,
		route,
	} = props;

	const {
		selectedType,
		id,
	} = route.params || {};

	const [ selectedIndexes, setSelectedIndexes ] = useState([0]);

	const { layout } = useSelector((state: Object): Object => state.app);
	const { weather } = useSelector((state: Object): Object => state.thirdParties);

	useEffect(() => {// TODO: translate
		onDidMount('Select Properties', 'Select one or more weather attributes');
	}, [onDidMount]);

	const listData = useMemo((): Array<Object> => {
		const { attributesListData } = getMetWeatherDataAttributes(weather, id, selectedType, true);
		return attributesListData;
	}, [id, selectedType, weather]);

	const {
		container,
		body,
	} = getStyles({layout});

	const dispatch = useDispatch();

	const onPressNext = useCallback((params: Object) => {
		dispatch(preAddDb({}));
		navigation.popToTop();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onPress = useCallback((value: string) => {
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
				property,
			} = item;

			const selected = selectedIndexes.indexOf(index) !== -1;

			return (
				<ListRow
					key={`${index}`}
					layout={layout}
					onPress={onPress}
					label={property}
					rowData={index}
					leftIcon={'sensor'}
					rightIcon={selected ? 'favorite' : 'favorite-outline'}
				/>
			);
		});
	}, [layout, listData, onPress, selectedIndexes]);

	const sLength = selectedIndexes.length;

	return (
		<View style={{flex: 1}}>
			<ThemedScrollView
				level={3}
				style={container}>
				<View
					level={3}
					style={body}>
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

export default SelectWeatherAttributes;
