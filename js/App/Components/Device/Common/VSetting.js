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
import { RadioButtonInput } from 'react-native-simple-radio-button';

import {
	View,
	Text,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

const VSetting = (props: Object): Object => {
	const {
		option,
		isOneSelected,
		value,
		index,
		onPressOne,
		onPressTwo,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		radioButtonLabelStyle,
		rButtonStyle,
		optionWrapStyle,
		optionButtonCover,
		buttonOuterSizeV,
		buttonSizeV,
		brandPrimary,
	} = getStyles(layout);


	return (
		<View style={optionButtonCover}>
			<RadioButtonInput
				isSelected={isOneSelected}
				buttonStyle={rButtonStyle}
				buttonWrapStyle={optionWrapStyle}
				buttonOuterSize={buttonOuterSizeV}
				buttonSize={buttonSizeV}
				borderWidth={3}
				buttonInnerColor={brandPrimary}
				buttonOuterColor={brandPrimary}
				onPress={onPressOne}
				obj={{value}}
				index={index}/>
			<RadioButtonInput
				isSelected={!isOneSelected}
				buttonStyle={rButtonStyle}
				buttonWrapStyle={optionWrapStyle}
				buttonOuterSize={buttonOuterSizeV}
				buttonSize={buttonSizeV}
				borderWidth={3}
				buttonInnerColor={brandPrimary}
				buttonOuterColor={brandPrimary}
				onPress={onPressTwo}
				obj={{value}}
				index={index}/>
			<Text style={radioButtonLabelStyle}>
				{option}
			</Text>
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
		brandPrimary,
		fontSizeFactorTen,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = deviceWidth * fontSizeFactorTen;

	const outerPadding = padding * 2;

	const totalPaddingV = padding * 11;
	const buttonOuterSizeV = Math.floor((deviceWidth - (outerPadding + totalPaddingV)) / 10);
	const buttonSizeV = buttonOuterSizeV * 0.5;

	return {
		buttonOuterSizeV,
		buttonSizeV,
		brandPrimary,
		optionButtonCover: {
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
		},
		radioButtonLabelStyle: {
			fontSize: fontSizeText,
			color: rowTextColor,
			marginTop: padding,
			marginLeft: padding,
		},
		rButtonStyle: {
		},
		optionWrapStyle: {
			marginTop: padding,
			marginLeft: padding,
		},
	};
};

export default (React.memo<Object>(VSetting): Object);

