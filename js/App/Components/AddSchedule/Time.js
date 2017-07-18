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
import { DatePickerIOS, Platform, TimePickerAndroid, TouchableWithoutFeedback } from 'react-native';
import { FloatingButton, Text, View } from 'BaseComponents';
import { ScheduleProps } from './ScheduleScreen';
import TimeType from './SubViews/TimeType';
import TimeSlider from './SubViews/TimeSlider';
import Theme from 'Theme';
import getDeviceWidth from '../../Lib/getDeviceWidth';

const TYPES = ['sunrise', 'sunset', 'time'];

interface Props extends ScheduleProps {
	paddingRight: number,
}

type State = {
	selectedTypeIndex: number | null,
	randomInterval: number,
	offset: number,
	date: Date,
};

export default class Time extends View<null, Props, State> {

	selectTimeAndroid: Function;

	static propTypes = {
		navigation: PropTypes.object,
		actions: PropTypes.object,
		onDidMount: PropTypes.func,
		paddingRight: PropTypes.number,
	};

	constructor(props: Props) {
		super(props);

		this.h1 = '3. Time';
		this.h2 = 'Choose a time for the action';
		this.infoButton = {
			tmp: true, // TODO: fill with real fields
		};

		this.state = {
			selectedTypeIndex: null,
			randomInterval: 0,
			offset: 0,
			date: this._createDate(),
		};

		this.selectTimeAndroid = this.selectTimeAndroid.bind(this);
	}

	componentDidMount() {
		const { h1, h2, infoButton } = this;
		this.props.onDidMount(h1, h2, infoButton);
	}

	setRandomIntervalValue = (randomInterval: number) => {
		if (randomInterval !== this.state.randomInterval) {
			this.setState({ randomInterval });
		}
	};

	setTimeOffsetValue = (offset: number) => {
		if (offset !== this.state.offset) {
			this.setState({ offset });
		}
	};

	async selectTimeAndroid() {
		const { date } = this.state;

		try {
			const { action, hour, minute } = await TimePickerAndroid.open({
				hour: date.getHours(),
				minute: date.getMinutes(),
				is24Hour: true,
			});
			if (action !== TimePickerAndroid.dismissedAction) {
				const newDate = new Date();
				newDate.setHours(hour, minute, 0, 0);
				this.setState({ date: newDate });
			}
		} catch (error) {
			console.warn('Cannot open time picker', error.message);
		}
	}

	selectTime = () => {
		const { actions, navigation } = this.props;
		const { selectedTypeIndex, randomInterval, offset, date } = this.state;

		if (selectedTypeIndex === null) {
			return;
		}

		const time: {
			randomInterval: number,
			offset?: number,
			hour?: number,
			minute?: number,
		} = {
			randomInterval,
		};

		if (selectedTypeIndex < 2) {
			time.offset = offset;
		} else {
			time.hour = date.getHours();
			time.minute = date.getMinutes();
		}

		actions.selectTime(TYPES[selectedTypeIndex], time);
		navigation.navigate('Days');
	};

	render() {
		const { selectedTypeIndex, randomInterval } = this.state;
		const { container, marginBottom, type } = this._getStyle();

		const shouldRender = selectedTypeIndex !== null;

		return (
			<View style={container}>
				<View style={[type.container, { marginBottom }]}>
					{this._renderTypes(TYPES)}
				</View>
				{this._renderTimeRow()}
				{shouldRender && (
					<TimeSlider
						description="Set random intervals between 1 to 1446 minutes"
						icon="random"
						minimumValue={0}
						maximumValue={1446}
						value={randomInterval}
						onValueChange={this.setRandomIntervalValue}
					/>
				)}
				{shouldRender && (
					<FloatingButton
						onPress={this.selectTime}
						imageSource={require('./img/right-arrow-key.png')}
						iconSize={getDeviceWidth() * 0.041333333}
						paddingRight={this.props.paddingRight}
					/>
				)}
			</View>
		);
	}

	_renderTimeRow = (): Object | null => {
		const { selectedTypeIndex, offset } = this.state;

		if (selectedTypeIndex === null) {
			return null;
		}

		const { date } = this.state;
		const {
			marginBottom,
			iosTimeContainer,
			androidTimeContainer,
			androidTimeValueContainer,
			androidTimeValueWrapper,
			androidTimeValue,
			androidTimeValueCenterLine,
			androidTimeCaption,
		} = this._getStyle();

		let timePicker;

		if (Platform.OS === 'ios') {
			timePicker = (
				<View style={iosTimeContainer}>
					<DatePickerIOS
						date={date}
						mode="time"
						style={{ flex: 1 }}
						onDateChange={this._onDateChange}
					/>
				</View>
			);
		} else {
			timePicker = (
				<TouchableWithoutFeedback onPress={this.selectTimeAndroid}>
					<View style={androidTimeContainer}>
						<View style={androidTimeValueContainer}>
							<View
								style={[
									androidTimeValueWrapper,
									{
										marginRight: this.deviceWidth * 0.014666667,
									},
								]}

							>
								<View style={androidTimeValueCenterLine}/>
								<Text style={androidTimeValue}>
									{this._formatTime(date.getHours())}
								</Text>
							</View>
							<View style={androidTimeValueWrapper}>
								<View style={androidTimeValueCenterLine}/>
								<Text style={androidTimeValue}>
									{this._formatTime(date.getMinutes())}
								</Text>
							</View>
						</View>
						<Text style={androidTimeCaption}>
							Tap to change time
						</Text>
					</View>
				</TouchableWithoutFeedback>
			);
		}

		const timeSlider = (
			<TimeSlider
				description="Offset the time between -1439 to +1439 minutes"
				icon="offset"
				minimumValue={-1439}
				maximumValue={1439}
				value={offset}
				onValueChange={this.setTimeOffsetValue}
			/>
		);

		return (
			<View style={[Theme.Styles.scheduleRow, { marginBottom }]}>
				{selectedTypeIndex === 2 ? timePicker : timeSlider}
			</View>
		);
	};

	_onDateChange = (date: Date) => {
		const { date: oldDate } = this.state;

		const oldHours = oldDate.getHours();
		const oldMinutes = oldDate.getMinutes();

		const newHours = date.getHours();
		const newMinutes = date.getMinutes();

		if (newHours !== oldHours || newMinutes !== oldMinutes) {
			this.setState({ date });
		}
	};

	_formatTime = (value: number): string => {
		return (value < 10 ? '0' : '') + value;
	};

	_selectType = (typeIndex: number) => {
		this.setState({ selectedTypeIndex: typeIndex });
	};

	_renderTypes = (types: string[]): Object[] => {
		const { selectedTypeIndex } = this.state;

		return types.map((type: string, i: number): Object => {
			const isSelected = typeof selectedTypeIndex === 'number' && i === selectedTypeIndex;

			return (
				<TimeType
					type={type}
					index={i}
					isSelected={isSelected}
					select={this._selectType}
					key={type}
				/>
			);
		});
	};

	_createDate = (): Date => {
		const date = new Date();
		date.setHours(12, 0, 0, 0);
		return date;
	};

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();

		const androidTimeWidth = deviceWidth * 0.213333333;
		const androidTimeHeight = deviceWidth * 0.177333333;
		const androidTimeColor = Theme.Core.brandPrimary;

		return {
			container: {
				flex: 1,
				justifyContent: 'flex-start',
			},
			marginBottom: deviceWidth * 0.025333333,
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
			androidTimeContainer: {
				alignItems: 'center',
				justifyContent: 'flex-start',
				padding: deviceWidth * 0.032,
			},
			androidTimeValueContainer: {
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
				marginBottom: deviceWidth * 0.017333333,
			},
			androidTimeValueWrapper: {
				backgroundColor: androidTimeColor,
				borderRadius: 2,
				position: 'relative',
				alignItems: 'center',
				justifyContent: 'center',
				height: androidTimeHeight,
				width: androidTimeWidth,
			},
			androidTimeValue: {
				color: '#fff',
				fontSize: deviceWidth * 0.094666667,
			},
			androidTimeValueCenterLine: {
				backgroundColor: androidTimeColor,
				height: 1,
				width: androidTimeWidth,
				position: 'absolute',
				top: androidTimeHeight / 2,
				left: 0,
				zIndex: 10,
			},
			androidTimeCaption: {
				color: '#555555',
				fontSize: deviceWidth * 0.032,
			},
		};
	};

}
