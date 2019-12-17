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

import React from 'react';
import { useSelector } from 'react-redux';
import {
	TextInput,
} from 'react-native';

import {
	View,
	Text,
} from '../../../../../BaseComponents';

import Theme from '../../../../Theme';

const InputSetting = (props: Object): Object => {

	const {
		label,
		value,
		onChangeText,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		optionInputCover,
		optionInputLabelStyle,
		optionInputStyle,
	} = getStyles(layout);

	return (
		<View style={optionInputCover}>
			<Text style={optionInputLabelStyle}>
				{label}
			</Text>
			<TextInput
				value={value}
				style={optionInputStyle}
				onChangeText={onChangeText}/>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		rowTextColor,
		eulaContentColor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = deviceWidth * 0.035;
	const fontSizeInput = deviceWidth * 0.04;

	return {
		optionInputCover: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			margin: padding,
		},
		optionInputLabelStyle: {
			fontSize: fontSizeText * 1.4,
			color: rowTextColor,
		},
		optionInputStyle: {
			fontSize: fontSizeInput,
			borderWidth: 1,
			borderColor: rowTextColor,
			borderRadius: 2,
			color: eulaContentColor,
			width: deviceWidth * 0.3,
			marginLeft: padding,
			padding: 5,
		},
	};
};

export default InputSetting;
