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

import React from 'react';
import { TouchableOpacity, TextInput, LayoutAnimation } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {
	View,
	Text,
	IconTelldus,
} from '../../../BaseComponents';

import Theme from '../../Theme';
import { LayoutAnimations, formatModeValue } from '../../Lib';

type Props = {
    appLayout: Object,
    label: string,
    edit: boolean,
    icon: string,
    value?: number,
    scale: string,
    unit: string,
	active: boolean,
	mode: string,
	maxVal: number,
	minVal: number,
	currentValue: number,

	onPressRow: (string) => void,
	onControlThermostat: (mode: string, temperature?: number | string | null, requestedState: number) => void,
	intl: Object,
	onEditSubmitValue: (number) => void,
	updateCurrentValueInScreen: (string) => void,
	IconActive: Object,
	Icon: Object,
};

type State = {
	editValue: boolean,
};

class ModeBlock extends View<Props, State> {
props: Props;
state: State;

onPressRow: () => void;

constructor(props: Props) {
	super(props);

	this.state = {
		editValue: false,
	};

	this.onPressRow = this.onPressRow.bind(this);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return true;
}

onPressRow = () => {
	const { onPressRow, mode } = this.props;
	if (onPressRow) {
		onPressRow(mode);
	}
}

onChangeText = (value: string) => {
	this.props.updateCurrentValueInScreen(value);
}

onSubmitEditing = () => {
	this.setState({
		editValue: false,
	});

	if (!this.props.value || this.props.value === '') {
		this.props.updateCurrentValueInScreen(this.props.currentValue.toString());
		LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
		return;
	}

	const value = this.props.value ? parseFloat(parseFloat(this.props.value).toFixed(1)) : null;
	const { maxVal, minVal, mode } = this.props;
	if (typeof value === 'number' && typeof minVal === 'number' && typeof maxVal === 'number' && (value > maxVal || value < minVal)) {
		this.props.updateCurrentValueInScreen(this.props.currentValue.toString());
		LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
		return;
	}

	if (value !== null) {
		this.props.onEditSubmitValue(value);
	}
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
	this.props.onControlThermostat(mode, value, mode === 'off' ? 2 : 1);

}

onPressEdit = () => {
	this.setState({
		editValue: true,
	});
	this.onPressRow();
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
}

onPressUp = () => {
	const { maxVal, mode, value } = this.props;
	let nextValue = (parseFloat(value) + parseFloat(1)).toFixed(1);
	this.onPressRow();
	if (typeof nextValue === 'number' && typeof maxVal === 'number' && (nextValue > maxVal)) {
		return;
	}
	this.props.updateCurrentValueInScreen(nextValue);
	this.props.onEditSubmitValue(parseFloat(nextValue));
	this.props.onControlThermostat(mode, nextValue, mode === 'off' ? 2 : 1);
}

onPressDown = () => {
	const { minVal, mode, value } = this.props;
	let nextValue = (parseFloat(value) + parseFloat(-1)).toFixed(1);
	this.onPressRow();
	if (typeof nextValue === 'number' && typeof minVal === 'number' && (nextValue < minVal)) {
		return;
	}
	this.props.updateCurrentValueInScreen(nextValue);
	this.props.onEditSubmitValue(parseFloat(nextValue));
	this.props.onControlThermostat(mode, nextValue, mode === 'off' ? 2 : 1);
}

formatModeValue = (modeValue?: number): string | number => {
	const val = this.props.intl.formatNumber(typeof modeValue === 'undefined' ? -100.0 : modeValue, {minimumFractionDigits: 1});
	return isNaN(formatModeValue(val)) ? '' : formatModeValue(val);
}

render(): Object {

	const {
		label,
		value,
		scale,
		unit,
		active,
		mode,
		IconActive,
		Icon,
	} = this.props;

	const {
		cover,
		labelStyle,
		leftBlock,
		brandSecondary,
		brandPrimary,
		controlBlockStyle,
		scaleStyle,
		valueStyle,
		unitStyle,
		iconBlockStyle,
		appBackground,
		editIconStyle,
		textCoverStyle,
		rowTextColor,
		editIconSize,
		editIconSizeDone,
		iconSize,
		controlIconSize,
		textStyle,
	} = this.getStyles();

	let iconBGColor = active ? brandSecondary : appBackground;
	let iconColor = active ? '#fff' : brandSecondary;
	let textColor = active ? brandSecondary : rowTextColor;
	if (mode === 'off') {
		iconBGColor = active ? brandPrimary : appBackground;
		iconColor = active ? '#fff' : brandPrimary;
		textColor = rowTextColor;
	}

	const { editValue } = this.state;

	const cModevalue = this.formatModeValue(value);

	const isEditBoxValueValid = value !== null && typeof value !== 'undefined' && !isNaN(value);

	return (
		<View style={cover}>
			<View style={leftBlock}>
				<TouchableOpacity style={{
					flex: 1,
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'flex-start',
				}} onPress={this.onPressRow}>
					<Text style={[labelStyle, { color: textColor }]}>
						{label.toUpperCase()}
					</Text>
				</TouchableOpacity>
				{(value !== null && typeof value !== 'undefined') && (
					<View style={controlBlockStyle}>
						<View style={{flex: 0}}>
							<TouchableOpacity onPress={this.onPressUp}>
								<IconTelldus icon="up" size={controlIconSize} color={brandSecondary}/>
							</TouchableOpacity>
							<TouchableOpacity onPress={this.onPressDown}>
								<IconTelldus icon="down" size={controlIconSize} color={brandPrimary}/>
							</TouchableOpacity>
						</View>
						<View style={textCoverStyle}>
							<Text style={[scaleStyle, { color: textColor }]}>
								{scale}
							</Text>
							{editValue ? <TextInput
								value={isEditBoxValueValid ? value.toString() : ''}
								style={textStyle}
								onChangeText={this.onChangeText}
								onSubmitEditing={this.onSubmitEditing}
								autoCapitalize="sentences"
								autoCorrect={false}
								autoFocus={false}
								underlineColorAndroid={Theme.Core.brandSecondary}
								returnKeyType={'done'}
								keyboardType={'phone-pad'}
							/>
								:
								<Text>
									<Text style={[valueStyle, { color: textColor }]}>
										{cModevalue}
									</Text>
									<Text style={[unitStyle, { color: textColor }]}>
										{unit}
									</Text>
								</Text>
							}
						</View>
						<MaterialIcon name={editValue ? 'done' : 'edit'}
							size={editValue ? editIconSizeDone : editIconSize}
							color={brandSecondary}
							style={editIconStyle}
							onPress={editValue ? this.onSubmitEditing : this.onPressEdit}/>
					</View>
				)}
			</View>
			<TouchableOpacity style={[iconBlockStyle, {backgroundColor: iconBGColor}]} onPress={this.onPressRow}>
				{mode !== 'off' ?
					active ?
						<IconActive height={iconSize} width={iconSize}/>
						:
						<Icon height={iconSize} width={iconSize}/>
					:
					<IconTelldus icon={'off'} size={iconSize} color={iconColor}/>
				}
			</TouchableOpacity>
		</View>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		rowTextColor,
		brandSecondary,
		brandPrimary,
		appBackground,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		cover: {
			...shadow,
			flexDirection: 'row',
			alignItems: 'stretch',
			justifyContent: 'flex-start',
			backgroundColor: appBackground,
			marginTop: padding,
			marginHorizontal: padding,
			minHeight: deviceWidth * 0.16,
		},
		leftBlock: {
			flex: 1,
			padding: padding,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			...shadow,
			backgroundColor: '#fff',
		},
		labelStyle: {
			color: rowTextColor,
			fontSize: deviceWidth * 0.05,
			textAlignVertical: 'center',
			flex: 1,
		},
		brandSecondary,
		brandPrimary,
		appBackground,
		rowTextColor,
		controlBlockStyle: {
			flexDirection: 'row',
			width: deviceWidth * 0.3,
			height: '100%',
			alignItems: 'center',
			justifyContent: 'center',
			marginRight: 10,
		},
		textCoverStyle: {
			marginLeft: 5,
		},
		scaleStyle: {
			color: rowTextColor,
			fontSize: deviceWidth * 0.03,
		},
		valueStyle: {
			color: rowTextColor,
			fontSize: deviceWidth * 0.055,
		},
		unitStyle: {
			color: rowTextColor,
			fontSize: deviceWidth * 0.035,
		},
		iconBlockStyle: {
			width: deviceWidth * 0.2,
			alignItems: 'center',
			justifyContent: 'center',
			marginLeft: 1,
			...shadow,
		},
		editIconStyle: {
			marginLeft: 5,
		},
		editIconSize: deviceWidth * 0.045,
		editIconSizeDone: deviceWidth * 0.055,
		iconSize: deviceWidth * 0.08,
		controlIconSize: deviceWidth * 0.06,
		textStyle: {
			color: rowTextColor,
			fontSize: deviceWidth * 0.055,
		},
	};
}
}

module.exports = ModeBlock;
