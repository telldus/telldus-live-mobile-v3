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
	View,
	Text,
	CheckBoxIconText,
} from '../../../../../BaseComponents';

import Theme from '../../../../Theme';

const USetting = (props: Object): Object => {
	const {
		isChecked,
		onToggleCheckBox,
		intl,
		option,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		radioButtonLabelStyle,
		optionWrapStyle,
		optionButtonCover,
		uCheckBoxIconStyle,
		brandPrimary,
	} = getStyles(layout);


	return (
		<View style={optionButtonCover}>
			<CheckBoxIconText
				isChecked={isChecked}
				iconStyle={{
					...optionWrapStyle,
					...uCheckBoxIconStyle,
					backgroundColor: isChecked ? brandPrimary : '#fff',
					color: isChecked ? '#fff' : 'transparent',
				}}
				textStyle={radioButtonLabelStyle}
				onToggleCheckBox={onToggleCheckBox}
				intl={intl}/>
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
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = deviceWidth * 0.035;

	const outerPadding = padding * 2;

	const totalPaddingV = padding * 11;
	const buttonOuterSizeV = Math.floor((deviceWidth - (outerPadding + totalPaddingV)) / 10);
	const buttonSizeV = buttonOuterSizeV * 0.5;

	const totalPaddingU = padding * 11;
	const paddingU = 3, borderWidthU = 1;
	const iconSizeU = Math.floor((deviceWidth - (outerPadding + totalPaddingU + ((paddingU + borderWidthU) * 20))) / 10);

	return {
		paddingU,
		buttonOuterSizeV,
		buttonSizeV,
		brandPrimary,
		optionButtonCover: {
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
		},
		uCheckBoxIconStyle: {
			fontSize: iconSizeU,
			borderColor: brandPrimary,
			padding: paddingU,
			borderWidth: borderWidthU,
		},
		radioButtonLabelStyle: {
			fontSize: fontSizeText,
			color: rowTextColor,
			marginTop: padding,
		},
		rButtonStyle: {
		},
		optionWrapStyle: {
			marginTop: padding,
			marginLeft: padding,
		},
	};
};

export default USetting;

