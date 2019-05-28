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
};

type State = {
    angleLength: number,
	startAngle: number,
	currentValue: number,
	controlSelection: 'heat' | 'cool' | 'heat-cool' | 'off',
	baseColor: string,
	gradientColorFrom: string,
	gradientColorTo: string,
	title: string,
	maxVal: number,
	minVal: number,
};

class HeatControlWheelModes extends View<Props, State> {
props: Props;
state: State;

onUpdate: (Object) => void;
onPressRow: (string) => void;
getValueFromAngle: (number, string) => Object;

constructor(props: Props) {
	super(props);

	this.onUpdate = this.onUpdate.bind(this);
	this.onPressRow = this.onPressRow.bind(this);
	this.getValueFromAngle = this.getValueFromAngle.bind(this);

	this.maxALength = Math.PI * 1.5;
	this.minALength = 0;
	this.initialAngle = Math.PI * 1.25;

	this.step = 0.5;

	const { modes } = this.props;

	const currentValue = modes[0].value;
	const minVal = modes[0].minVal;
	const maxVal = modes[0].maxVal;
	const initialAngleLength = this.getAngleLengthToInitiate(modes[0].mode, currentValue);
	this.state = {
		startAngle: this.initialAngle,
		angleLength: initialAngleLength,
		currentValue,
		controlSelection: modes[0].mode,
		baseColor: modes[0].endColor,
		gradientColorFrom: modes[0].startColor,
		gradientColorTo: modes[0].endColor,
		title: modes[0].label,
		minVal,
		maxVal,
	};
}

getValueFromAngle = (angleLength: number, currMode: string): Object => {
	const angleRange = this.maxALength - this.minALength;
	const relativeCurrentAngleLen = angleLength - this.minALength;
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
	const temp2 = temp1 + this.step;

	const d1 = Math.abs(temp1 - t);
	const d2 = Math.abs(temp2 - t);

	const nearest = Math.min(d1, d2);
	let temp = temp1;
	if (nearest === d2) {
		temp = temp2;
	}
	return {temp: temp};
}

getAngleLengthToInitiate(currMode: string, currentValue: number): number {
	let cMode = {};
	this.props.modes.map((mode: Object) => {
		if (mode.mode === currMode) {
			cMode = mode;
		}
	});
	const { maxVal, minVal } = cMode;
	const valueRange = maxVal - minVal;
	const relativeValue = currentValue - minVal;
	const percentageRelativeValue = relativeValue * 100 / valueRange;

	const angleLenRange = this.maxALength - this.minALength;
	const relativeAngle = angleLenRange * percentageRelativeValue / 100;

	const currentAngleLen = this.minALength + relativeAngle;

	return	currentAngleLen;
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return true;
}

onUpdate = (data: Object) => {
	const {startAngle, angleLength} = data;
	const { temp } = this.getValueFromAngle(angleLength, this.state.controlSelection);

	this.setState({
		angleLength,
		startAngle,
		currentValue: temp,
	});
}

onPressRow = (controlType: string) => {
	let cMode = {};
	this.props.modes.map((mode: Object) => {
		if (mode.mode === controlType) {
			cMode = mode;
		}
	});
	const { mode, value, endColor, startColor, label, minVal, maxVal } = cMode;
	const initialAngleLength = this.getAngleLengthToInitiate(mode, value);
	this.setState({
		controlSelection: controlType,
		angleLength: initialAngleLength,
		currentValue: value,
		baseColor: endColor,
		gradientColorFrom: startColor,
		gradientColorTo: endColor,
		title: label,
		minVal,
		maxVal,
	});
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
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
		currentValue,
		controlSelection,
		baseColor,
		gradientColorFrom,
		gradientColorTo,
		title,
		minVal,
		maxVal,
	} = this.state;

	const showSlider = typeof minVal === 'number' && typeof maxVal === 'number';

	return (
		<>
			<View style={cover}>
				{showSlider ? <CircularSlider
					startAngle={startAngle}
					maxAngleLength={this.maxALength}
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
				/>
					:
					null
				}
				<ControlInfoBlock
					appLayout={appLayout}
					baseColor={baseColor}
					currentValue={currentValue}
					title={title}
					lastUpdated={lastUpdated}
					showSlider={showSlider}
				/>
			</View>
			<ModesList
				appLayout={appLayout}
				onPressRow={this.onPressRow}
				controlSelection={controlSelection}
				modes={modes}/>
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
