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
 *
 */

// @flow

'use strict';

import React, {
	useCallback,
	useState,
	useMemo,
} from 'react';
import {
	// useDispatch,
	useSelector,
} from 'react-redux';
import { useIntl } from 'react-intl';

import {
	DropDown,
	View,
	Text,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

const SelectCoordinatesDD = (props: Object): Object => {
	const {
		setConfig,
		MANUAL_ID,
		MANUAL_VALUE,
	} = props;

	const intl = useIntl();

	const [ selected, setSelected ] = useState(MANUAL_ID);

	const { layout } = useSelector((state: Object): Object => state.app);
	const { byId = {} } = useSelector((state: Object): Object => state.gateways);

	let {items, value} = useMemo((): Object => {
		let _value = selected === MANUAL_ID ? MANUAL_VALUE : '';
		let _items = [];
		Object.keys(byId).forEach((id: string): Object => {
			const _item = byId[id];
			if (id === selected) {
				_value = _item.name;
			}
			_items.push({
				key: id,
				value: _item.name,
			});
		});
		_items.unshift({
			key: MANUAL_ID,
			value: MANUAL_VALUE,
		});
		return {
			items: _items,
			value: _value,
		};
	}, [MANUAL_ID, MANUAL_VALUE, byId, selected]);

	const {
		dropDownContainerStyleDef,
		dropDownHeaderStyle,
		fontSize,
		pickerContainerStyle,
		coverStyle,
		labelStyle,
		pickerBaseTextStyle,
	} = getStyles(layout);

	const _onValueChange = useCallback((_value: string, itemIndex: number, data: Array<any>) => {
		setSelected(data[itemIndex].key);
		let _latitude = '', _longitude = '';
		if (byId[data[itemIndex].key]) {
			const {
				latitude,
				longitude,
			} = byId[data[itemIndex].key];
			_latitude = latitude;
			_longitude = longitude;
		}
		setConfig({
			manual: data[itemIndex].key === MANUAL_ID,
			latitude: _latitude,
			longitude: _longitude,
			id: data[itemIndex].key,
		});
	}, [MANUAL_ID, byId, setConfig]);

	const labelSortingDB = 'Select coordinates';

	return (
		<View
			level={2}
			style={coverStyle}>
			<Text
				level={3}
				style={labelStyle} numberOfLine={1}>
				{labelSortingDB}
			</Text>
			<DropDown
				items={items}
				value={value}
				dropDownPosition={'bottom'}
				onValueChange={_onValueChange}
				appLayout={layout}
				intl={intl}
				dropDownContainerStyle={dropDownContainerStyleDef}
				dropDownHeaderStyle={dropDownHeaderStyle}
				fontSize={fontSize}
				accessibilityLabelPrefix={labelSortingDB}
				pickerContainerStyle={pickerContainerStyle}
				pickerBaseTextStyle={pickerBaseTextStyle}
			/>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const fontSize = Math.floor(deviceWidth * 0.045);

	const {
		paddingFactor,
		shadow,
		subHeader,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		dropDownContainerStyleDef: {
			marginBottom: 0,
			flex: 1,
		},
		dropDownHeaderStyle: {
			fontSize: Math.floor(deviceWidth * 0.045),
			color: subHeader,
		},
		fontSize,
		pickerContainerStyle: {
			elevation: 0,
			shadowColor: 'transparent',
			shadowRadius: 0,
			shadowOpacity: 0,
			shadowOffset: {
				width: 0,
				height: 0,
			},
			marginBottom: 0,
		},
		pickerBaseTextStyle: {
			textAlign: 'right',
		},
		coverStyle: {
			flexDirection: 'row',
			alignItems: 'center',
			width: width - (padding * 2),
			justifyContent: 'space-between',
			...shadow,
			marginBottom: padding / 2,
		},
		labelStyle: {
			flex: 0,
			fontSize,
			flexWrap: 'wrap',
			marginLeft: fontSize,
		},
	};
};

export default React.memo<Object>(SelectCoordinatesDD);