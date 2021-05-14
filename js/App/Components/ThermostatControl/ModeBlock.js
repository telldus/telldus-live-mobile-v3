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
	EmptyView,
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

import {
	withTheme,
	PropsThemedComponent,
} from '../HOC/withTheme';

type Props = PropsThemedComponent & {
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
	hideTemperatureControl: boolean,

	onPressRow: (mode: string, changeMode: 0 | 1, callback: Function) => void,
	onControlThermostat: (mode: string, temperature?: number | string | null, changeMode: 1 | 0, requestedState: number) => Promise<any>,
	intl: Object,
	onEditSubmitValue: (number, ?number) => void,
	updateCurrentValueInScreen: (string, ?string) => void,
	IconActive: Object,
	Icon: Object,
	handleAddMinus: (string, 0 | 1, number) => void,
};

class ModeBlock extends View<Props, null> {
props: Props;

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
		handleAddMinus,
	} = this.props;
	const nextValue = getNextSetPoint({
		value,
		maxVal,
	}, 'increase');
	handleAddMinus(mode, controllingMode === mode ? 1 : 0, nextValue);
}

onPressDown = () => {
	const {
		minVal,
		mode,
		value,
		controllingMode,
		handleAddMinus,
	} = this.props;
	const nextValue = getNextSetPoint({
		value,
		minVal,
	}, 'decrease');
	handleAddMinus(mode, controllingMode === mode ? 1 : 0, nextValue);
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
		hideTemperatureControl,
		colors,
	} = this.props;

	const {
		cover,
		labelStyle,
		leftBlock,
		controlBlockStyle,
		valueStyle,
		unitStyle,
		iconBlockStyle,
		textCoverStyle,
		rowTextColor,
		iconSize,
		iconSizeAddRemove,
		addRemoveIconCover,
	} = this.getStyles();

	const {
		colorOnActiveBg,
		colorOnInActiveBg,
		colorOffActiveBg,
		colorOffInActiveBg,
		colorOffActiveIcon,
		colorOnActiveIcon,
		colorOnInActiveIcon,
		colorOffInActiveIcon,
		inAppBrandSecondary,
		inAppBrandPrimary,
	} = colors;

	let iconBGColor = active ? colorOnActiveBg : colorOnInActiveBg;
	let iconColor = active ? colorOnActiveIcon : colorOnInActiveIcon;
	let textColor = active ? colorOnActiveBg : rowTextColor;
	if (mode === 'off') {
		iconBGColor = active ? colorOffActiveBg : colorOffInActiveBg;
		iconColor = active ? colorOffActiveIcon : colorOffInActiveIcon;
		textColor = rowTextColor;
	}

	const cModevalue = this.formatModeValue(value);

	const hasInitialValue = initialValue !== null && typeof initialValue !== 'undefined' && !isNaN(initialValue);

	return (
		<View
			level={2}
			style={cover}>
			<View
				level={2}
				style={leftBlock}>
				<LabelBlock
					textStyle={[labelStyle, { color: textColor }]}
					label={label.toUpperCase()}
					onPressRow={this.onPressChangeMode}/>
				{(hasInitialValue && !hideTemperatureControl ) ?
					<View style={controlBlockStyle}>
						<View style={{flex: 0}}>
							<TouchableOpacity onPress={this.onPressDown} style={addRemoveIconCover}>
								<MaterialIcons
									name="remove"
									color={inAppBrandPrimary}
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
									color={inAppBrandSecondary}
									size={iconSizeAddRemove}/>
							</TouchableOpacity>
						</View>
					</View>
					:
					<EmptyView/>
				}
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
	const { appLayout, colors } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		rowTextColor,
		fontSizeFactorFive,
		fontSizeFactorTen,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const iconSizeAddRemove = deviceWidth * fontSizeFactorFive;
	const iconCoverSize = iconSizeAddRemove * 1.4;
	const iconBorderRadi = iconCoverSize / 2;

	return {
		iconSizeAddRemove,
		cover: {
			...shadow,
			flexDirection: 'row',
			alignItems: 'stretch',
			justifyContent: 'flex-start',
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
		},
		labelStyle: {
			color: rowTextColor,
			fontSize: deviceWidth * fontSizeFactorFive,
			textAlignVertical: 'center',
			flex: 1,
		},
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
			fontSize: deviceWidth * fontSizeFactorTen,
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
			backgroundColor: colors.viewInsideLevelTwoView,
			height: iconCoverSize,
			width: iconCoverSize,
			borderRadius: iconBorderRadi,
			alignItems: 'center',
			justifyContent: 'center',
		},
	};
}
}

module.exports = (withTheme(ModeBlock): Object);
