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
} from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import {
	DropDown,
	View,
	Text,
} from '../../../../BaseComponents';

import { changSensorLastUpdatedMode } from '../../../Actions';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

const SensorLastUpdateModeControlBlock = (props: Object): Object => {
	const {
		dropDownContainerStyle,
	} = props;
	const intl = useIntl();
	const { formatMessage } = intl;

	const { layout, defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	const { sensorLastUpdatedMode: sensorLastUpdatedModeProp = '0' } = defaultSettings;

	const {
		dropDownContainerStyleDef,
		dropDownHeaderStyle,
		fontSize,
		pickerContainerStyle,
		coverStyle,
		labelStyle,
		pickerBaseTextStyle,
	} = getStyles(layout);

	const dispatch = useDispatch();
	const saveSortingDB = useCallback((value: string, itemIndex: number, data: Array<any>) => {
		(() => {
			const { key: sensorLastUpdatedMode } = data[itemIndex];
			const settings = { sensorLastUpdatedMode };
			dispatch(changSensorLastUpdatedMode(settings));
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const zero = formatMessage(i18n.lastUpdateOption1);
	const one = formatMessage(i18n.lastUpdateOption2);

	const labelSortingDB = formatMessage(i18n.lastUpdateLabel);

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
				items={[
					{key: '0', value: zero},
					{key: '1', value: one},
				]}
				value={sensorLastUpdatedModeProp === '0' ? zero : one}
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
			marginBottom: fontSize / 2,
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

export default React.memo<Object>(SensorLastUpdateModeControlBlock);
