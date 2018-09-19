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
import { Image, Platform, TouchableOpacity } from 'react-native';
import Ripple from 'react-native-material-ripple';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Text from './Text';
import View from './View';
import Switch from './Switch';
import IconTelldus from './IconTelldus';
import Theme from '../App/Theme';

type Props = {
    value: boolean,
    label: string,
	appLayout: Object,
	iconLabelRight?: string,
	iconValueRight?: string,

	edit?: boolean,
	type?: 'switch' | 'text',
	onValueChange: (boolean) => void,
	onPress: () => void,
	onPressIconLabelRight: () => void,
	onPressIconValueRight: () => void,
};

type DefaultProps = {
	type: 'switch' | 'text',
	edit: boolean,
};


class SettingsRow extends Component<Props, null> {
	props: Props;

	onPress: () => void;
	onPressIconLabelRight: () => void;
	onPressIconValueRight: () => void;

	static defaultProps: DefaultProps = {
		type: 'switch',
		edit: false,
	}

	constructor(props: Props) {
		super(props);

		this.onPress = this.onPress.bind(this);
		this.onPressIconLabelRight = this.onPressIconLabelRight.bind(this);
		this.onPressIconValueRight = this.onPressIconValueRight.bind(this);
	}

	shouldComponentUpdate(nextProps: Object): boolean {
		const { appLayout, value } = this.props;
		const { appLayout: appLayoutN, value: valueN } = nextProps;
		return appLayout.width !== appLayoutN.width || value !== valueN;
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

	render(): Object {
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
		} = this.getStyle(appLayout);
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

		return (
			<View style={ShowOnDashCover}>
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
							<TouchableOpacity onPress={this.onPressIconLabelRight} style={iconLabelRightCover}>
								<IconTelldus icon={iconLabelRight} style={iconLabelRightStyle}/>
							</TouchableOpacity>
						</View>
						<Text style={valueText}>
							{value}
						</Text>
						{!!iconValueRight && (
							<TouchableOpacity onPress={this.onPressIconValueRight} style={iconValueRightCover}>
								<Icon name={iconValueRight} size={iconValueRightSize} color={Theme.Core.brandSecondary}/>
							</TouchableOpacity>
						)}
						}
						{edit && (
							<Image source={{uri: 'right_arrow_key'}} style={arrowStyle}/>
						)}
					</Parent>
				}
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
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
			valueText: {
				flex: 1,
				fontSize,
				color: inactiveTintColor,
				textAlign: 'right',
				marginVertical: Platform.OS === 'ios' ? 8 : 6,
			},
			arrowStyle: {
				height: fontSize,
				width: fontSize,
				tintColor: '#A59F9A90',
				marginLeft: fontSize,
			},
			iconValueRightSize: fontSize,
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
		};
	}
}

module.exports = SettingsRow;
