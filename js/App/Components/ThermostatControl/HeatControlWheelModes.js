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
import { LayoutAnimation, TouchableOpacity } from 'react-native';
import CircularSlider from 'react-native-circular-slider';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {
	View,
} from '../../../BaseComponents';
import ModesList from './ModesList';
import ControlInfoBlock from './ControlInfoBlock';

import {
	LayoutAnimations,
	getNextSetPoint,
} from '../../Lib';

import Theme from '../../Theme';

type Props = {
	appLayout: Object,
	modes: Array<Object>,
	device: Object,
	lastUpdated: number,
	mode: string,
	currentTemp: string,

	modesCoverStyle: number | Array<any> | Object,
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
	changeMode: 0 | 1,
	activeModeLocal: string,
	setpointMode: string,
	setpointValue: string,
	editState: Object,
	setpointValueLocal: string,
	preventReset: boolean,
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
onPressRow: (string, 0 | 1) => void;
getValueFromAngle: (number, string) => Object;


static getDerivedStateFromProps(props: Object, state: Object): Object | null {
	const { controllingMode, setpointMode, editState, preventReset } = state;
	const { device: { methodRequested }, activeMode } = props;

	let newValue = 0, newSetPointValue, isEditingSP = false, isEditingCV = false;
	props.modes.map((modeInfo: Object) => {
		if (modeInfo.mode === controllingMode) {
			newValue = modeInfo.value;
			if (editState[modeInfo.mode]) {
				isEditingCV = true;
			}
		}
		if (modeInfo.mode === setpointMode) {
			newSetPointValue = modeInfo.value;
			if (editState[modeInfo.mode]) {
				isEditingSP = true;
			}
		}
	});
	let newState = {};
	if (newValue !== state.currentValue && !isEditingCV) {
		newState = {
			...newState,
			currentValue: newValue,
			currentValueInScreen: newValue,
			methodRequested,
			angleLength: getAngleLengthToInitiate(state.controllingMode, newValue, props.modes),
		};
	}
	if (methodRequested === '' && state.methodRequested !== '' && parseFloat(state.currentValueInScreen) !== parseFloat(newValue) && !isEditingCV) {
		newState = {
			...newState,
			currentValue: newValue,
			currentValueInScreen: newValue,
			methodRequested,
			angleLength: getAngleLengthToInitiate(state.controllingMode, newValue, props.modes),
		};
	}

	if (newSetPointValue !== state.setpointValueLocal && !isEditingSP && !preventReset) {
		newState = {
			...newState,
			setpointValueLocal: newSetPointValue,
			setpointValue: newSetPointValue,
			methodRequested,
		};
	}
	if (methodRequested === '' && state.methodRequested !== '' && parseFloat(state.setpointValue) !== parseFloat(newSetPointValue) && !isEditingSP && !preventReset) {
		return {
			...newState,
			setpointValueLocal: newSetPointValue,
			setpointValue: newSetPointValue,
			methodRequested,
		};
	}

	if (activeMode !== state.activeModeLocal) {
		return {
			activeModeLocal: activeMode,
			controllingMode: activeMode,
			methodRequested,
		};
	}
	if (methodRequested === '' && state.methodRequested !== '' && state.controllingMode !== activeMode) {
		return {
			activeModeLocal: activeMode,
			controllingMode: activeMode,
			methodRequested,
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

	let { modes, device } = this.props;
	const { stateValues: {THERMOSTAT = {}}, methodRequested } = device;
	const { mode } = THERMOSTAT;

	modes = modes && modes.length > 0 ? modes : [{}];
	let cModeInfo = modes[0];
	modes.map((modeInfo: Object) => {
		if (modeInfo.mode === mode) {
			cModeInfo = modeInfo;
		}
	});

	const currentValue = cModeInfo.value;
	const minVal = cModeInfo.minVal;
	const maxVal = cModeInfo.maxVal;
	let initialAngleLength = 0;
	if (modes && modes.length > 0) {
		initialAngleLength = getAngleLengthToInitiate(cModeInfo.mode, currentValue, this.props.modes);
	}
	this.state = {
		startAngle: this.initialAngle,
		angleLength: initialAngleLength,
		currentValue,
		currentValueInScreen: currentValue,
		controllingMode: cModeInfo.mode,
		baseColor: cModeInfo.endColor,
		gradientColorFrom: cModeInfo.startColor,
		gradientColorTo: cModeInfo.endColor,
		title: cModeInfo.label,
		minVal,
		maxVal,
		methodRequested,
		changeMode: 1,
		activeModeLocal: cModeInfo.mode,
		setpointMode: cModeInfo.mode,
		setpointValue: currentValue,
		setpointValueLocal: currentValue,
		editState: {},
		preventReset: false,
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

updateCurrentValueInScreen = (currentValueInScreen: string, setpointValue?: string) => {
	const { changeMode } = this.state;
	this.setState({
		currentValueInScreen: changeMode ? currentValueInScreen : this.state.currentValueInScreen,
		setpointValue: typeof setpointValue === 'undefined' ? this.state.setpointValue : setpointValue,
	});
}

onUpdate = (data: Object) => {
	const {startAngle, angleLength} = data;
	const { temp } = this.getValueFromAngle(angleLength, this.state.controllingMode);
	this.setState({
		angleLength,
		startAngle,
		currentValueInScreen: temp,
	});
}

onEditSubmitValue = (newValue: number, setpointValue?: string) => {
	const { controllingMode, changeMode } = this.state;
	const angleLength = getAngleLengthToInitiate(controllingMode, newValue, this.props.modes);
	this.setState({
		angleLength: changeMode ? angleLength : this.state.angleLength,
		currentValueInScreen: changeMode ? newValue : this.state.currentValueInScreen,
		setpointValue: typeof setpointValue === 'undefined' ? this.state.setpointValue : setpointValue,
	});
}

onControlThermostat = (mode: string, temp: number, changeMode: 1 | 0, requestedState: number): Promise<any> => {
	const { device, deviceSetStateThermostat } = this.props;
	return deviceSetStateThermostat(device.id, mode, temp, 0, changeMode, requestedState);
}

onPressRow = (controlType: string, changeMode: 0 | 1, callback: Function) => {
	let cMode = {}, sPointValue;
	const { modes } = this.props;
	let controllingMode = changeMode ? controlType : this.state.activeModeLocal;
	modes.map((mode: Object) => {
		if (mode.mode === controllingMode) {
			cMode = mode;
		}
		if (mode.mode === controlType) {
			sPointValue = mode.value;
		}
	});
	const { mode, value, endColor, startColor, label, minVal, maxVal } = cMode;
	const initialAngleLength = getAngleLengthToInitiate(mode, value, modes);

	this.setState({
		controllingMode,
		angleLength: initialAngleLength,
		currentValueInScreen: value,
		baseColor: endColor,
		gradientColorFrom: startColor,
		gradientColorTo: endColor,
		title: label,
		minVal,
		maxVal,
		changeMode,
		setpointMode: controlType,
		setpointValue: sPointValue,
		setpointValueLocal: sPointValue,
	}, () => {
		if (callback) {
			callback();
		}
	});
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
}

onEndSlide = () => {
	const {
		controllingMode,
		currentValueInScreen,
	} = this.state;
	this.onControlThermostat(controllingMode, currentValueInScreen, 1, controllingMode === 'off' ? 2 : 1);
}

onPressOutSliderPath = (data: Object) => {
	const {startAngle, angleLength} = data;
	const { temp } = this.getValueFromAngle(angleLength, this.state.controllingMode);
	this.setState({
		angleLength,
		startAngle,
		currentValueInScreen: temp,
	}, () => {
		this.onEndSlide();
	});
}

toggleStateEditing = (editState: Object, preventReset: boolean) => {
	this.setState({
		editState,
		preventReset,
	});
}

onMinus = () => {
	const {
		currentValueInScreen,
		minVal,
		controllingMode,
	} = this.state;
	const nextValue = getNextSetPoint({
		value: currentValueInScreen,
		minVal,
	}, 'decrease');
	this.onPressRow(controllingMode, 1, () => {
		this.updateCurrentValueInScreen(nextValue.toString());
		this.onEditSubmitValue(parseFloat(nextValue));
		this.onControlThermostat(controllingMode, nextValue, 1, controllingMode === 'off' ? 2 : 1);
	});
}

onAdd = () => {
	const {
		currentValueInScreen,
		maxVal,
		controllingMode,
	} = this.state;
	const nextValue = getNextSetPoint({
		value: currentValueInScreen,
		maxVal,
	}, 'increase');
	this.onPressRow(controllingMode, 1, () => {
		this.updateCurrentValueInScreen(nextValue.toString());
		this.onEditSubmitValue(parseFloat(nextValue));
		this.onControlThermostat(controllingMode, nextValue, 1, controllingMode === 'off' ? 2 : 1);
	});
}

render(): Object | null {

	const {
		appLayout,
		modes,
		lastUpdated,
		modesCoverStyle,
		currentTemp,
	} = this.props;

	if (!modes || modes.length === 0) {
		return null;
	}

	const {
		cover,
		radius,
		addStyle,
		removeStyle,
		iconSize,
		iconCommon,
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
		changeMode,
		setpointMode,
		setpointValue,
		editState,
		setpointValueLocal,
	} = this.state;

	let startAngleF = this.initialAngle, angleLengthF = 100;
	const hasValidMinMax = typeof minVal === 'number' && typeof maxVal === 'number';
	if (hasValidMinMax) {
		startAngleF = startAngle;
		angleLengthF = angleLength;
	}

	const showControlIcons = controllingMode !== 'off' && controllingMode !== 'fan';

	return (
		<>
			<View style={cover}>
				{showControlIcons && <TouchableOpacity style={[iconCommon, removeStyle]} onPress={this.onMinus}>
					<MaterialIcons
						name="remove"
						color={Theme.Core.brandPrimary}
						size={iconSize}/>
				</TouchableOpacity>
				}
				<CircularSlider
					startAngle={startAngleF}
					maxAngleLength={HeatControlWheelModes.maxALength}
					angleLength={angleLengthF}
					onUpdate={hasValidMinMax ? this.onUpdate : null}
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
					showStopKnob={hasValidMinMax}
					roundedEnds
					allowKnobBeyondLimits={false}
					knobRadius={18}
					knobStrokeWidth={3}
					onReleaseStopKnob={hasValidMinMax ? this.onEndSlide : null}
					onPressOutSliderPath={hasValidMinMax ? this.onPressOutSliderPath : null}
				/>
				{showControlIcons && <TouchableOpacity style={[iconCommon, addStyle]} onPress={this.onAdd}>
					<MaterialIcons
						name="add"
						color={Theme.Core.brandSecondary}
						size={iconSize}/>
				</TouchableOpacity>
				}
				<ControlInfoBlock
					appLayout={appLayout}
					baseColor={baseColor}
					currentValue={currentValue}
					currentValueInScreen={currentValueInScreen}
					title={title}
					lastUpdated={lastUpdated}
					onControlThermostat={this.onControlThermostat}
					controllingMode={controllingMode}
					minVal={minVal}
					maxVal={maxVal}
					onEditSubmitValue={this.onEditSubmitValue}
					updateCurrentValueInScreen={this.updateCurrentValueInScreen}
					changeMode={changeMode}
					currentTemp={currentTemp}
				/>
			</View>
			<ModesList
				appLayout={appLayout}
				onPressRow={this.onPressRow}
				controllingMode={controllingMode}
				modes={modes}
				onControlThermostat={this.onControlThermostat}
				onEditSubmitValue={this.onEditSubmitValue}
				currentValue={currentValue}
				currentValueInScreen={currentValueInScreen}
				updateCurrentValueInScreen={this.updateCurrentValueInScreen}
				modesCoverStyle={modesCoverStyle}
				changeMode={changeMode}
				setpointMode={setpointMode}
				setpointValue={setpointValue}
				setpointValueLocal={setpointValueLocal}
				toggleStateEditing={this.toggleStateEditing}
				editState={editState}/>
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
		appBackground,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const iconSpace = padding;
	const iconSize = deviceWidth * 0.065;
	const iconCoverSize = iconSize * 1.2;
	const iconBorderRadi = iconCoverSize / 2;

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
		iconCommon: {
			backgroundColor: appBackground,
			height: iconCoverSize,
			width: iconCoverSize,
			borderRadius: iconBorderRadi,
			alignItems: 'center',
			justifyContent: 'center',
			position: 'absolute',
		},
		removeStyle: {
			left: iconSpace,
		},
		addStyle: {
			right: iconSpace,
		},
		iconSize,
	};
}
}

module.exports = HeatControlWheelModes;
