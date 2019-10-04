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
import { injectIntl, intlShape } from 'react-intl';

import {
	View,
	Text,
	EditBox,
	FormattedRelative,
	IconTelldus,
} from '../../../BaseComponents';

import { LayoutAnimations, formatSensorLastUpdate, formatModeValue } from '../../Lib';
import Theme from '../../Theme';
import i18n from '../../Translations/common';

type Props = {
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

	onControlThermostat: (mode: string, temperature?: number | string | null, changeMode: 1 | 0, requestedState: number) => void,
	intl: intlShape,
	onEditSubmitValue: (number) => void,
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

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return true;
}

onPressEdit = () => {
	this.setState({
		editValue: true,
	});
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
}

onChangeText = (value: string) => {
	this.props.updateCurrentValueInScreen(value);
}

onSubmitEditing = () => {
	this.setState({
		editValue: false,
	});

	if (!this.props.currentValueInScreen || this.props.currentValueInScreen === '') {
		this.props.updateCurrentValueInScreen(this.props.currentValue.toString());
		LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
		return;
	}

	const value = parseFloat(parseFloat(this.props.currentValueInScreen).toFixed(1));
	const { maxVal, minVal, controllingMode } = this.props;
	if (isNaN(value) || value > parseFloat(maxVal) || value < parseFloat(minVal)) {
		this.props.updateCurrentValueInScreen(this.props.currentValue.toString());
		LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
		return;
	}

	if (value !== null) {
		this.props.onEditSubmitValue(value);
	}
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
	this.props.onControlThermostat(controllingMode, value, 1, 1);
}

formatSensorLastUpdate = (time: string): string => {
	return formatSensorLastUpdate(time, this.props.intl);
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
	} = this.props;

	const {
		editValue,
	} = this.state;

	const {
		InfoCover,
		infoTitleStyle,
		selectedInfoCoverStyle,
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
		brandSecondary,
		fanIconStyle,
	} = this.getStyles();

	const cModevalue = this.formatModeValue(currentValueInScreen);

	const seconds = Math.trunc((new Date().getTime() / 1000) - parseFloat(lastUpdated));

	const isEditBoxValueValid = currentValueInScreen !== null && typeof currentValueInScreen !== 'undefined';
	return (
		<View style={InfoCover} pointerEvents="box-none">
			{!!title && <Text style={[infoTitleStyle, {
				color: controllingMode === 'fan' ? brandSecondary : baseColor,
			}]}>
				{title.toUpperCase()}
			</Text>}
			<View style={selectedInfoCoverStyle}>
				{editValue ?
					<View style={{
						alignItems: 'center',
						justifyContent: 'center',
					}}>
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
						<TouchableOpacity onPress={this.onPressResume}>
							<View style={offContentCover}>
								<IconTelldus icon="play" style={playIconStyle}/>
								<Text style={offInfoText}>
									{intl.formatMessage(i18n.clickToResume)}
								</Text>
							</View>
						</TouchableOpacity>
						:
						controllingMode === 'fan' ?
							<View style={offContentCover}>
								<IconTelldus icon="thermostatfan" style={fanIconStyle}/>
							</View>
							:
							<Text style={{ textAlignVertical: 'center' }} onPress={this.onPressEdit}>
								<Text style={[sValueStyle, {
									color: baseColor,
								}]}>
									{cModevalue}
								</Text>
								<Text style={Theme.Styles.hiddenText}>
								!
								</Text>
								<Text style={[sUnitStyle, {
									color: baseColor,
								}]}>
								°C
								</Text>
							</Text>
					}
					</>
				}
			</View>
			<Text style={cLabelStyle}>
				{intl.formatMessage(i18n.labelCurrentTemperature)}
			</Text>
			<Text>
				<Text style={cValueStyle}>
					{currentTemp}
				</Text>
				<Text style={cUnitStyle}>
							°C
				</Text>
			</Text>
			{!!lastUpdated && <Text style={lastUpdatedInfoStyle}>
				{`${intl.formatMessage(i18n.labelLastUpdated)}: `}
				<FormattedRelative
					value={-seconds}
					numeric="auto"
					updateIntervalInSeconds={60}
					formatterFunction={this.formatSensorLastUpdate}
					textStyle={lastUpdatedInfoStyle}/>
			</Text>
			}
		</View>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		rowTextColor,
		brandSecondary,
	} = Theme.Core;

	return {
		brandSecondary,
		InfoCover: {
			position: 'absolute',
			top: 0,
			left: 0,
			bottom: 0,
			right: 0,
			alignItems: 'center',
			justifyContent: 'center',
		},
		infoTitleStyle: {
			fontSize: deviceWidth * 0.045,
			marginTop: 10,
		},
		selectedInfoCoverStyle: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
		},
		sValueStyle: {
			fontSize: deviceWidth * 0.15,
		},
		sUnitStyle: {
			fontSize: deviceWidth * 0.08,
		},
		cLabelStyle: {
			fontSize: deviceWidth * 0.032,
			color: rowTextColor,
			marginTop: 5,
		},
		cValueStyle: {
			fontSize: deviceWidth * 0.06,
			color: rowTextColor,
		},
		cUnitStyle: {
			fontSize: deviceWidth * 0.05,
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
			fontSize: deviceWidth * 0.04,
			textAlign: 'center',
			textAlignVertical: 'bottom',
			color: brandSecondary,
			marginTop: 5,
		},
		doneIconStyle: {
			fontSize: deviceWidth * 0.055,
			color: brandSecondary,
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
			marginVertical: 5,
			alignItems: 'center',
			justifyContent: 'center',
		},
		playIconStyle: {
			color: brandSecondary,
			fontSize: deviceWidth * 0.07,
			marginTop: 5,
		},
		offInfoText: {
			color: brandSecondary,
			fontSize: deviceWidth * 0.04,
			textAlign: 'center',
			marginTop: 5,
		},
		fanIconStyle: {
			color: '#999999',
			fontSize: deviceWidth * 0.13,
			marginTop: 5,
		},
	};
}
}

module.exports = injectIntl(ControlInfoBlock);
