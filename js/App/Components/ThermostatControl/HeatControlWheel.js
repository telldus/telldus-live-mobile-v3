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
	Text,
	IconTelldus,
} from '../../../BaseComponents';
import ModeBlock from './ModeBlock';

import Theme from '../../Theme';

type Props = {
	appLayout: Object,
};

type State = {
    angleLength: number,
	startAngle: number,
	currentValue: number,
	controlSelection: 'heat' | 'cool' | 'heat-cool' | 'off',
};

class HeatControlWheel extends View<Props, State> {
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

	this.modes = [
		{
			label: 'Heat',
			edit: true,
			icon: 'fire',
			value: 23.3,
			scale: 'Temperature',
			unit: '°C',
			startColor: '#FFB741',
			endColor: '#E26901',
			maxVal: 50,
			minVal: 10,
			type: 'heat',
		},
		{
			label: 'Cool',
			edit: true,
			icon: 'fire',
			value: 21.2,
			scale: 'Temperature',
			unit: '°C',
			startColor: '#23C4FA',
			endColor: '#015095',
			maxVal: 30,
			minVal: 0,
			type: 'cool',
		},
		{
			label: 'Heat-cool',
			edit: true,
			icon: 'fire',
			value: 23.3,
			scale: 'Temperature',
			unit: '°C',
			startColor: '#004D92',
			endColor: '#e26901',
			maxVal: 50,
			minVal: 0,
			type: 'heat-cool',
		},
		{
			label: 'Off',
			edit: false,
			icon: 'fire',
			value: null,
			scale: null,
			unit: null,
			startColor: '#cccccc',
			endColor: '#999999',
			maxVal: 50,
			minVal: 0,
			type: 'off',
		},
	];

	const { temp } = this.getValueFromAngle(this.maxALength, this.modes[0].type);
	this.state = {
		startAngle: Math.PI * 1.25,
		angleLength: this.maxALength,
		currentValue: temp,
		controlSelection: this.modes[0].type,
	};
}

getValueFromAngle = (angleLength: number, type: string): Object => {
	const angleRange = this.maxALength - this.minALength;
	const relativeCurrentAngleLen = angleLength - this.minALength;
	const percentageCurrentAngleLen = relativeCurrentAngleLen * 100 / angleRange;

	let cMode = {};
	this.modes.map((mode: Object) => {
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
	} = this.props;

	const {
		cover,
		radius,
		InfoCover,
		modeHeaderStyle,
		modesCover,
		infoTitleStyle,
		selectedInfoCoverStyle,
		sValueStyle,
		sUnitStyle,
		cLabelStyle,
		cValueStyle,
		lastUpdatedInfoStyle,
		cUnitStyle,
		iconSize,
	} = this.getStyles();

	const {
		startAngle,
		angleLength,
		currentValue,
		controlSelection,
	} = this.state;

	const modes = this.modes.map((mode: Object, i: number): Object => {
		let {
			label,
			icon,
			edit,
			value,
			scale,
			unit,
			type,
		} = mode;
		let active = false;
		if (controlSelection === type) {
			active = true;
		}
		return (
			<ModeBlock
				appLayout={appLayout}
				label={label}
				edit={edit}
				icon={icon}
				value={value}
				scale={scale}
				unit={unit}
				active={active}
				onPressRow={this.onPressRow}
				type={type}/>
		);
	});

	let baseColor = this.modes[0].endColor;
	let gradientColorFrom = this.modes[0].startColor;
	let gradientColorTo = this.modes[0].endColor;
	let title = this.modes[0].label;
	if (controlSelection === 'cool') {
		baseColor = this.modes[1].endColor;
		gradientColorFrom = this.modes[1].startColor;
		gradientColorTo = this.modes[1].endColor;
		title = this.modes[1].label;
	} else if (controlSelection === 'heat-cool') {
		baseColor = this.modes[2].endColor;
		gradientColorFrom = this.modes[2].startColor;
		gradientColorTo = this.modes[2].endColor;
		title = this.modes[2].label;
	} else if (controlSelection === 'off') {
		baseColor = this.modes[3].endColor;
		gradientColorFrom = this.modes[3].startColor;
		gradientColorTo = this.modes[3].endColor;
		title = this.modes[3].label;
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
					startKnobFillColor="transparent"
					keepArcVisible
					showStopKnob={false}
					roundedEnds
					allowKnobBeyondLimits={false}
					knobRadius={10}
				/>
				<View style={InfoCover}>
					<Text style={[infoTitleStyle, {
						color: baseColor,
					}]}>
						{title.toUpperCase()}
					</Text>
					<View style={selectedInfoCoverStyle}>
						<IconTelldus icon="temperature" size={iconSize} color={baseColor}/>
						<Text style={{ textAlignVertical: 'center' }}>
							<Text style={[sValueStyle, {
								color: baseColor,
							}]}>
								{currentValue}
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
					</View>
					<Text style={cLabelStyle}>
						Current temperature
					</Text>
					<Text>
						<Text style={cValueStyle}>
							23.3
						</Text>
						<Text style={cUnitStyle}>
							°C
						</Text>
					</Text>
					<Text style={lastUpdatedInfoStyle}>
						Last updated info
					</Text>
				</View>
			</View>
			<View style={modesCover}>
				<Text style={modeHeaderStyle}>
					Modes
				</Text>
				{modes}
			</View>
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
		rowTextColor,
		brandSecondary,
		brandPrimary,
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
		modesCover: {
			marginVertical: padding,
		},
		InfoCover: {
			position: 'absolute',
			top: 0,
			left: 0,
			bottom: 0,
			right: 0,
			alignItems: 'center',
			justifyContent: 'center',
		},
		modeHeaderStyle: {
			marginLeft: padding,
			fontSize: deviceWidth * 0.04,
			color: rowTextColor,
		},
		brandSecondary,
		brandPrimary,
		rowTextColor,
		infoTitleStyle: {
			fontSize: deviceWidth * 0.045,
		},
		selectedInfoCoverStyle: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			left: -(deviceWidth * 0.025),
		},
		sValueStyle: {
			fontSize: deviceWidth * 0.15,
			left: -(deviceWidth * 0.025),
		},
		sUnitStyle: {
			fontSize: deviceWidth * 0.08,
		},
		cLabelStyle: {
			fontSize: deviceWidth * 0.04,
			color: rowTextColor,
			marginTop: 10,
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
			fontSize: deviceWidth * 0.03,
			color: rowTextColor,
		},
		iconSize: deviceWidth * 0.14,
	};
}
}

module.exports = HeatControlWheel;
