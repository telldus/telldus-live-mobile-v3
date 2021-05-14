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

import {
	View,
	InfoBlock,
	EmptyView,
	ThemedMaterialIcon,
} from '../../../BaseComponents';
import ModesList from './ModesList';
import ControlInfoBlock from './ControlInfoBlock';

import {
	withTheme,
	PropsThemedComponent,
} from '../HOC/withTheme';
import {
	LayoutAnimations,
	getNextSetPoint,
} from '../../Lib';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

type Props = PropsThemedComponent & {
	appLayout: Object,
	modes: Array<Object>,
	device: Object,
	lastUpdated: number,
	mode: string,
	currentTemp: string,
	supportResume: boolean,
	gatewayTimezone: string,
	source?: string,
	activeMode?: string,
	hideTemperatureControl?: boolean,
	hideModeControl?: boolean,
	timeoutPlusMinus?: number,
	gradientColorFromOverride?: string,
	gradientColorToOverride?: string,
	shouldHaveMode: boolean,
	actionsQueueThermostat: Object,

	intl: Object,
	modesCoverStyle: Array<any> | Object,
	deviceSetStateThermostat: (deviceId: number, mode: string, temperature?: number, scale?: 0 | 1, changeMode?: 0 | 1, requestedState: number) => Promise<any>,
};

type State = {
    angleLength: number,
	startAngle: number,
	currentValue: number,
	controllingMode: string,
	baseColor?: string,
	gradientColorFrom?: string,
	gradientColorTo?: string,
	title: string,
	maxVal: number,
	minVal: number,
	currentValueInScreen: number,
	methodRequested: string,
	changeMode: 0 | 1,
	activeModeLocal: string,
	setpointMode: string,
	setpointValue: string,
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

const getModeAttributes = (cMode: Object, {
	dark,
	key,
}: Object): Object => {
	const {
		colors = {},
		label,
		minVal,
		maxVal,
	} = cMode;
	const gradientColorFrom = colors[key] ? dark ? colors[key].startColorD : colors[key].startColor : undefined;
	const gradientColorTo = colors[key] ? dark ? colors[key].endColorD : colors[key].endColor : undefined;
	return {
		baseColor: gradientColorTo,
		gradientColorFrom,
		gradientColorTo,
		title: label,
		minVal,
		maxVal,
	};
};

class HeatControlWheelModes extends View<Props, State> {
props: Props;
state: State;

onUpdate: (Object) => void;
onPressRow: (string, 0 | 1) => void;
getValueFromAngle: (number, string) => Object;

static getDerivedStateFromProps(props: Object, state: Object): Object | null {
	const { controllingMode, setpointMode, preventReset } = state;
	const { device: {
		methodRequested,
		actionsQueueThermostat = {},
	}, activeMode, dark, selectedThemeSet = {} } = props;
	const {
		key = 2,
	} = selectedThemeSet;

	let newValue = state.currentValue, newSetPointValue = state.setpointValueLocal, newModeAttributes = {};
	props.modes.map((modeInfo: Object) => {
		if (modeInfo.mode === controllingMode) {
			newValue = modeInfo.value;
			newModeAttributes = getModeAttributes(modeInfo, {
				dark,
				key,
			});
		}
		if (modeInfo.mode === setpointMode) {
			newSetPointValue = modeInfo.value;
		}
	});
	let newState = {};
	if (newValue !== state.currentValue) {
		newState = {
			...newState,
			...newModeAttributes,
			currentValue: newValue,
			currentValueInScreen: newValue,
			methodRequested,
			angleLength: getAngleLengthToInitiate(state.controllingMode, newValue, props.modes),
		};
	}
	if (methodRequested === '' && state.methodRequested !== '' && parseFloat(state.currentValueInScreen) !== parseFloat(newValue)) {
		const itemInQueue = actionsQueueThermostat[activeMode];
		const actionQueuedOnWakeup = !!itemInQueue;
		const currentValueInScreen = (actionQueuedOnWakeup && itemInQueue.queue !== undefined) ? parseFloat(itemInQueue.queue) : newValue;

		newState = {
			...newState,
			...newModeAttributes,
			currentValue: newValue,
			currentValueInScreen: currentValueInScreen,
			methodRequested,
			angleLength: getAngleLengthToInitiate(state.controllingMode, currentValueInScreen, props.modes),
		};
	}

	if (newSetPointValue !== state.setpointValueLocal && !preventReset) {
		newState = {
			...newState,
			setpointValueLocal: newSetPointValue,
			setpointValue: newSetPointValue,
			methodRequested,
		};
	}
	if (methodRequested === '' && state.methodRequested !== '' && parseFloat(state.setpointValue) !== parseFloat(newSetPointValue) && !preventReset) {
		newState = {
			...newState,
			setpointValueLocal: newSetPointValue,
			setpointValue: newSetPointValue,
			methodRequested,
		};
	}

	if (activeMode !== state.activeModeLocal) {
		props.modes.map((modeInfo: Object) => {
			if (modeInfo.mode === activeMode) {
				newValue = modeInfo.value;
				newModeAttributes = getModeAttributes(modeInfo, {
					dark,
					key,
				});
			}
		});
		newState = {
			...newState,
			...newModeAttributes,
			currentValue: newValue,
			currentValueInScreen: newValue,
			activeModeLocal: activeMode,
			controllingMode: activeMode,
			angleLength: getAngleLengthToInitiate(activeMode, newValue, props.modes),
			methodRequested,
		};
	}
	if (methodRequested === '' && state.methodRequested !== '' && state.controllingMode !== activeMode) {
		props.modes.map((modeInfo: Object) => {
			if (modeInfo.mode === activeMode) {
				newValue = modeInfo.value;
				newModeAttributes = getModeAttributes(modeInfo, {
					dark,
					key,
				});
			}
		});

		newState = {
			...newState,
			...newModeAttributes,
			currentValue: newValue,
			currentValueInScreen: newValue,
			activeModeLocal: activeMode,
			controllingMode: activeMode,
			angleLength: getAngleLengthToInitiate(activeMode, newValue, props.modes),
			methodRequested,
		};
	}
	if (methodRequested !== '' && state.methodRequested === '') {
		return {
			methodRequested,
		};
	}
	return Object.keys(newState).length > 0 ? newState : null;
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

	let {
		modes,
		device,
		dark,
		selectedThemeSet = {},
	} = this.props;
	const {
		key = 2,
	} = selectedThemeSet;
	const {
		stateValues: {THERMOSTAT = {}},
		methodRequested,
		actionsQueueThermostat = {},
	} = device;
	const { mode } = THERMOSTAT;

	modes = modes && modes.length > 0 ? modes : [{}];
	let cModeInfo = modes[0];
	modes.map((modeInfo: Object) => {
		if (modeInfo.mode === mode) {
			cModeInfo = modeInfo;
		}
	});

	const {
		colors = {},
	} = cModeInfo || {};

	const currentValue = cModeInfo.value;
	const itemInQueue = actionsQueueThermostat[cModeInfo.mode];
	const actionQueuedOnWakeup = !!itemInQueue;
	const currentValueInScreen = (actionQueuedOnWakeup && itemInQueue.queue !== undefined) ? parseFloat(itemInQueue.queue) : currentValue;
	const minVal = cModeInfo.minVal;
	const maxVal = cModeInfo.maxVal;
	let initialAngleLength = 0;
	if (modes && modes.length > 0) {
		initialAngleLength = getAngleLengthToInitiate(cModeInfo.mode, currentValueInScreen, this.props.modes);
	}

	const gradientColorFrom = colors[key] ? dark ? colors[key].startColorD : colors[key].startColor : undefined;
	const gradientColorTo = colors[key] ? dark ? colors[key].endColorD : colors[key].endColor : undefined;

	this.state = {
		startAngle: this.initialAngle,
		angleLength: initialAngleLength,
		currentValue,
		currentValueInScreen: currentValueInScreen,
		controllingMode: cModeInfo.mode,
		baseColor: gradientColorTo,
		gradientColorFrom,
		gradientColorTo,
		title: cModeInfo.label,
		minVal,
		maxVal,
		methodRequested,
		changeMode: 1,
		activeModeLocal: cModeInfo.mode,
		setpointMode: cModeInfo.mode,
		setpointValue: currentValue,
		setpointValueLocal: !isNaN(currentValueInScreen) ? currentValueInScreen.toString() : currentValue,
		preventReset: false,
	};

	this.submitTimeout = null;
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
		setpointValue: temp,
	});
}

onEditSubmitValue = (newValue: number, setpointValue?: number) => {
	const { controllingMode, changeMode } = this.state;
	const angleLength = getAngleLengthToInitiate(controllingMode, newValue, this.props.modes);
	this.setState({
		angleLength: changeMode ? angleLength : this.state.angleLength,
		currentValueInScreen: changeMode ? newValue.toString() : this.state.currentValueInScreen,
		setpointValue: typeof setpointValue === 'undefined' ? this.state.setpointValue : setpointValue.toString(),
	});
}

onControlThermostat = (mode: string, temp: number, changeMode: 1 | 0, requestedState: number): Promise<any> => {
	const { device, deviceSetStateThermostat } = this.props;
	return deviceSetStateThermostat(device.id, mode, temp, 0, changeMode, requestedState);
}

onPressRow = (controlType: string, changeMode: 0 | 1, callback: Function) => {
	let cMode = {}, sPointValue;
	const { modes, dark, selectedThemeSet = {} } = this.props;
	const {
		activeModeLocal,
	} = this.state;
	const {
		key = 2,
	} = selectedThemeSet;
	let controllingMode = !changeMode && activeModeLocal ? activeModeLocal : controlType;
	modes.map((mode: Object) => {
		if (mode.mode === controllingMode) {
			cMode = mode;
		}
		if (mode.mode === controlType) {
			sPointValue = mode.value;
		}
	});
	const {
		mode,
		value,
		colors = {},
		label,
		minVal,
		maxVal,
	} = cMode;
	if (!mode) {
		return;
	}
	const initialAngleLength = getAngleLengthToInitiate(mode, value, modes);

	const gradientColorFrom = colors[key] ? dark ? colors[key].startColorD : colors[key].startColor : undefined;
	const gradientColorTo = colors[key] ? dark ? colors[key].endColorD : colors[key].endColor : undefined;

	this.setState({
		controllingMode,
		angleLength: initialAngleLength,
		currentValueInScreen: value,
		baseColor: gradientColorTo,
		gradientColorFrom,
		gradientColorTo,
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
	LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
}

onEndSlide = () => {
	const {
		controllingMode,
		currentValueInScreen,
	} = this.state;
	this.onControlThermostat(controllingMode, currentValueInScreen, 1, controllingMode === 'off' ? 2 : 1);
}

onPressSliderPath = (data: Object) => {
	if (!this.hasValidMinMax()) {
		return;
	}
	const {startAngle, angleLength} = data;
	const { temp } = this.getValueFromAngle(angleLength, this.state.controllingMode);
	this.setState({
		angleLength,
		startAngle,
		currentValueInScreen: temp,
		setpointValue: temp,
	}, () => {
		this.onEndSlide();
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
	this.handleAddMinus(controllingMode, 1, nextValue);
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
	this.handleAddMinus(controllingMode, 1, nextValue);
}

handleAddMinus = (mode: string, changeMode: 0 | 1, nextValue: number) => {
	const { timeoutPlusMinus } = this.props;

	this.onPressRow(mode, changeMode, () => {
		this.updateCurrentValueInScreen(nextValue.toString(), nextValue.toString());
		this.onEditSubmitValue(parseFloat(nextValue), parseFloat(nextValue));
		if (this.submitTimeout) {
			clearTimeout(this.submitTimeout);
		}
		this.submitTimeout = setTimeout(() => {
			this.onControlThermostat(mode, nextValue, changeMode, mode === 'off' ? 2 : 1);
		}, timeoutPlusMinus);
	});
}

noOP = () => {
}

hasValidMinMax = (): boolean => {
	const {
		minVal,
		maxVal,
	} = this.state;
	return typeof minVal === 'number' && typeof maxVal === 'number';
}

render(): Object | null {

	const {
		appLayout,
		modes,
		lastUpdated,
		modesCoverStyle,
		currentTemp,
		supportResume,
		gatewayTimezone,
		intl,
		activeMode,
		hideTemperatureControl = false,
		hideModeControl = false,
		gradientColorToOverride,
		gradientColorFromOverride,
		source,
		shouldHaveMode,
		actionsQueueThermostat = {},
	} = this.props;

	const {
		cover,
		radius,
		addStyle,
		removeStyle,
		iconSize,
		iconCommon,
		coverStyle,
		knobRadius,
		knobStrokeWidth,
		strokeWidth,
		segments,
		infoContainerStyle,
		infoContainer,
		infoTextStyle,
	} = this.getStyles();

	const hasModes = modes && modes.length > 0;

	if (shouldHaveMode && (!modes || modes.length === 0)) {
		return <InfoBlock
			text={`${intl.formatMessage(i18n.noThermostatSettings)}.`}
			appLayout={appLayout}
			infoContainer={infoContainerStyle}/>;
	}

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
		setpointValueLocal,
	} = this.state;

	let startAngleF = this.initialAngle, angleLengthF = 100;
	const hasValidMinMax = this.hasValidMinMax();
	if (hasValidMinMax && !isNaN(angleLength) && !isNaN(startAngle)) {
		startAngleF = startAngle;
		angleLengthF = angleLength;
	}

	const showCircularSlider = typeof startAngleF === 'number' && typeof angleLengthF === 'number';

	const showControlIcons = controllingMode !== 'off' && controllingMode !== 'fan' && currentValue !== null && typeof currentValue !== 'undefined';

	const SVGKey = hasValidMinMax ? `${controllingMode}8` : `${controllingMode}88`;

	const titleInfoBlock = (activeMode && title) ? title : (shouldHaveMode ? `${intl.formatMessage(i18n.mode)} N/A` : '');

	return (
		<>
			{(shouldHaveMode && typeof activeMode !== 'string') ? <InfoBlock
				text={intl.formatMessage(i18n.infoNoThermostatMode)}
				appLayout={appLayout}
				infoContainer={infoContainer}
				textStyle={infoTextStyle}/>
				:
				<EmptyView/>
			}
			{!hideTemperatureControl ?
				<View
					level={2}
					style={cover}>
					{showControlIcons ?
						<TouchableOpacity style={[iconCommon, removeStyle]} onPress={this.onMinus}>
							<ThemedMaterialIcon
								name="remove"
								level={23}
								size={iconSize}/>
						</TouchableOpacity>
						:
						<EmptyView/>
					}
					{showCircularSlider ?
						<CircularSlider
							SVGKey={SVGKey}
							coverStyle={coverStyle}
							startAngle={startAngleF}
							maxAngleLength={HeatControlWheelModes.maxALength}
							angleLength={angleLengthF}
							onUpdate={hasValidMinMax ? this.onUpdate : this.noOP}
							segments={segments}
							strokeWidth={strokeWidth}
							radius={radius}
							gradientColorFrom={gradientColorFromOverride || gradientColorFrom}
							gradientColorTo={gradientColorToOverride || gradientColorTo}
							bgCircleColor="transparent"
							knobStrokeColor="#fff"
							knobFillColor={gradientColorToOverride || gradientColorTo}
							keepArcVisible
							showStartKnob={false}
							showStopKnob={hasValidMinMax}
							roundedEnds
							allowKnobBeyondLimits={false}
							knobRadius={knobRadius}
							knobStrokeWidth={knobStrokeWidth}
							onReleaseStopKnob={hasValidMinMax ? this.onEndSlide : null}
							onPressSliderPath={hasValidMinMax ? this.onPressSliderPath : null}
						/>
						:
						<View style={{
							height: radius * 2,
							width: radius * 2,
						}}/>
					}
					<ControlInfoBlock
						appLayout={appLayout}
						baseColor={baseColor}
						currentValue={currentValue}
						currentValueInScreen={currentValueInScreen}
						title={titleInfoBlock}
						lastUpdated={lastUpdated}
						onControlThermostat={this.onControlThermostat}
						controllingMode={controllingMode}
						minVal={minVal}
						maxVal={maxVal}
						onEditSubmitValue={this.onEditSubmitValue}
						updateCurrentValueInScreen={this.updateCurrentValueInScreen}
						changeMode={changeMode}
						currentTemp={currentTemp}
						supportResume={supportResume}
						gatewayTimezone={gatewayTimezone}
						hideModeControl={hideModeControl}
						actionsQueueThermostat={actionsQueueThermostat}
					/>
					{showControlIcons ?
						<TouchableOpacity style={[iconCommon, addStyle]} onPress={this.onAdd}>
							<ThemedMaterialIcon
								name="add"
								level={23}
								size={iconSize}/>
						</TouchableOpacity>
						:
						<EmptyView/>
					}
				</View>
				:
				<EmptyView/>
			}
			{(!hideModeControl && shouldHaveMode && hasModes) ?
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
					handleAddMinus={this.handleAddMinus}
					hideTemperatureControl={hideTemperatureControl || source === 'Schedule_ActionThermostat'}/>
				:
				<EmptyView/>
			}
		</>
	);
}

getStyles(): Object {
	const { appLayout, source = '', colors } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		rowTextColor,
		fontSizeFactorTen,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const iconSpace = padding;
	const iconSize = deviceWidth * 0.065;
	const iconCoverSize = iconSize * 1.2;
	const iconBorderRadi = iconCoverSize / 2;

	const radius = deviceWidth * 0.3;
	const knobRadius = 18;
	const knobStrokeWidth = 3;
	const strokeWidth = 20;
	const segments = 15;

	const padConst = padding / 2;

	const fontSizeText = deviceWidth * fontSizeFactorTen;

	return {
		segments,
		knobRadius,
		knobStrokeWidth,
		strokeWidth,
		infoContainerStyle: {
			flex: 0,
			marginHorizontal: padding,
			alignItems: 'center',
			justifyContent: 'center',
			width: width - (padding * 2),
			marginBottom: 0,
			marginTop: source === 'ThermostatFullControl' ? padding : 0,
		},
		cover: {
			...shadow,
			flex: 0,
			alignItems: 'center',
			justifyContent: 'center',
			marginTop: padding,
			marginHorizontal: padding,
			paddingHorizontal: padding * 2,
			paddingVertical: padConst,
		},
		coverStyle: {
			marginBottom: -((knobRadius - (strokeWidth / 2)) + knobStrokeWidth + (deviceWidth * 0.09)) + knobRadius + knobStrokeWidth,
		},
		radius,
		iconCommon: {
			backgroundColor: colors.viewInsideLevelTwoView,
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
		infoContainer: {
			flex: 0,
			marginHorizontal: padding,
			marginBottom: -(padding / 2),
			marginTop: source === 'ThermostatFullControl' ? padding : 0,
		},
		infoTextStyle: {
			color: rowTextColor,
			fontSize: fontSizeText,
		},
	};
}
}

HeatControlWheelModes.defaultProps = {
	timeoutPlusMinus: 2000,
};

module.exports = (withTheme(HeatControlWheelModes): Object);
