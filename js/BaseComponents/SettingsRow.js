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

import React, { Component } from 'react';
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
	shouldUpdate,
} from '../App/Lib';

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
	keyboardTypeInLineEdit?: string,
	style?: Object | Array<any> | number,
	intl: Object,
	contentCoverStyle?: Object | Array<any> | number,
	valueCoverStyle?: Object | Array<any> | number,
	textFieldStyle?: Object | Array<any> | number,
	labelTextStyle?: Object | Array<any> | number,
	valueTextStyle?: Object | Array<any> | number,
	touchableStyle?: Object | Array<any> | number,
	switchStyle?: Object | Array<any> | number,
};

type DefaultProps = {
	value: any,
	type: 'switch' | 'text',
	edit: boolean,
	inLineEditActive: boolean,
	keyboardTypeInLineEdit: string,
};


class SettingsRow extends Component<Props, null> {
	props: Props;

	onPress: () => void;
	onPressIconLabelRight: () => void;
	onPressIconValueRight: () => void;

	onChangeText: (string) => void;
	onSubmitEditing: () => void;

	static defaultProps: DefaultProps = {
		value: '',
		type: 'switch',
		edit: false,
		inLineEditActive: false,
		keyboardTypeInLineEdit: Platform.OS === 'ios' ? 'phone-pad' : 'decimal-pad',
	}

	constructor(props: Props) {
		super(props);

		this.onPress = this.onPress.bind(this);
		this.onPressIconLabelRight = this.onPressIconLabelRight.bind(this);
		this.onPressIconValueRight = this.onPressIconValueRight.bind(this);

		this.onChangeText = this.onChangeText.bind(this);
		this.onSubmitEditing = this.onSubmitEditing.bind(this);
	}

	shouldComponentUpdate(nextProps: Object): boolean {
		return shouldUpdate(this.props, nextProps, [
			'inLineEditActive',
			'value',
			'appLayout',
			'extraData',
		]);
	}

	onPress() {
		const { onPress } = this.props;
		if (onPress) {
			onPress();
		}
	}

	onPressIconLabelRight() {
		const { onPressIconLabelRight } = this.props;
		if (onPressIconLabelRight) {
			onPressIconLabelRight();
		}
	}

	onPressIconValueRight() {
		const { onPressIconValueRight } = this.props;
		if (onPressIconValueRight) {
			onPressIconValueRight();
		}
	}

	onSubmitEditing() {
		const { onSubmitEditing } = this.props;
		if (onSubmitEditing) {
			onSubmitEditing();
		}
	}

	onChangeText(value: string) {
		const { onChangeText } = this.props;
		if (onChangeText) {
			onChangeText(value);
		}
	}

	render(): Object {
		const {
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
		} = this.props;

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
			iconValueRightSize,
			iconLabelRightStyle,
			textField,
			valueCover,
		} = this.getStyle();

		let Parent = View, parentProps = {
			style: [touchableStyleDef, contentCoverStyle],
		};
		if (onPress) {
			Parent = RippleButton;
			parentProps = {
				style: [touchableStyleDef, contentCoverStyle],
				onPress: this.onPress,
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
								<TouchableOpacity onPress={this.onPressIconLabelRight} style={iconLabelRightCover}>
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
								<TouchableOpacity onPress={this.onPressIconLabelRight} style={iconLabelRightCover}>
									<IconTelldus icon={iconLabelRight} style={iconLabelRightStyle}/>
								</TouchableOpacity>
							)}
						</View>
						<View style={[valueCover, valueCoverStyle]}>
							{inLineEditActive ?
								<TextInput
									value={value.toString()}
									style={[textField, textFieldStyle]}
									onChangeText={this.onChangeText}
									onSubmitEditing={this.onSubmitEditing}
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
								<TouchableOpacity onPress={this.onPressIconValueRight} style={iconValueRightCover}>
									{typeof iconValueRight === 'string' ? <Icon name={iconValueRight} size={iconValueRightSize} color={Theme.Core.brandSecondary}/> : iconValueRight}
								</TouchableOpacity>
							)}
						</View>
						{edit && (
							<Image source={{uri: 'right_arrow_key'}} style={arrowStyle}/>
						)}
					</Parent>
				}
			</View>
		);
	}

	getStyle(): Object {
		const { appLayout, iconValueRightSize } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { inactiveTintColor, paddingFactor, brandSecondary } = Theme.Core;

		const padding = deviceWidth * paddingFactor;
		const fontSize = deviceWidth * 0.04;

		return {
			ShowOnDashCover: {
				backgroundColor: '#fff',
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
				color: '#000',
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
				color: inactiveTintColor,
				textAlign: 'right',
				textAlignVertical: 'center',
			},
			arrowStyle: {
				height: fontSize,
				width: fontSize,
				tintColor: '#A59F9A90',
				marginLeft: fontSize,
			},
			iconValueRightSize: iconValueRightSize ? iconValueRightSize : fontSize,
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
				color: inactiveTintColor,
				paddingBottom: 0,
				paddingTop: 0,
				fontSize,
				textAlign: 'right',
			},
		};
	}
}

module.exports = SettingsRow;
