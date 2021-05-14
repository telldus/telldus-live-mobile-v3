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

const SSetting = (props: Object): Object => {
	const {
		index,
		value,
		onPressOne,
		onPressTwo,
		onPressThree,
		isOneSelected,
		isTwoSelected,
		isThreeSelected,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		optionWrapStyle,
		optionButtonCover,
		brandPrimary,
		sRBCoverStyle,
		sRBHTextStyle,
		buttonOuterSizeV,
		buttonSizeV,
	} = getStyles(layout);


	return (
		<View style={optionButtonCover}>
			<View style={sRBCoverStyle}>
				{index === 0 && <Text style={sRBHTextStyle}>
					{1}
				</Text>
				}
				<RadioButtonInput
					isSelected={isOneSelected}
					buttonWrapStyle={optionWrapStyle}
					buttonOuterSize={buttonOuterSizeV}
					buttonSize={buttonSizeV}
					borderWidth={3}
					buttonInnerColor={brandPrimary}
					buttonOuterColor={brandPrimary}
					onPress={onPressOne}
					obj={{value}}
					index={index}/>
			</View>
			<View style={sRBCoverStyle}>
				{index === 0 && <Text style={sRBHTextStyle}>
					{'-'}
				</Text>
				}
				<RadioButtonInput
					isSelected={isTwoSelected}
					buttonWrapStyle={optionWrapStyle}
					buttonOuterSize={buttonOuterSizeV}
					buttonSize={buttonSizeV}
					borderWidth={3}
					buttonInnerColor={brandPrimary}
					buttonOuterColor={brandPrimary}
					onPress={onPressTwo}
					obj={{value}}
					index={index}/>
			</View>
			<View style={sRBCoverStyle}>
				{index === 0 && <Text style={sRBHTextStyle}>
					{0}
				</Text>
				}
				<RadioButtonInput
					isSelected={isThreeSelected}
					buttonWrapStyle={optionWrapStyle}
					buttonOuterSize={buttonOuterSizeV}
					buttonSize={buttonSizeV}
					borderWidth={3}
					buttonInnerColor={brandPrimary}
					buttonOuterColor={brandPrimary}
					onPress={onPressThree}
					obj={{value}}
					index={index}/>
			</View>
		</View>
	);

};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
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
		optionWrapStyle: {
			marginTop: padding,
			marginLeft: padding,
		},
		sRBCoverStyle: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
		},
		sRBHTextStyle: {
			marginTop: padding,
			marginLeft: padding,
			fontSize: fontSizeText * 1.2,
			borderColor: brandPrimary,
			textAlignVertical: 'center',
		},
	};
};

export default (React.memo<Object>(SSetting): Object);

