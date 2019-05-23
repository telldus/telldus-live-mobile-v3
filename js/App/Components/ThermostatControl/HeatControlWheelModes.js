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
import CircularSlider from 'react-native-circular-slider';

import {
	View,
} from '../../../BaseComponents';
import ModesList from './ModesList';
import ControlInfoBlock from './ControlInfoBlock';

import Theme from '../../Theme';

type Props = {
	appLayout: Object,
	modes: Array<Object>,
};

type State = {
    angleLength: number,
	startAngle: number,
	currentValue: number,
	controlSelection: 'heat' | 'cool' | 'heat-cool' | 'off',
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

	const { modes } = this.props;

	const { temp } = this.getValueFromAngle(this.maxALength, modes[0].type);
	this.state = {
		startAngle: Math.PI * 1.25,
		angleLength: this.maxALength,
		currentValue: temp,
		controlSelection: modes[0].type,
	};
}

getValueFromAngle = (angleLength: number, type: string): Object => {
	const angleRange = this.maxALength - this.minALength;
	const relativeCurrentAngleLen = angleLength - this.minALength;
	const percentageCurrentAngleLen = relativeCurrentAngleLen * 100 / angleRange;

	let cMode = {};
	this.props.modes.map((mode: Object) => {
		if (mode.type === type) {
			cMode = mode;
		}
	});
	const { maxVal, minVal } = cMode;

	const valueRange = maxVal - minVal;
	const relativeValue = valueRange * percentageCurrentAngleLen / 100;

	// When knob is at start/Zero we have max angle length, So that doing "maxVal - relativeValue", else "minVal + relativeValue" would be the way to go.
	return {temp: Math.round(maxVal - relativeValue)};
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
	this.setState({
		controlSelection: controlType,
	});
}

render(): Object {

	const {
		appLayout,
		modes,
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
	} = this.state;

	let baseColor = modes[0].endColor;
	let gradientColorFrom = modes[0].startColor;
	let gradientColorTo = modes[0].endColor;
	let title = modes[0].label;
	if (controlSelection === 'cool') {
		baseColor = modes[1].endColor;
		gradientColorFrom = modes[1].startColor;
		gradientColorTo = modes[1].endColor;
		title = modes[1].label;
	} else if (controlSelection === 'heat-cool') {
		baseColor = modes[2].endColor;
		gradientColorFrom = modes[2].startColor;
		gradientColorTo = modes[2].endColor;
		title = modes[2].label;
	} else if (controlSelection === 'off') {
		baseColor = modes[3].endColor;
		gradientColorFrom = modes[3].startColor;
		gradientColorTo = modes[3].endColor;
		title = modes[3].label;
	}

	return (
		<>
			<View style={cover}>
				<CircularSlider
					startAngle={startAngle}
					angleLength={angleLength}
					onUpdate={this.onUpdate}
					segments={15}
					strokeWidth={20}
					radius={radius}
					gradientColorFrom={gradientColorFrom}
					gradientColorTo={gradientColorTo}
					bgCircleColor="#fff"
					startKnobStrokeColor="#fff"
					startKnobFillColor={gradientColorTo}
					keepArcVisible
					showStopKnob={false}
					roundedEnds
					allowKnobBeyondLimits={false}
					knobRadius={18}
					knobStrokeWidth={3}
				/>
				<ControlInfoBlock
					appLayout={appLayout}
					baseColor={baseColor}
					currentValue={currentValue}
					title={title}
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
