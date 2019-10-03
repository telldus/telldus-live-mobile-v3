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
import {
	TouchableOpacity,
	TextInput,
	LayoutAnimation,
	InteractionManager,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {
	View,
	Text,
	IconTelldus,
} from '../../../BaseComponents';
import {
	LabelBlock,
	ModeIconBlock,
} from './SubViews';

import Theme from '../../Theme';
import { LayoutAnimations, formatModeValue } from '../../Lib';

type Props = {
    appLayout: Object,
    label: string,
    edit: boolean,
    icon: string,
    value: number,
    scale: string,
    unit: string,
	active: boolean,
	mode: string,
	maxVal: number,
	minVal: number,
	currentValue: number,
	initialValue?: number,
	controllingMode: string,
	setpointMode: string,
	editState: Object,

	onPressRow: (mode: string, changeMode: 0 | 1, callback: Function) => void,
	onControlThermostat: (mode: string, temperature?: number | string | null, changeMode: 1 | 0, requestedState: number) => Promise<any>,
	intl: Object,
	onEditSubmitValue: (number, ?number) => void,
	updateCurrentValueInScreen: (string, ?string) => void,
	IconActive: Object,
	Icon: Object,
	toggleStateEditing: (Object, boolean) => void,
};

type State = {
	editValue: boolean,
};

class ModeBlock extends View<Props, State> {
props: Props;
state: State;

onPressRow: (changeMode: 0 | 1, callback: Function) => void;

constructor(props: Props) {
	super(props);

	this.state = {
		editValue: false,
	};

	this.onPressRow = this.onPressRow.bind(this);

	this.textInput = null;
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return true;
}

onPressRow = (changeMode: 0 | 1, callback: Function) => {
	const { onPressRow, mode } = this.props;
	if (onPressRow) {
		onPressRow(mode, changeMode, callback);
	}
}

onChangeText = (value: string) => {
	this.props.updateCurrentValueInScreen(value, value);
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

	const value = parseFloat(parseFloat(this.props.value).toFixed(1));
	const { maxVal, minVal, mode, controllingMode } = this.props;
	if (isNaN(value) || value > parseFloat(maxVal) || value < parseFloat(minVal)) {
		this.props.updateCurrentValueInScreen(this.props.currentValue.toString());
		LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
		return;
	}

	if (value !== null) {
		this.props.onEditSubmitValue(value);
	}
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
	this.props.onControlThermostat(mode, value, controllingMode === mode ? 1 : 0, mode === 'off' ? 2 : 1).then(() => {
		this.props.toggleStateEditing({
			[this.props.mode]: false,
		}, false);
	}).catch(() => {
		this.props.toggleStateEditing({
			[this.props.mode]: false,
		}, false);
	});
}

componentDidUpdate(prevProps: Object, prevState: Object) {
	const { mode, editState } = this.props;
	const { editValue } = this.state;
	const k = Object.keys(editState);
	if (editValue && k[0] && editState[k[0]] && k[0] !== mode) {
		this.onSubmitEditing();
	}
}

onPressEdit = () => {
	const {
		mode,
		controllingMode,
		toggleStateEditing,
		editState,
	} = this.props;
	const k = Object.keys(editState);
	if (k[0] && editState[k[0]] && k[0] !== mode) {
		toggleStateEditing({
			[mode]: true,
		}, true);
		return;
	}
	toggleStateEditing({
		[mode]: true,
	}, false);
	this.setState({
		editValue: true,
	}, () => {
		if (this.textInput) {
			InteractionManager.runAfterInteractions(() => {
				this.textInput.focus();
			});
		}
	});
	this.onPressRow(controllingMode === mode ? 1 : 0);
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
}

onPressUp = () => {
	if (this.state.editValue) {
		this.onSubmitEditing();
		return;
	}
	const { maxVal, mode, value, controllingMode } = this.props;
	let nextValue = parseFloat((parseFloat(value) + parseFloat(1)).toFixed(1));
	if (nextValue > parseFloat(maxVal)) {
		return;
	}
	this.onPressRow(controllingMode === mode ? 1 : 0, () => {
		this.props.updateCurrentValueInScreen(nextValue.toString(), nextValue.toString());
		this.props.onEditSubmitValue(parseFloat(nextValue), parseFloat(nextValue));
		this.props.onControlThermostat(mode, nextValue, controllingMode === mode ? 1 : 0, mode === 'off' ? 2 : 1);
	});
}

onPressDown = () => {
	if (this.state.editValue) {
		this.onSubmitEditing();
		return;
	}
	const { minVal, mode, value, controllingMode } = this.props;
	let nextValue = parseFloat((parseFloat(value) + parseFloat(-1)).toFixed(1));
	if (nextValue < parseFloat(minVal)) {
		return;
	}
	this.onPressRow(controllingMode === mode ? 1 : 0, () => {
		this.props.updateCurrentValueInScreen(nextValue.toString(), nextValue.toString());
		this.props.onEditSubmitValue(parseFloat(nextValue), parseFloat(nextValue));
		this.props.onControlThermostat(mode, nextValue, controllingMode === mode ? 1 : 0, mode === 'off' ? 2 : 1);
	});
}

formatModeValue = (modeValue?: number | string): string | number => {
	if (modeValue === '-') {
		return modeValue;
	}
	const valToFormat = isNaN(modeValue) ? -100.0 : modeValue;
	let val = this.props.intl.formatNumber(valToFormat, {minimumFractionDigits: 1});
	return formatModeValue(val, this.props.intl.formatNumber);
}

setRef = (ref: any) => {
	this.textInput = ref;
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
		initialValue,
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

	const isEditBoxValueValid = value !== null && typeof value !== 'undefined';

	const hasInitialValue = initialValue !== null && typeof initialValue !== 'undefined' && !isNaN(initialValue);

	return (
		<View style={cover}>
			<View style={leftBlock}>
				<LabelBlock
					textStyle={[labelStyle, { color: textColor }]}
					label={label.toUpperCase()}
					onPressRow={this.onPressRow}/>
				{hasInitialValue && (
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
								ref={this.setRef}
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
			<ModeIconBlock style={[iconBlockStyle, {backgroundColor: iconBGColor}]} onPress={this.onPressRow}>
				{mode !== 'off' ?
					active ?
						<IconActive height={iconSize} width={iconSize}/>
						:
						<Icon height={iconSize} width={iconSize}/>
					:
					<IconTelldus icon={'off'} size={iconSize} color={iconColor}/>
				}
			</ModeIconBlock>
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
