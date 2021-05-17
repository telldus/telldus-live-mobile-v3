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
import { TouchableOpacity, LayoutAnimation } from 'react-native';
import { injectIntl } from 'react-intl';

import {
	View,
	Text,
	EditBox,
	IconTelldus,
} from '../../../BaseComponents';
import LastUpdatedInfo from '../TabViews/SubViews/Sensor/LastUpdatedInfo';
import {
	InfoActionQueuedOnWakeUp,
} from './SubViews';

import { LayoutAnimations, formatModeValue } from '../../Lib';
import Theme from '../../Theme';
import i18n from '../../Translations/common';

import {
	withTheme,
	PropsThemedComponent,
} from '../HOC/withTheme';

type Props = PropsThemedComponent & {
	baseColor: string,
    title: string,
    currentValue: number,
	appLayout: Object,
	lastUpdated: number,
	controllingMode: string,
	maxVal: number,
	minVal: number,
	currentValueInScreen: number,
	currentTemp: string,
	supportResume: boolean,
	gatewayTimezone: string,
	hideModeControl: boolean,
	actionsQueueThermostat: Object,

	onControlThermostat: (mode: string, temperature?: number | string | null, changeMode: 1 | 0, requestedState: number) => void,
	intl: Object,
	onEditSubmitValue: (number, ?number) => void,
	updateCurrentValueInScreen: (string, ?string) => void,
};

type State = {
	editValue: boolean,
};

class ControlInfoBlock extends View<Props, State> {
props: Props;
state: State;

constructor(props: Props) {
	super(props);

	this.state = {
		editValue: false,
	};
}

onPressEdit = () => {
	const { controllingMode } = this.props;
	if (controllingMode) {
		this.setState({
			editValue: true,
		});
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
	}
}

onChangeText = (value: string) => {
	this.props.updateCurrentValueInScreen(value);
}

onSubmitEditing = () => {
	this.setState({
		editValue: false,
	});

	const { minVal, maxVal, currentValue } = this.props;
	let fallbackValue = currentValue || minVal || maxVal;
	fallbackValue = fallbackValue ? fallbackValue.toString() : '';

	if (!this.props.currentValueInScreen || this.props.currentValueInScreen === '') {
		this.props.updateCurrentValueInScreen(fallbackValue);
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		return;
	}

	const value = parseFloat(parseFloat(this.props.currentValueInScreen).toFixed(1));
	const { controllingMode } = this.props;
	if (isNaN(value) || value > parseFloat(maxVal) || value < parseFloat(minVal)) {
		this.props.updateCurrentValueInScreen(fallbackValue);
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		return;
	}

	if (value !== null) {
		this.props.onEditSubmitValue(value, value);
	}
	LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
	this.props.onControlThermostat(controllingMode, value, 1, 1);
}

formatModeValue = (modeValue: number | string): string | number => {
	if (modeValue === '-') {
		return modeValue;
	}
	const valToFormat = isNaN(modeValue) ? -100.0 : modeValue;
	let val = this.props.intl.formatNumber(valToFormat, {minimumFractionDigits: 1});
	return formatModeValue(val, this.props.intl.formatNumber);
}

onPressResume = () => {
	this.props.onControlThermostat('resume', undefined, 1, 1);
}

render(): Object {

	const {
		baseColor,
		title,
		appLayout,
		lastUpdated,
		intl,
		currentValueInScreen,
		currentTemp,
		controllingMode,
		supportResume,
		gatewayTimezone,
		hideModeControl,
		selectedThemeSet,
		colors,
		actionsQueueThermostat,
	} = this.props;

	const {
		editValue,
	} = this.state;

	const {
		InfoCover,
		infoTitleStyle,
		sValueStyle,
		sUnitStyle,
		cLabelStyle,
		cValueStyle,
		lastUpdatedInfoStyle,
		cUnitStyle,
		editBoxStyle,
		textStyle,
		leftIconStyle,
		labelStyle,
		doneIconStyle,
		doneIconCoverStyle,
		offInfoText,
		playIconStyle,
		offContentCover,
		fanIconStyle,
		box3,
		box2,
		box1,
		inAppBrandSecondary,
		infoIconStyle,
	} = this.getStyles();

	const cModevalue = this.formatModeValue(currentValueInScreen);

	const seconds = Math.trunc((new Date().getTime() / 1000) - parseFloat(lastUpdated));

	const colorOne = selectedThemeSet.key === 1 ? (controllingMode === 'fan' ? inAppBrandSecondary : baseColor) : colors.baseColorFive;
	const colorTwo = selectedThemeSet.key === 1 ? baseColor : colors.baseColorFive;

	const isEditBoxValueValid = currentValueInScreen !== null && typeof currentValueInScreen !== 'undefined';
	const showQueueInfo = Object.keys(actionsQueueThermostat).length > 0;

	return (
		<View style={InfoCover} pointerEvents="box-none">
			<View style={box1}>
				<View style={{
					flexDirection: 'row',
					alignItems: 'center',
				}}>
					<Text style={[infoTitleStyle, {
						color: colorOne,
					}]}>
						{!!title && hideModeControl ?
							''
							:
							title.toUpperCase()
						}
					</Text>
					{!!title && !hideModeControl && showQueueInfo && (
						<InfoActionQueuedOnWakeUp
							iconStyle={[infoIconStyle, {color: colorOne}]}/>
					)}
				</View>
			</View>
			{editValue ?
				<View style={[box2, {
					alignItems: 'center',
					justifyContent: 'center',
				}]}>
					<Text style={labelStyle}>
						{intl.formatMessage(i18n.labelTemperature)}
					</Text>
					<View style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center',
					}}>
						<EditBox
							value={isEditBoxValueValid ? currentValueInScreen.toString() : ''}
							appLayout={appLayout}
							containerStyle={editBoxStyle}
							textStyle={textStyle}
							iconStyle={leftIconStyle}
							icon="temperature"
							onChangeText={this.onChangeText}
							onSubmitEditing={this.onSubmitEditing}
							keyboardType={'phone-pad'}/>
						<TouchableOpacity style={doneIconCoverStyle} onPress={this.onSubmitEditing}>
							<IconTelldus icon={'checkmark'} style={doneIconStyle}/>
						</TouchableOpacity>
					</View>
				</View>
				:
				<>
					{controllingMode === 'off' ?
						<>
							{supportResume && <TouchableOpacity onPress={this.onPressResume}>
								<View style={[box2, offContentCover]}>
									<IconTelldus icon="play" style={playIconStyle}/>
									<Text style={offInfoText}>
										{intl.formatMessage(i18n.clickToResume)}
									</Text>
								</View>
							</TouchableOpacity>
							}
						</>
						:
						controllingMode === 'fan' ?
							<View style={[box2, offContentCover]}>
								<IconTelldus icon="thermostatfan" style={fanIconStyle}/>
							</View>
							:
							<View style={box2}>
								<View style={{
									flexDirection: 'row',
								}}>
									<Text style={{
										textAlignVertical: 'center',
									}} onPress={this.onPressEdit}>
										<Text style={[sValueStyle, {
											color: colorTwo,
										}]}>
											{cModevalue}
										</Text>
										<Text style={Theme.Styles.hiddenText}>
								!
										</Text>
										<Text style={[sUnitStyle, {
											color: colorTwo,
										}]}>
								°C
										</Text>
									</Text>
									{!title && showQueueInfo && (
										<InfoActionQueuedOnWakeUp
											iconStyle={[infoIconStyle, {color: colorOne}]}/>
									)}
								</View>
							</View>
					}
				</>
			}
			<View style={box3}>
				{currentTemp &&
			<>
				<Text style={cLabelStyle}>
					{intl.formatMessage(i18n.labelCurrent)}
				</Text>
				<Text>
					<Text style={cValueStyle}>
						{intl.formatNumber(currentTemp)}
					</Text>
					<Text style={cUnitStyle}>
							°C
					</Text>
				</Text>
			</>
				}
				{!!lastUpdated &&
				<LastUpdatedInfo
					value={-seconds}
					numeric="auto"
					timestamp={lastUpdated}
					updateIntervalInSeconds={60}
					gatewayTimezone={gatewayTimezone}
					textStyle={lastUpdatedInfoStyle} />
				}
			</View>
		</View>
	);
}

getStyles(): Object {
	const { appLayout, colors } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		inAppBrandSecondary,
	} = colors;

	const {
		rowTextColor,
		fontSizeFactorFive,
		fontSizeFactorFour,
		fontSizeFactorEight,
	} = Theme.Core;

	return {
		inAppBrandSecondary,
		InfoCover: {
			position: 'absolute',
			top: 0,
			left: 0,
			bottom: 0,
			right: 0,
			alignItems: 'center',
			justifyContent: 'center',
		},
		box1: {
			justifyContent: 'flex-end',
			height: '26%',
		},
		infoTitleStyle: {
			fontSize: deviceWidth * fontSizeFactorEight,
		},
		box2: {
			height: '26%',
			alignItems: 'center',
			justifyContent: 'center',
		},
		box3: {
			height: '30%',
			justifyContent: 'flex-end',
			alignItems: 'center',
		},
		sValueStyle: {
			fontSize: Math.floor(deviceWidth * 0.15555),
		},
		sUnitStyle: {
			fontSize: Math.floor(deviceWidth * 0.085555),
		},
		cLabelStyle: {
			fontSize: deviceWidth * 0.032,
			color: rowTextColor,
		},
		cValueStyle: {
			fontSize: deviceWidth * 0.06,
			color: rowTextColor,
		},
		cUnitStyle: {
			fontSize: deviceWidth * fontSizeFactorFive,
			color: rowTextColor,
		},
		lastUpdatedInfoStyle: {
			fontSize: deviceWidth * 0.027,
			color: rowTextColor,
		},
		iconSize: deviceWidth * 0.14,
		editBoxStyle: {
			width: deviceWidth * 0.36,
			height: deviceWidth * 0.12,
			elevation: 0,
			backgroundColor: 'transparent',
			shadowColor: 'transparent',
			shadowRadius: 0,
			shadowOpacity: 0,
			shadowOffset: {
				width: 0,
				height: 0,
			},
			padding: 0,
		},
		textStyle: {
			fontSize: deviceWidth * 0.054,
			color: rowTextColor,
		},
		leftIconStyle: {
			fontSize: deviceWidth * 0.1,
		},
		labelStyle: {
			fontSize: deviceWidth * fontSizeFactorFour,
			textAlign: 'center',
			textAlignVertical: 'bottom',
			color: inAppBrandSecondary,
			marginTop: 5,
		},
		doneIconStyle: {
			fontSize: deviceWidth * 0.055,
			color: inAppBrandSecondary,
			textAlign: 'center',
			textAlignVertical: 'center',
			marginTop: deviceWidth * 0.02,
			padding: 3,
		},
		doneIconCoverStyle: {
			alignItems: 'center',
			justifyContent: 'center',
		},
		offContentCover: {
			alignItems: 'center',
			justifyContent: 'center',
		},
		playIconStyle: {
			color: inAppBrandSecondary,
			fontSize: deviceWidth * 0.07,
			marginTop: 5,
		},
		offInfoText: {
			color: inAppBrandSecondary,
			fontSize: deviceWidth * fontSizeFactorFour,
			textAlign: 'center',
			marginTop: 5,
		},
		fanIconStyle: {
			color: '#999999',
			fontSize: deviceWidth * 0.13,
			marginTop: 5,
		},
		infoIconStyle: {
			fontSize: deviceWidth * fontSizeFactorEight,
			marginLeft: 2,
		},
	};
}
}

module.exports = (withTheme(injectIntl(ControlInfoBlock)): Object);
