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
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

const FadeSetting = (props: Object): Object => {
	const {
		isChecked,
		onToggleCheckBox,
		intl,
		option,
		labelStyle,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		checkBoxLabelStyle,
		optionWrapStyle,
		optionButtonCover,
		uCheckBoxIconStyle,
		brandPrimary,
	} = getStyles(layout);


	return (
		<View style={optionButtonCover}>
			<Text style={[checkBoxLabelStyle, labelStyle]}>
				{option}
			</Text>
			<CheckBoxIconText
				isChecked={isChecked}
				iconStyle={{
					...optionWrapStyle,
					...uCheckBoxIconStyle,
					backgroundColor: isChecked ? brandPrimary : '#fff',
					color: isChecked ? '#fff' : 'transparent',
				}}
				onToggleCheckBox={onToggleCheckBox}
				intl={intl}/>
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

	const checkBoxSpace = padding;

	const totalPaddingU = (checkBoxSpace * 10) + padding;
	const paddingU = 2, borderWidthU = 1;
	const iconSizeU = Math.floor((deviceWidth - (outerPadding + totalPaddingU + ((paddingU + borderWidthU) * 20))) / 10);

	return {
		paddingU,
		brandPrimary,
		optionButtonCover: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
		},
		uCheckBoxIconStyle: {
			fontSize: iconSizeU,
			borderColor: brandPrimary,
			padding: paddingU,
			borderWidth: borderWidthU,
		},
		checkBoxLabelStyle: {
			fontSize: fontSizeText,
			color: rowTextColor,
			marginTop: padding,
		},
		optionWrapStyle: {
			marginTop: padding,
			marginLeft: padding,
		},
	};
};

export default (React.memo<Object>(FadeSetting): Object);

