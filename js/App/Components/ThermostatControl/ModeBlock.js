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
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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
import {
	formatModeValue,
	getNextSetPoint,
} from '../../Lib';

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
	setpointValueLocal: string,

	onPressRow: (mode: string, changeMode: 0 | 1, callback: Function) => void,
	onControlThermostat: (mode: string, temperature?: number | string | null, changeMode: 1 | 0, requestedState: number) => Promise<any>,
	intl: Object,
	onEditSubmitValue: (number, ?number) => void,
	updateCurrentValueInScreen: (string, ?string) => void,
	IconActive: Object,
	Icon: Object,
};

class ModeBlock extends View<Props, null> {
props: Props;
state: State;

onPressRow: (changeMode: 0 | 1, callback: Function) => void;

constructor(props: Props) {
	super(props);

	this.onPressRow = this.onPressRow.bind(this);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return true;
}

onPressRow = (changeMode: 0 | 1, callback?: Function) => {
	const { onPressRow, mode } = this.props;
	if (onPressRow) {
		onPressRow(mode, changeMode, callback);
	}
}

onPressChangeMode = (changeMode: 0 | 1, callback?: Function) => {
	this.onPressRow(changeMode, callback);
	const { mode, value } = this.props;
	const val = parseFloat(parseFloat(value).toFixed(1));
	this.props.onControlThermostat(mode, val, 1, mode === 'off' ? 2 : 1);
}

onPressUp = () => {
	const {
		maxVal,
		mode,
		value,
		controllingMode,
	} = this.props;
	const nextValue = getNextSetPoint({
		value,
		maxVal,
	}, 'increase');
	this.onPressRow(controllingMode === mode ? 1 : 0, () => {
		this.props.updateCurrentValueInScreen(nextValue.toString(), nextValue.toString());
		this.props.onEditSubmitValue(parseFloat(nextValue), parseFloat(nextValue));
		this.props.onControlThermostat(mode, nextValue, controllingMode === mode ? 1 : 0, mode === 'off' ? 2 : 1);
	});
}

onPressDown = () => {
	const {
		minVal,
		mode,
		value,
		controllingMode,
	} = this.props;
	const nextValue = getNextSetPoint({
		value,
		minVal,
	}, 'decrease');
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

render(): Object {

	const {
		label,
		value,
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
		valueStyle,
		unitStyle,
		iconBlockStyle,
		appBackground,
		textCoverStyle,
		rowTextColor,
		iconSize,
		iconSizeAddRemove,
		addRemoveIconCover,
	} = this.getStyles();

	let iconBGColor = active ? brandSecondary : appBackground;
	let iconColor = active ? '#fff' : brandSecondary;
	let textColor = active ? brandSecondary : rowTextColor;
	if (mode === 'off') {
		iconBGColor = active ? brandPrimary : appBackground;
		iconColor = active ? '#fff' : brandPrimary;
		textColor = rowTextColor;
	}

	const cModevalue = this.formatModeValue(value);

	const hasInitialValue = initialValue !== null && typeof initialValue !== 'undefined' && !isNaN(initialValue);

	return (
		<View style={cover}>
			<View style={leftBlock}>
				<LabelBlock
					textStyle={[labelStyle, { color: textColor }]}
					label={label.toUpperCase()}
					onPressRow={this.onPressChangeMode}/>
				{hasInitialValue && (
					<View style={controlBlockStyle}>
						<View style={{flex: 0}}>
							<TouchableOpacity onPress={this.onPressUp} style={addRemoveIconCover}>
								<MaterialIcons
									name="remove"
									color={Theme.Core.brandPrimary}
									size={iconSizeAddRemove}/>
							</TouchableOpacity>
						</View>
						<View style={textCoverStyle}>
							<Text>
								<Text style={[valueStyle, { color: textColor }]}>
									{cModevalue}
								</Text>
								<Text style={[unitStyle, { color: textColor }]}>
									{unit}
								</Text>
							</Text>
						</View>
						<View style={{flex: 0}}>
							<TouchableOpacity onPress={this.onPressUp} style={addRemoveIconCover}>
								<MaterialIcons
									name="add"
									color={Theme.Core.brandSecondary}
									size={iconSizeAddRemove}/>
							</TouchableOpacity>
						</View>
					</View>
				)}
			</View>
			<ModeIconBlock style={[iconBlockStyle, {backgroundColor: iconBGColor}]} onPressRow={this.onPressChangeMode}>
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

	const iconSizeAddRemove = deviceWidth * 0.05;
	const iconCoverSize = iconSizeAddRemove * 1.4;
	const iconBorderRadi = iconCoverSize / 2;

	return {
		iconSizeAddRemove,
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
			marginHorizontal: 7,
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
		iconSize: deviceWidth * 0.08,
		addRemoveIconCover: {
			backgroundColor: appBackground,
			height: iconCoverSize,
			width: iconCoverSize,
			borderRadius: iconBorderRadi,
			alignItems: 'center',
			justifyContent: 'center',
		},
	};
}
}

module.exports = ModeBlock;
