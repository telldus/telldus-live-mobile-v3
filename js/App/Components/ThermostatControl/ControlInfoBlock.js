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
import moment from 'moment';
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
	showSlider: boolean,
	controllingMode: string,
	maxVal: number,
	minVal: number,

	onControlThermostat: (mode: string, temperature?: number | string | null, requestedState: number) => void,
	intl: intlShape,
};

type State = {
	editValue: boolean,
	editBoxValue: string | null,
	currentValue: number,
	currentValueInScreen: number,
};

class ControlInfoBlock extends View<Props, State> {
props: Props;
state: State;

static getDerivedStateFromProps(props: Object, state: Object): Object | null {
	if (props.currentValue !== state.currentValue) {
		return {
			editBoxValue: props.currentValue ? props.currentValue.toString() : null,
			currentValue: props.currentValue,
			currentValueInScreen: props.currentValue,
		};
	}
	return null;
}

constructor(props: Props) {
	super(props);

	const { currentValue } = props;
	this.state = {
		editValue: false,
		editBoxValue: currentValue ? currentValue.toString() : null,
		currentValue,
		currentValueInScreen: currentValue,
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
	const { maxVal, minVal } = this.props;
	if (parseFloat(value) > maxVal || parseFloat(value) < minVal) {
		return;
	}
	this.setState({
		editBoxValue: value,
		currentValueInScreen: parseFloat(value),
	});
}

onSubmitEditing = () => {
	this.setState({
		editValue: false,
	});
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));

	if (!this.state.editBoxValue || this.state.editBoxValue === '') {
		this.setState({
			editBoxValue: this.props.currentValue ? this.props.currentValue.toString() : null,
			currentValueInScreen: this.props.currentValue,
		});
		return;
	}

	const value = this.state.editBoxValue ? parseFloat(this.state.editBoxValue).toFixed(1) : null;
	const { maxVal, minVal, controllingMode } = this.props;
	if (typeof value === 'number' && typeof minVal === 'number' && typeof maxVal === 'number' && (value > maxVal || value < minVal)) {
		return;
	}

	this.props.onControlThermostat(controllingMode, value, 1);
}

formatSensorLastUpdate = (time: string): string => {
	return formatSensorLastUpdate(time, this.props.intl);
}

formatModeValue = (modeValue: number): () => string | number => {
	const val = this.props.intl.formatNumber(typeof modeValue === 'undefined' ? -100.0 : modeValue, {minimumFractionDigits: 1});
	return formatModeValue(val);
}

render(): Object {

	const {
		baseColor,
		title,
		appLayout,
		lastUpdated,
		intl,
		currentValue,
	} = this.props;

	const {
		editValue,
		editBoxValue,
		currentValueInScreen,
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
	} = this.getStyles();

	const cModevalue = this.formatModeValue(currentValueInScreen);
	const currModevalue = this.formatModeValue(currentValue);
	return (
		<View style={InfoCover}>
			{!!title && <Text style={[infoTitleStyle, {
				color: baseColor,
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
							Temperature
						</Text>
						<View style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'center',
						}}>
							<EditBox
								value={editBoxValue}
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
			</View>
			<Text style={cLabelStyle}>
				{intl.formatMessage(i18n.labelCurrentTemperature)}
			</Text>
			<Text>
				<Text style={cValueStyle}>
					{currModevalue}
				</Text>
				<Text style={cUnitStyle}>
							°C
				</Text>
			</Text>
			<Text style={lastUpdatedInfoStyle}>
				{`${intl.formatMessage(i18n.labelLastUpdated)}: `}
				<FormattedRelative
					value={moment.unix(lastUpdated)}
					formatterFunction={this.formatSensorLastUpdate}
					textStyle={lastUpdatedInfoStyle}/>
			</Text>
		</View>
	);
}

getStyles(): Object {
	const { appLayout, showSlider } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		rowTextColor,
		brandSecondary,
	} = Theme.Core;

	return {
		InfoCover: {
			position: showSlider ? 'absolute' : 'relative',
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
	};
}
}

module.exports = injectIntl(ControlInfoBlock);
