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

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RadioButtonInput } from 'react-native-simple-radio-button';

import {
	View,
	Text,
} from '../../../../../BaseComponents';

import Theme from '../../../../Theme';

const DeviceSettings = (props: Object): Object => {
	const {
		settings,
	} = props;
	const [v, setV] = useState({});

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		coverStyle,
		textStyle,
		radioButtonsCover,
		radioButtonLabelStyle,
		rButtonStyle,
		rButtonWrapStyle,
		radioButtonCover,
		buttonOuterSizeV,
		buttonSizeV,
		buttonInnerColor,
		buttonOuterColor,
	} = getStyles(layout);

	let Setting = [];
	Object.keys(settings).map((setting: Object) => {
		if (setting === 'v') {
			const VSetting = Object.keys(settings[setting]).map((vSet: Object, index: number): Object => {
				const { option } = settings[setting][vSet];

				function onPressOne() {
					setV({
						...v,
						[vSet]: true,
					});
				}
				function onPressTwo() {
					setV({
						...v,
						[vSet]: false,
					});
				}

				const isOneSelected = v[vSet] || false;

				return (
					<View style={radioButtonCover} key={vSet}>
						<RadioButtonInput
							isSelected={isOneSelected}
							buttonStyle={rButtonStyle}
							buttonWrapStyle={rButtonWrapStyle}
							buttonOuterSize={buttonOuterSizeV}
							buttonSize={buttonSizeV}
							borderWidth={3}
							buttonInnerColor={buttonInnerColor}
							buttonOuterColor={buttonOuterColor}
							onPress={onPressOne}
							obj={{value: vSet}}
							index={index}/>
						<RadioButtonInput
							isSelected={!isOneSelected}
							buttonStyle={rButtonStyle}
							buttonWrapStyle={rButtonWrapStyle}
							buttonOuterSize={buttonOuterSizeV}
							buttonSize={buttonSizeV}
							borderWidth={3}
							buttonInnerColor={buttonInnerColor}
							buttonOuterColor={buttonOuterColor}
							onPress={onPressTwo}
							obj={{value: vSet}}
							index={index}/>
						<Text style={radioButtonLabelStyle}>
							{option}
						</Text>
					</View>
				);
			});
			Setting.push(
				<View style={radioButtonsCover}>
					{VSetting}
				</View>);
		}
		if (setting === 'u') {
			Setting.push(
				<Text style={textStyle}>
					U
				</Text>
			);
		}
		if (setting === 's') {
			Setting.push(
				<Text style={textStyle}>
					S
				</Text>
			);
		}
		if (setting === 'house') {
			Setting.push(
				<Text style={textStyle}>
					House
				</Text>
			);
		}
		if (setting === 'unit') {
			Setting.push(
				<Text style={textStyle}>
					Unit
				</Text>
			);
		}
		if (setting === 'fade') {
			Setting.push(
				<Text style={textStyle}>
					Fade
				</Text>
			);
		}
	});

	return (
		<View style={coverStyle}>
			{Setting}
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		rowTextColor,
		brandPrimary,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = deviceWidth * 0.035;

	const outerPadding = padding * 2;
	const totalPaddingV = padding * 11;
	const buttonOuterSizeV = Math.floor((deviceWidth - (outerPadding + totalPaddingV)) / 10);
	const buttonSizeV = buttonOuterSizeV * 0.5;

	return {
		buttonOuterSizeV,
		buttonSizeV,
		buttonInnerColor: brandPrimary,
		buttonOuterColor: brandPrimary,
		coverStyle: {
			marginTop: padding / 2,
			marginHorizontal: padding,
			backgroundColor: '#fff',
			...shadow,
			width: width - (2 * padding),
		},
		textStyle: {
			fontSize: fontSizeText,
			color: rowTextColor,
		},
		radioButtonsCover: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			paddingRight: padding,
			flexWrap: 'wrap',
			paddingBottom: padding,
		},
		radioButtonCover: {
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
		},
		radioButtonLabelStyle: {
			fontSize: fontSizeText,
			color: rowTextColor,
			marginTop: padding,
		},
		rButtonStyle: {
		},
		rButtonWrapStyle: {
			marginTop: padding,
			marginLeft: padding,
		},
	};
};

export default DeviceSettings;

