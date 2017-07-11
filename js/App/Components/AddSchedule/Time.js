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

import React, { PropTypes } from 'react';
import { Dimensions, DatePickerIOS, Platform } from 'react-native';
import { View } from 'BaseComponents';
import TimeType from './SubViews/TimeType';
import TimeSlider from './SubViews/TimeSlider';
import Theme from 'Theme';

const types = [
	{
		name: 'Sunrise',
		icon: 'sunrise',
	},
	{
		name: 'Sunset',
		icon: 'sunset',
	},
	{
		name: 'Time',
		icon: 'time',
	},
];

type Props = {
	navigation: Object,
	actions: Object,
	onDidMount: (string, string, ?Object) => void,
	width: number,
	paddingRight: number,
};

type State = {
	selectedTypeIndex: number | null,
	randomValue: number,
	offsetValue: number,
	date: Date,
};

class Time extends View {

	props: Props;
	state: State;

	getStyles: () => Object;
	selectType: (string) => void;
	renderTypes: (Array) => Array;
	setRandomIntervalValue: (number) => void;
	setTimeOffsetValue: (number) => void;

	constructor(props) {
		super(props);

		this.h1 = '3. Time';
		this.h2 = 'Choose a time for the action';
		this.infoButton = {
			tmp: true, // TODO: fill with real fields
		};

		const date = new Date();
		date.setHours(12, 0, 0, 0);

		this.state = {
			selectedTypeIndex: null,
			randomValue: 0,
			offsetValue: 0,
			date,
		};
	}

	componentDidMount() {
		const { h1, h2, infoButton } = this;
		this.props.onDidMount(h1, h2, infoButton);
	}

	getStyles = () => {
		this.deviceWidth = Dimensions.get('window').width;

		return {
			container: {
				flex: 1,
				justifyContent: 'flex-start',
			},
			marginBottom: this.deviceWidth * 0.025333333,
			type: {
				container: {
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'flex-start',
				},
			},
			iosTimeContainer: {
				flexDirection: 'row',
				height: 140,
				alignItems: 'center',
				overflow: 'hidden',
			},
		};
	};

	selectType = typeIndex => {
		this.setState({ selectedTypeIndex: typeIndex });
	};

	renderTypes = types => {
		const { selectedTypeIndex } = this.state;

		return types.map((type, i) => {
			const isSelected = typeof selectedTypeIndex === 'number' && i === selectedTypeIndex;

			return (
				<TimeType
					type={type}
					index={i}
					isSelected={isSelected}
					select={this.selectType}
					key={type.name}
				/>
			);
		});
	};

	setRandomIntervalValue = randomValue => {
		if (randomValue !== this.state.randomValue) {
			this.setState({ randomValue });
		}
	};

	setTimeOffsetValue = offsetValue => {
		if (offsetValue !== this.state.offsetValue) {
			this.setState({ offsetValue });
		}
	};

	onDateChange = date => {
		const hourValue = this.state.date.getHours();
		const minuteValue = this.state.date.getMinutes();

		const newHourValue = date.getHours();
		const newMinuteValue = date.getMinutes();

		if (newHourValue !== hourValue || newMinuteValue !== minuteValue) {
			this.setState({ date });
		}
	};

	renderTimeRow = selectedTypeIndex => {
		const { marginBottom, iosTimeContainer } = this.getStyles();

		let timePicker;

		if (Platform.OS === 'ios') {
			timePicker = (
				<View style={iosTimeContainer}>
					<DatePickerIOS
						date={this.state.date}
						mode="time"
						style={{ flex: 1 }}
						onDateChange={this.onDateChange}
					/>
				</View>
			);
		} else {
			timePicker = (
				<View/>
			);
		}

		const timeSlider = (
			<TimeSlider
				description="Offset the time between -1439 to +1439 minutes"
				icon="offset"
				minimumValue={-1439}
				maximumValue={1439}
				value={0}
				onValueChange={this.setTimeOffsetValue}
			/>
		);

		return (
			<View style={[Theme.Styles.scheduleRow, { marginBottom }]}>
				{selectedTypeIndex === 2 ? timePicker : timeSlider}
			</View>
		);
	};

	render() {
		const { selectedTypeIndex } = this.state;
		const { container, marginBottom, type } = this.getStyles();

		return (
			<View style={container}>
				<View style={[type.container, { marginBottom }]}>
					{this.renderTypes(types)}
				</View>
				{selectedTypeIndex !== null && this.renderTimeRow(selectedTypeIndex)}
				{selectedTypeIndex !== null && (
					<TimeSlider
						description="Set random intervals between 1 to 1446 minutes"
						icon="random"
						minimumValue={0}
						maximumValue={1446}
						onValueChange={this.setRandomIntervalValue}
					/>
				)}
			</View>
		);
	}
}

Time.propTypes = {
	navigation: PropTypes.object,
	actions: PropTypes.object,
	onDidMount: PropTypes.func,
	width: PropTypes.number,
	paddingRight: PropTypes.number,
};

module.exports = Time;
