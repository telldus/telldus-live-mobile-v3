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
 */

// @flow

'use strict';

import React, {
	useCallback,
	memo,
} from 'react';
import { Image, Platform, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Text from './Text';
import View from './View';
import Switch from './Switch';
import RippleButton from './RippleButton';
import IconTelldus from './IconTelldus';
import Theme from '../App/Theme';
import i18n from '../App/Translations/common';

import {
	useAppTheme,
} from '../App/Hooks/App';

type Props = {
    value: any,
    label: string,
	appLayout: Object,
	iconLabelRight?: string,
	iconValueRight?: string,
	inLineEditActive?: boolean,
	extraData?: Object,

	iconValueLeft: string | Object,
	valuePostfix?: string,
	iconValueRightSize?: number,
	edit?: boolean,
	type?: 'switch' | 'text',
	onValueChange: (boolean) => void,
	onPress: () => void,
	onPressIconLabelRight: () => void,
	onPressIconValueRight: () => void,
	onChangeText?: (string) => void,
	onSubmitEditing?: () => void,
	keyboardTypeInLineEdit?: 'default' |
		'numeric' |
		'phone-pad' |
		'number-pad' |
		'decimal-pad',
	style?: Array<any> | Object,
	intl: Object,
	contentCoverStyle?: Array<any> | Object,
	valueCoverStyle?: Array<any> | Object,
	textFieldStyle?: Array<any> | Object,
	labelTextStyle?: Array<any> | Object,
	valueTextStyle?: Array<any> | Object,
	touchableStyle?: Array<any> | Object,
	switchStyle?: Array<any> | Object,
	onPressRHS?: Function,
};

const SettingsRow = (props: Props): Object => {
	const {
		appLayout,
		label,
		value,
		onValueChange,
		type,
		onPress,
		edit,
		iconLabelRight,
		iconValueRight,
		inLineEditActive,
		keyboardTypeInLineEdit,
		valuePostfix,
		style,
		intl,
		contentCoverStyle,
		valueCoverStyle,
		textFieldStyle,
		labelTextStyle,
		valueTextStyle,
		touchableStyle,
		switchStyle,
		iconValueLeft,
		onPressRHS,
		onPressIconValueRight,
		onPressIconLabelRight,
		onSubmitEditing,
		onChangeText,
		iconValueRightSize,
	} = props;

	const _onPress = useCallback(() => {
		if (onPress) {
			onPress();
		}
	}, [onPress]);

	const _onPressIconLabelRight = useCallback(() => {
		if (onPressIconLabelRight) {
			onPressIconLabelRight();
		}
	}, [onPressIconLabelRight]);

	const _onSubmitEditing = useCallback(() => {
		if (onSubmitEditing) {
			onSubmitEditing();
		}
	}, [onSubmitEditing]);

	const _onChangeText = useCallback((v: string) => {
		if (onChangeText) {
			onChangeText(v);
		}
	}, [onChangeText]);

	const {
		colors,
	} = useAppTheme();

	const {
		ShowOnDashCover,
		touchableStyleDef,
		switchStyleDef,
		textShowOnDashCover,
		textShowOnDash,
		valueText,
		arrowStyle,
		iconLabelRightCover,
		iconValueRightCover,
		_iconValueRightSize,
		iconLabelRightStyle,
		textField,
		valueCover,
	} = getStyle({
		appLayout,
		iconValueRightSize,
		colors,
	});

	let Parent = View, parentProps = {
		style: [touchableStyleDef, contentCoverStyle],
	};

	if (onPress) {
		Parent = RippleButton;
		parentProps = {
			style: [touchableStyleDef, contentCoverStyle],
			onPress: _onPress,
		};
	}

	const { formatMessage } = intl;

	let accessible = type !== 'switch';
	let accessibilityLabelTwo = onPress ? formatMessage(i18n.activateEdit) : '';
	let accessibilityLabel = `${label}, ${value ? value : ''} ${valuePostfix ? valuePostfix : ''}, ${accessibilityLabelTwo}`;

	return (
		<View style={[ShowOnDashCover, style]} accessible={accessible} accessibilityLabel={accessibilityLabel} importantForAccessibility={'yes'}>
			{type === 'switch' ?
				<View
					style={[touchableStyleDef, touchableStyle]}>
					<View style={textShowOnDashCover}>
						{!!label && (
							typeof label === 'string' ?
								<Text style={[textShowOnDash, labelTextStyle]}>
									{label}
								</Text>
								:
								label
						)}
						{!!iconLabelRight && (
							<TouchableOpacity onPress={_onPressIconLabelRight} style={iconLabelRightCover}>
								<IconTelldus icon={iconLabelRight} style={iconLabelRightStyle}/>
							</TouchableOpacity>
						)}
					</View>
					<Switch
						onValueChange={onValueChange}
						value={value}
						style={[switchStyleDef, switchStyle]}
					/>
				</View>
				:
				<Parent {...parentProps}>
					<View style={textShowOnDashCover}>
						{!!label && (
							typeof label === 'string' ? <Text style={[textShowOnDash, labelTextStyle]}>
								{label}
							</Text>
								:
								label
						)}
						{!!iconLabelRight && (
							<TouchableOpacity onPress={_onPressIconLabelRight} style={iconLabelRightCover}>
								<IconTelldus icon={iconLabelRight} style={iconLabelRightStyle}/>
							</TouchableOpacity>
						)}
					</View>
					<TouchableOpacity
						onPress={onPressRHS}
						disabled={!onPressRHS}
						style={[valueCover, valueCoverStyle]}>
						{inLineEditActive ?
							<TextInput
								value={value.toString()}
								style={[textField, textFieldStyle]}
								onChangeText={_onChangeText}
								onSubmitEditing={_onSubmitEditing}
								autoCorrect={false}
								autoFocus={true}
								returnKeyType={'done'}
								keyboardType={keyboardTypeInLineEdit}
							/>
							:
							<>
								{!!value && (
									(typeof value === 'string') || (typeof value === 'number') ?
										<>
											{iconValueLeft}
											<Text style={[valueText, valueTextStyle]}>
												{value} {valuePostfix}
											</Text>
										</>
										:
										(typeof value === 'object') ?
											value
											:
											null
								)}
							</>
						}
						{!!iconValueRight && (
							<TouchableOpacity
								onPress={onPressIconValueRight}
								style={iconValueRightCover}
								disabled={!onPressIconValueRight}>
								{typeof iconValueRight === 'string' ? <Icon name={iconValueRight} size={_iconValueRightSize} color={Theme.Core.brandSecondary}/> : iconValueRight}
							</TouchableOpacity>
						)}
					</TouchableOpacity>
					{edit && (
						<Image source={{uri: 'right_arrow_key'}} style={arrowStyle}/>
					)}
				</Parent>
			}
		</View>
	);
};

const getStyle = ({
	appLayout,
	iconValueRightSize,
	colors,
}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		rowTextColor,
		paddingFactor,
		brandSecondary,
	} = Theme.Core;

	const {
		card,
		textThree,
	} = colors;

	const padding = deviceWidth * paddingFactor;
	const fontSize = deviceWidth * 0.04;

	return {
		ShowOnDashCover: {
			backgroundColor: card,
			marginTop: padding / 2,
			...Theme.Core.shadow,
			borderRadius: 2,
		},
		touchableStyleDef: {
			padding: fontSize,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			borderRadius: 2,
			overflow: 'hidden',
		},
		switchStyleDef: {
			justifyContent: 'flex-end',
		},
		textShowOnDashCover: {
			alignItems: 'center',
			justifyContent: 'flex-start',
			flexDirection: 'row',
		},
		textShowOnDash: {
			color: textThree,
			fontSize,
			justifyContent: 'center',
		},
		valueCover: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'flex-end',
			paddingVertical: Platform.OS === 'ios' ? 8 : 6,
		},
		valueText: {
			flex: 1,
			fontSize,
			color: textThree,
			textAlign: 'right',
			textAlignVertical: 'center',
		},
		arrowStyle: {
			height: fontSize,
			width: fontSize,
			tintColor: '#A59F9A90',
			marginLeft: fontSize,
		},
		_iconValueRightSize: iconValueRightSize ? iconValueRightSize : fontSize,
		iconLabelRightCover: {
			padding: 2,
		},
		iconValueRightCover: {
			padding: 2,
			marginLeft: 3,
		},
		iconLabelRightStyle: {
			fontSize,
			color: brandSecondary,
		},
		textField: {
			flex: 1,
			color: rowTextColor,
			paddingBottom: 0,
			paddingTop: 0,
			fontSize,
			textAlign: 'right',
		},
	};
};

SettingsRow.defaultProps = {
	value: '',
	type: 'switch',
	edit: false,
	inLineEditActive: false,
	keyboardTypeInLineEdit: Platform.OS === 'ios' ? 'phone-pad' : 'decimal-pad',
};

module.exports = memo<Object>(SettingsRow);
