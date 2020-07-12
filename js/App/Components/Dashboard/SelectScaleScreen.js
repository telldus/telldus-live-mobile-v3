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
	ListRow,
} from './SubViews';

import {
	preAddDb,
} from '../../Actions/Dashboard';
import {
	getSensorInfo,
} from '../../Lib';

import Theme from '../../Theme';

const SelectScaleScreen = memo<Object>((props: Object): Object => {
	const {
		onDidMount,
		navigation,
		route,
	} = props;

	const { item } = route.params || {};
	const { data, id } = item;

	const {
		formatMessage,
	} = useIntl();

	const scalesInfoList = useMemo((): Object => {
		let _scalesInfoList = {};
		for (let key in data) {
			const values = data[key];
			const { value, scale, name } = values;

			const info = getSensorInfo(name, scale, value, true, formatMessage);
			_scalesInfoList[key] = info;
		}
		return _scalesInfoList;
	}, [data, formatMessage]);

	const [ selectedScales, setSelectedScales ] = useState({});

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		dbExtras = {},
	} = useSelector((state: Object): Object => state.dashboard);
	const { preAddToDb = {} } = dbExtras;
	const currentItemInPreDb = preAddToDb[id] || {};

	useEffect(() => {// TODO: translate
		onDidMount('Select Scale', 'Select one or more scale');
	}, [onDidMount]);

	const {
		contentContainerStyle,
	} = getStyles({layout});

	const dispatch = useDispatch();

	const onPressNext = useCallback((params: Object) => {
		dispatch(preAddDb({
			...preAddToDb,
			[id]: {
				...currentItemInPreDb,
				selectedScales,
			},
		}));
		navigation.goBack();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentItemInPreDb, id, preAddToDb, selectedScales]);

	const onPress = useCallback((typeSelected: string) => {
		setSelectedScales({
			...selectedScales,
			[typeSelected]: selectedScales[typeSelected] ? false : true,
		});
	}, [selectedScales]);

	const hasSelected = useMemo((): boolean => {
		const _keys = Object.keys(selectedScales);
		const _len = _keys.length;
		let _hasSelected = false;
		for (let i = 0; i < _len; i++) {
			const _item = selectedScales[_keys[i]];
			if (_item) {
				_hasSelected = true;
				break;
			}
		}
		return _hasSelected;
	}, [selectedScales]);

	const blocks = useMemo((): Array<Object> => {
		return Object.keys(scalesInfoList).map((key: string, index: number): Object => {
			const { label, icon } = scalesInfoList[key];
			const selected = selectedScales[key];

			return (
				<ListRow
					key={`${index}`}
					layout={layout}
					onPress={onPress}
					label={label}
					rowData={key}
					leftIcon={icon}
					rightIcon={selected ? 'favorite' : 'favorite-outline'}/>
			);
		});
	}, [layout, onPress, scalesInfoList, selectedScales]);

	return (
		<View style={{flex: 1}}>
			<ThemedScrollView
				contentContainerStyle={contentContainerStyle}
				level={3}>
				{blocks}
			</ThemedScrollView>
			{hasSelected && <FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'right_arrow_key'}}/>
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
			paddingTop: padding,
		},
	};
};

export default SelectScaleScreen;
