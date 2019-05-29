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
import { LayoutAnimation } from 'react-native';
import CircularSlider from 'react-native-circular-slider';

import {
	View,
} from '../../../BaseComponents';
import ModesList from './ModesList';
import ControlInfoBlock from './ControlInfoBlock';

import { LayoutAnimations } from '../../Lib';

import Theme from '../../Theme';

type Props = {
	appLayout: Object,
	modes: Array<Object>,
	device: Object,
	lastUpdated: number,

	deviceSetStateThermostat: (deviceId: number, mode: string, temperature?: number, scale?: 0 | 1, changeMode?: 0 | 1, requestedState: number) => Promise<any>,
};

type State = {
    angleLength: number,
	startAngle: number,
	currentValue: number,
	controllingMode: string,
	baseColor: string,
	gradientColorFrom: string,
	gradientColorTo: string,
	title: string,
	maxVal: number,
	minVal: number,
	currentValueInScreen: number,
	methodRequested: string,
};

function getAngleLengthToInitiate(currMode: string, currentValueInScreen: number, modes: Array<Object>): number {
	let cMode = {};
	modes.map((mode: Object) => {
		if (mode.mode === currMode) {
			cMode = mode;
		}
	});
	const { maxVal, minVal } = cMode;
	const valueRange = maxVal - minVal;
	const relativeValue = currentValueInScreen - minVal;
	const percentageRelativeValue = relativeValue * 100 / valueRange;

	const angleLenRange = HeatControlWheelModes.maxALength - HeatControlWheelModes.minALength;
	const relativeAngle = angleLenRange * percentageRelativeValue / 100;

	const currentAngleLen = HeatControlWheelModes.minALength + relativeAngle;

	return	currentAngleLen;
}

class HeatControlWheelModes extends View<Props, State> {
props: Props;
state: State;

onUpdate: (Object) => void;
onPressRow: (string) => void;
getValueFromAngle: (number, string) => Object;


static getDerivedStateFromProps(props: Object, state: Object): Object | null {
	const { controllingMode } = state;
	const { device: { methodRequested } } = props;

	let newValue;
	props.modes.map((modeInfo: Object) => {
		if (modeInfo.mode === controllingMode) {
			newValue = modeInfo.value;
		}
	});
	if (newValue !== state.currentValue) {
		return {
			currentValue: newValue,
			currentValueInScreen: parseFloat(newValue),
			methodRequested,
			angleLength: getAngleLengthToInitiate(state.controllingMode, newValue, props.modes),
		};
	}
	if (methodRequested === '' && state.methodRequested !== '' && parseFloat(state.currentValueInScreen) !== parseFloat(newValue)) {
		return {
			currentValue: newValue,
			currentValueInScreen: parseFloat(newValue),
			methodRequested,
			angleLength: getAngleLengthToInitiate(state.controllingMode, newValue, props.modes),
		};
	}
	if (methodRequested !== '' && state.methodRequested === '') {
		return {
			methodRequested,
		};
	}
	return null;
}

static maxALength = Math.PI * 1.5;
static minALength = 0;
static step = 0.5;

constructor(props: Props) {
	super(props);

	this.onUpdate = this.onUpdate.bind(this);
	this.onPressRow = this.onPressRow.bind(this);
	this.getValueFromAngle = this.getValueFromAngle.bind(this);

	this.initialAngle = Math.PI * 1.25;

	const { modes, device } = this.props;
	const { stateValues: {THERMOSTAT = {}}, methodRequested } = device;
	const { mode } = THERMOSTAT;

	let cModeInfo = modes[0];
	modes.map((modeInfo: Object) => {
		if (modeInfo.mode === mode) {
			cModeInfo = modeInfo;
		}
	});

	const currentValue = cModeInfo.value;
	const minVal = cModeInfo.minVal;
	const maxVal = cModeInfo.maxVal;
	const initialAngleLength = getAngleLengthToInitiate(cModeInfo.mode, currentValue, this.props.modes);
	this.state = {
		startAngle: this.initialAngle,
		angleLength: initialAngleLength,
		currentValue,
		currentValueInScreen: parseFloat(currentValue),
		controllingMode: cModeInfo.mode,
		baseColor: cModeInfo.endColor,
		gradientColorFrom: cModeInfo.startColor,
		gradientColorTo: cModeInfo.endColor,
		title: cModeInfo.label,
		minVal,
		maxVal,
		methodRequested,
	};
}

getValueFromAngle = (angleLength: number, currMode: string): Object => {
	const angleRange = HeatControlWheelModes.maxALength - HeatControlWheelModes.minALength;
	const relativeCurrentAngleLen = angleLength - HeatControlWheelModes.minALength;
	const percentageCurrentAngleLen = relativeCurrentAngleLen * 100 / angleRange;

	let cMode = {};
	this.props.modes.map((mode: Object) => {
		if (mode.mode === currMode) {
			cMode = mode;
		}
	});
	const { maxVal, minVal } = cMode;

	const valueRange = maxVal - minVal;
	const relativeValue = valueRange * percentageCurrentAngleLen / 100;

	const t = minVal + relativeValue;
	const temp1 = Math.round(t);
	const temp2 = temp1 + HeatControlWheelModes.step;

	const d1 = Math.abs(temp1 - t);
	const d2 = Math.abs(temp2 - t);

	const nearest = Math.min(d1, d2);
	let temp = temp1;
	if (nearest === d2) {
		temp = temp2;
	}
	return {temp: temp};
}

updateCurrentValueInScreen = (currentValueInScreen: string) => {
	this.setState({
		currentValueInScreen: parseFloat(currentValueInScreen),
	});
}

onUpdate = (data: Object) => {
	const {startAngle, angleLength} = data;
	const { temp } = this.getValueFromAngle(angleLength, this.state.controllingMode);
	this.setState({
		angleLength,
		startAngle,
		currentValueInScreen: parseFloat(temp),
	});
}

onEditSubmitValue = (newValue: number) => {
	const { controllingMode } = this.state;
	const angleLength = getAngleLengthToInitiate(controllingMode, newValue, this.props.modes);
	this.setState({
		angleLength,
		currentValueInScreen: parseFloat(newValue),
	});
}

onControlThermostat = (mode: string, temp: number, requestedState: number) => {
	const { device, deviceSetStateThermostat } = this.props;

	const changeMode = mode !== device.stateValues.THERMOSTAT.mode ? 1 : 0;
	deviceSetStateThermostat(device.id, mode, temp, 0, changeMode, requestedState);
}

onPressRow = (controlType: string) => {
	let cMode = {};
	this.props.modes.map((mode: Object) => {
		if (mode.mode === controlType) {
			cMode = mode;
		}
	});
	const { mode, value, endColor, startColor, label, minVal, maxVal } = cMode;
	const initialAngleLength = getAngleLengthToInitiate(mode, value, this.props.modes);
	this.setState({
		controllingMode: controlType,
		angleLength: initialAngleLength,
		currentValueInScreen: parseFloat(value),
		baseColor: endColor,
		gradientColorFrom: startColor,
		gradientColorTo: endColor,
		title: label,
		minVal,
		maxVal,
	});
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
}

onEndSlide = () => {
	const {
		controllingMode,
		currentValueInScreen,
	} = this.state;
	this.onControlThermostat(controllingMode, currentValueInScreen, controllingMode === 'off' ? 2 : 1);
}

render(): Object {

	const {
		appLayout,
		modes,
		lastUpdated,
	} = this.props;

	const {
		cover,
		radius,
	} = this.getStyles();

	const {
		startAngle,
		angleLength,
		currentValueInScreen,
		controllingMode,
		baseColor,
		gradientColorFrom,
		gradientColorTo,
		title,
		minVal,
		maxVal,
		currentValue,
	} = this.state;

	const showSlider = typeof minVal === 'number' && typeof maxVal === 'number';

	return (
		<>
			<View style={cover}>
				{showSlider ? <CircularSlider
					startAngle={startAngle}
					maxAngleLength={HeatControlWheelModes.maxALength}
					angleLength={angleLength}
					onUpdate={this.onUpdate}
					segments={15}
					strokeWidth={20}
					radius={radius}
					gradientColorFrom={gradientColorFrom}
					gradientColorTo={gradientColorTo}
					bgCircleColor="#fff"
					knobStrokeColor="#fff"
					knobFillColor={gradientColorTo}
					keepArcVisible
					showStartKnob={false}
					roundedEnds
					allowKnobBeyondLimits={false}
					knobRadius={18}
					knobStrokeWidth={3}
					onReleaseStopKnob={this.onEndSlide}
					onPressOutSliderPath={this.onEndSlide}
				/>
					:
					null
				}
				<ControlInfoBlock
					appLayout={appLayout}
					baseColor={baseColor}
					currentValue={currentValue}
					currentValueInScreen={currentValueInScreen}
					title={title}
					lastUpdated={lastUpdated}
					showSlider={showSlider}
					onControlThermostat={this.onControlThermostat}
					controllingMode={controllingMode}
					minVal={minVal}
					maxVal={maxVal}
					onEditSubmitValue={this.onEditSubmitValue}
					updateCurrentValueInScreen={this.updateCurrentValueInScreen}
				/>
			</View>
			<ModesList
				appLayout={appLayout}
				onPressRow={this.onPressRow}
				controllingMode={controllingMode}
				modes={modes}
				onControlThermostat={this.onControlThermostat}
				onEditSubmitValue={this.onEditSubmitValue}
				currentValueInScreen={currentValueInScreen}
				updateCurrentValueInScreen={this.updateCurrentValueInScreen}/>
		</>
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
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		cover: {
			...shadow,
			flex: 0,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: '#fff',
			marginTop: padding,
			marginHorizontal: padding,
			padding: padding * 2,
		},
		radius: deviceWidth * 0.3,
	};
}
}

module.exports = HeatControlWheelModes;
