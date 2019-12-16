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
import { TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import { RadioButtonInput } from 'react-native-simple-radio-button';
import { useIntl } from 'react-intl';

import {
	View,
	Text,
	CheckBoxIconText,
} from '../../../../../BaseComponents';

import Theme from '../../../../Theme';

const DeviceSettings = (props: Object): Object => {
	const {
		settings,
	} = props;

	const intl = useIntl();

	const [v, setV] = useState({});
	const [u, setU] = useState({});
	const [s, setS] = useState({});
	const [system, setSystem] = useState('');
	const [house, setHouse] = useState('');
	const [unit, setUnit] = useState('');

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		coverStyle,
		textStyle,
		radioButtonsCover,
		radioButtonLabelStyle,
		rButtonStyle,
		optionWrapStyle,
		optionButtonCover,
		buttonOuterSizeV,
		buttonSizeV,
		brandPrimary,
		uCheckBoxIconStyle,
		sRBCoverStyle,
		sRBHTextStyle,
		optionInputCover,
		optionInputLabelStyle,
		optionInputStyle,
	} = getStyles(layout);

	let Setting = [];
	Object.keys(settings).map((setting: Object) => {

		if (setting === 'system') {
			const {
				min,
				max,
			} = settings[setting];

			function onChangeText(value: string): any {

				if (!value || value === '') {
					setSystem(value);
					return;
				}

				let newValue = parseInt(value, 10);
				if (isNaN(newValue)) {
					setSystem(system);
					return;
				}

				let acceptValue = (newValue <= max) && (newValue >= min);
				if (!acceptValue) {
					setSystem(system);
					return;
				}

				setSystem(newValue.toString());
			}

			Setting.push(
				<View style={optionInputCover} key={setting}>
					<Text style={optionInputLabelStyle}>
					System
					</Text>
					<TextInput
						value={system}
						style={optionInputStyle}
						onChangeText={onChangeText}/>
				</View>
			);
		}
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
					<View style={optionButtonCover} key={vSet}>
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
							obj={{value: vSet}}
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
							obj={{value: vSet}}
							index={index}/>
						<Text style={radioButtonLabelStyle}>
							{option}
						</Text>
					</View>
				);
			});
			Setting.push(
				<View style={radioButtonsCover} key={setting}>
					{VSetting}
				</View>);
		}
		if (setting === 'u') {
			const USetting = Object.keys(settings[setting]).map((uSet: Object, index: number): Object => {
				const { option } = settings[setting][uSet];

				const cUSet = u[uSet] || false;
				function onToggleCheckBox() {
					setU({
						...u,
						[uSet]: !cUSet,
					});
				}

				return (
					<View style={optionButtonCover} key={uSet}>
						<CheckBoxIconText
							isChecked={cUSet}
							iconStyle={{
								...optionWrapStyle,
								...uCheckBoxIconStyle,
								backgroundColor: cUSet ? brandPrimary : '#fff',
								color: cUSet ? '#fff' : 'transparent',
							}}
							textStyle={radioButtonLabelStyle}
							onToggleCheckBox={onToggleCheckBox}
							intl={intl}/>
						<Text style={radioButtonLabelStyle}>
							{option}
						</Text>
					</View>
				);
			});
			Setting.push(
				<View style={radioButtonsCover} key={setting}>
					{USetting}
				</View>);
		}
		if (setting === 's') {
			const SSetting = Object.keys(settings[setting]).map((sSet: Object, index: number): Object => {

				function onPressOne() {
					setS({
						...s,
						[sSet]: '1',
					});
				}
				function onPressTwo() {
					setS({
						...s,
						[sSet]: '-',
					});
				}
				function onPressThree() {
					setS({
						...s,
						[sSet]: '0',
					});
				}

				const isOneSelected = s[sSet] || '-';
				const isTwoSelected = s[sSet] || '-';
				const isThreeSelected = s[sSet] || '-';

				return (
					<View style={optionButtonCover} key={sSet}>
						<View style={sRBCoverStyle}>
							{index === 0 && <Text style={sRBHTextStyle}>
								{1}
							</Text>
							}
							<RadioButtonInput
								isSelected={isOneSelected === '1'}
								buttonStyle={rButtonStyle}
								buttonWrapStyle={optionWrapStyle}
								buttonOuterSize={buttonOuterSizeV}
								buttonSize={buttonSizeV}
								borderWidth={3}
								buttonInnerColor={brandPrimary}
								buttonOuterColor={brandPrimary}
								onPress={onPressOne}
								obj={{value: sSet}}
								index={index}/>
						</View>
						<View style={sRBCoverStyle}>
							{index === 0 && <Text style={sRBHTextStyle}>
								{'-'}
							</Text>
							}
							<RadioButtonInput
								isSelected={isTwoSelected === '-'}
								buttonStyle={rButtonStyle}
								buttonWrapStyle={optionWrapStyle}
								buttonOuterSize={buttonOuterSizeV}
								buttonSize={buttonSizeV}
								borderWidth={3}
								buttonInnerColor={brandPrimary}
								buttonOuterColor={brandPrimary}
								onPress={onPressTwo}
								obj={{value: sSet}}
								index={index}/>
						</View>
						<View style={sRBCoverStyle}>
							{index === 0 && <Text style={sRBHTextStyle}>
								{0}
							</Text>
							}
							<RadioButtonInput
								isSelected={isThreeSelected === '0'}
								buttonStyle={rButtonStyle}
								buttonWrapStyle={optionWrapStyle}
								buttonOuterSize={buttonOuterSizeV}
								buttonSize={buttonSizeV}
								borderWidth={3}
								buttonInnerColor={brandPrimary}
								buttonOuterColor={brandPrimary}
								onPress={onPressThree}
								obj={{value: sSet}}
								index={index}/>
						</View>
					</View>
				);
			});
			Setting.push(
				<View style={radioButtonsCover} key={setting}>
					{SSetting}
				</View>);
		}
		if (setting === 'house') {
			const {
				min,
				max,
			} = settings[setting];

			if (min || min) {
				function onChangeText(value: string): any {

					if (!value || value === '') {
						setHouse(value);
						return;
					}

					let newValue = parseInt(value, 10);
					if (isNaN(newValue)) {
						setHouse(house);
						return;
					}

					let acceptValue = (newValue <= max) && (newValue >= min);
					if (!acceptValue) {
						setHouse(house);
						return;
					}

					setHouse(newValue.toString());
				}

				Setting.push(
					<View style={optionInputCover} key={setting}>
						<Text style={optionInputLabelStyle}>
						House
						</Text>
						<TextInput
							value={house}
							style={optionInputStyle}
							onChangeText={onChangeText}/>
					</View>
				);
			}
		}
		if (setting === 'unit') {
			const {
				min,
				max,
			} = settings[setting];

			function onChangeText(value: string): any {

				if (!value || value === '') {
					setUnit(value);
					return;
				}

				let newValue = parseInt(value, 10);
				if (isNaN(newValue)) {
					setUnit(unit);
					return;
				}

				let acceptValue = (newValue <= max) && (newValue >= min);
				if (!acceptValue) {
					setUnit(unit);
					return;
				}

				setUnit(newValue.toString());
			}

			Setting.push(
				<View style={optionInputCover} key={setting}>
					<Text style={optionInputLabelStyle}>
					Unit
					</Text>
					<TextInput
						value={unit}
						style={optionInputStyle}
						onChangeText={onChangeText}/>
				</View>
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
		eulaContentColor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = deviceWidth * 0.035;
	const fontSizeLabel = deviceWidth * 0.04;

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
		optionButtonCover: {
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
		uCheckBoxIconStyle: {
			fontSize: iconSizeU,
			borderColor: brandPrimary,
			padding: paddingU,
			borderWidth: borderWidthU,
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
		optionInputLabelStyle: {
			fontSize: fontSizeText * 1.4,
			color: rowTextColor,
		},
		optionInputCover: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			margin: padding,
		},
		optionInputStyle: {
			fontSize: fontSizeLabel,
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

export default DeviceSettings;

