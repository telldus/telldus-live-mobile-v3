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
	controlSelection: 'heat' | 'cool',
};

class HeatControlWheel extends View<Props, State> {
props: Props;
state: State;

onUpdate: (Object) => void;

constructor(props: Props) {
	super(props);

	this.onUpdate = this.onUpdate.bind(this);

	this.maxTemp = 50;
	this.minTemp = 10;

	this.maxALength = Math.PI * 1.5;
	this.minALength = 0;
	const { temp } = this.getTempFromAngle(this.maxALength);
	this.state = {
		startAngle: Math.PI * 1.25,
		angleLength: this.maxALength,
		currentValue: temp,
		controlSelection: 'heat',
	};

	this.modes = [
		{
			label: 'Heat',
			edit: true,
			icon: 'fire',
			value: 23.3,
			scale: 'Temperature',
			unit: '°C',
			active: true,
		},
		{
			label: 'Cool',
			edit: true,
			icon: 'fire',
			value: 21.2,
			scale: 'Temperature',
			unit: '°C',
			active: false,
		},
	];
}

getTempFromAngle(angleLength: number): Object {
	const angleRange = this.maxALength - this.minALength;
	const relativeCurrentAngleLen = angleLength - this.minALength;
	const percentageCurrentAngleLen = relativeCurrentAngleLen * 100 / angleRange;

	const tempRange = this.maxTemp - this.minTemp;
	const relativeTemp = tempRange * percentageCurrentAngleLen / 100;

	// When knob is at start/Zero we have max angle length, So that doing "this.maxTemp - relativeTemp", else "this.minTemp + relativeTemp" would be the way to go.
	return {temp: Math.round(this.maxTemp - relativeTemp)};
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return true;
}

onUpdate = (data: Object) => {
	const {startAngle, angleLength} = data;
	const { temp } = this.getTempFromAngle(angleLength);

	this.setState({
		angleLength,
		startAngle,
		currentValue: temp,
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
		brandSecondary,
		brandPrimary,
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
		const {
			label,
			icon,
			edit,
			value,
			scale,
			unit,
			active,
		} = mode;
		return (
			<ModeBlock
				appLayout={appLayout}
				label={label}
				edit={edit}
				icon={icon}
				value={value}
				scale={scale}
				unit={unit}
				active={active}/>
		);
	});

	let baseColor = brandSecondary;
	if (controlSelection === 'cool') {
		baseColor = brandPrimary;
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
					gradientColorFrom="#ffcf00"
					gradientColorTo="#ff9800"
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
				HEAT
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
