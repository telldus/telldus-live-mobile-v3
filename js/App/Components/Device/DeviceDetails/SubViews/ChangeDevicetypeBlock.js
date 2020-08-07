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
	useMemo,
	useState,
} from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import {
	DropDown,
	View,
	Text,
} from '../../../../../BaseComponents';

import {
	getAllDevicetypes,
	findDeviceTypeInfo,
} from '../../../../Lib/DeviceUtils';

import Theme from '../../../../Theme';

// import i18n from '../../../../Translations/common';

const ChangeDevicetypeBlock = (props: Object): Object => {
	const {
		dropDownContainerStyle,
		devicetype = '',
		coverStyle,
		onValueChange,
	} = props;
	const intl = useIntl();
	// const { formatMessage } = intl;

	const { layout } = useSelector((state: Object): Object => state.app);

	const dtypes = getAllDevicetypes();
	const initialItem = findDeviceTypeInfo(devicetype, dtypes) || {};
	const initialValue = initialItem.name || '';
	const [ value, setValue ] = useState(initialValue);

	const {
		items,
	} = useMemo((): Object => {
		const _items = [];

		Object.keys(dtypes).map((key: string) => {
			const {
				id,
				name,
			} = dtypes[key];
			_items.push({
				key: id,
				value: name,
			});
		});
		return {
			items: _items,
		};
	}, [dtypes]);

	const {
		dropDownContainerStyleDef,
		dropDownHeaderStyle,
		fontSize,
		pickerContainerStyle,
		coverStyleDef,
		labelStyle,
		pickerBaseTextStyle,
	} = getStyles(layout);

	const saveSortingDB = useCallback((val: string, itemIndex: number, data: Array<any>) => {
		setValue(val);
		if (onValueChange) {
			const { key } = data[itemIndex] || {};
			onValueChange(key);
		}
	}, [onValueChange]);

	const labelSortingDB = 'Device type';

	return (
		<View
			level={2}
			style={[coverStyleDef, coverStyle]}>
			<Text
				level={3}
				style={labelStyle} numberOfLine={1}>
				{labelSortingDB}
			</Text>
			<DropDown
				items={items}
				value={value}
				onValueChange={saveSortingDB}
				appLayout={layout}
				intl={intl}
				dropDownContainerStyle={[dropDownContainerStyleDef, dropDownContainerStyle]}
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
			borderRadius: 2,
		},
		pickerBaseTextStyle: {
			textAlign: 'right',
		},
		coverStyleDef: {
			flexDirection: 'row',
			alignItems: 'center',
			width: width - (padding * 2),
			justifyContent: 'space-between',
			...shadow,
			marginBottom: padding / 2,
			borderRadius: 2,
		},
		labelStyle: {
			flex: 0,
			fontSize,
			flexWrap: 'wrap',
			marginLeft: fontSize,
		},
	};
};

export default React.memo<Object>(ChangeDevicetypeBlock);
