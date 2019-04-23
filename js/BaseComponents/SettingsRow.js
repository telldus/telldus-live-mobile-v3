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
import Ripple from 'react-native-material-ripple';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Text from './Text';
import View from './View';
import Switch from './Switch';
import IconTelldus from './IconTelldus';
import Theme from '../App/Theme';
import i18n from '../App/Translations/common';

type Props = {
    value: any,
    label: string,
	appLayout: Object,
	iconLabelRight?: string,
	iconValueRight?: string,
	inLineEditActive?: boolean,

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
		keyboardTypeInLineEdit: 'numeric',
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
		const { appLayout, value, inLineEditActive } = this.props;
		const { appLayout: appLayoutN, value: valueN, inLineEditActive: inLineEditActiveN } = nextProps;
		return appLayout.width !== appLayoutN.width || value !== valueN || inLineEditActive !== inLineEditActiveN;
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
		} = this.props;

		const {
			ShowOnDashCover,
			touchableStyle,
			switchStyle,
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
		const { rippleColor, rippleOpacity, rippleDuration } = Theme.Core;

		let Parent = View, parentProps = {
			style: touchableStyle,
		};
		if (onPress) {
			Parent = Ripple;
			parentProps = {
				rippleColor: rippleColor,
				rippleOpacity: rippleOpacity,
				rippleDuration: rippleDuration,
				style: touchableStyle,
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
						style={touchableStyle}>
						<View style={textShowOnDashCover}>
							<Text style={textShowOnDash}>
								{label}
							</Text>
						</View>
						<Switch
							onValueChange={onValueChange}
							value={value}
							style={switchStyle}
						/>
					</View>
					:
					<Parent {...parentProps}>
						<View style={textShowOnDashCover}>
							<Text style={textShowOnDash}>
								{label}
							</Text>
							{!!iconLabelRight && (
								<TouchableOpacity onPress={this.onPressIconLabelRight} style={iconLabelRightCover}>
									<IconTelldus icon={iconLabelRight} style={iconLabelRightStyle}/>
								</TouchableOpacity>
							)}
						</View>
						<View style={valueCover}>
							{inLineEditActive ?
								<TextInput
									value={value.toString()}
									style={textField}
									onChangeText={this.onChangeText}
									onSubmitEditing={this.onSubmitEditing}
									autoCorrect={false}
									autoFocus={true}
									underlineColorAndroid="#e26901"
									returnKeyType={'done'}
									keyboardType={keyboardTypeInLineEdit}
								/>
								:
								<Text style={valueText}>
									{value} {valuePostfix}
								</Text>
							}
							{!!iconValueRight && (
								<TouchableOpacity onPress={this.onPressIconValueRight} style={iconValueRightCover}>
									<Icon name={iconValueRight} size={iconValueRightSize} color={Theme.Core.brandSecondary}/>
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
			touchableStyle: {
				padding: fontSize,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				borderRadius: 2,
				overflow: 'hidden',
			},
			switchStyle: {
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
