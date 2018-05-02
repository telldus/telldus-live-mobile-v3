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
import PropTypes from 'prop-types';
import { DatePickerIOS, Platform, TimePickerAndroid, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { defineMessages } from 'react-intl';

import { FloatingButton, Row, Text, View } from '../../../BaseComponents';
import { ScheduleProps } from './ScheduleScreen';
import { TimeBlock, TimeSlider } from './SubViews';
import { getHoursAndMinutes } from '../../Lib';
import Theme from '../../Theme';
import i18n from '../../Translations/common';

const messages = defineMessages({
	descriptionSliderOffset: {
		id: 'schedule.time.descriptionSliderOffset',
		defaultMessage: 'Offset the time between {startValue} to {endValue}',
		description: 'Info about choosing time offset for the schedule',
	},
	descriptionSliderInterval: {
		id: 'schedule.time.descriptionSliderInterval',
		defaultMessage: 'Set random intervals between {startValue} to {endValue}',
		description: 'Info about choosing random time interval for the schedule',
	},
	editTime: {
		id: 'schedule.time.editTime',
		defaultMessage: 'Tap to change time',
	},
	editTimeAccessible: {
		id: 'schedule.time.editTimeAccessible',
		defaultMessage: 'Double tap to change time',
	},
});

const TYPES = ['sunrise', 'sunset', 'time'];

interface Props extends ScheduleProps {
	paddingRight: number,
}

type State = {
	selectedType: string,
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
		schedule: PropTypes.object,
		paddingRight: PropTypes.number,
		isEditMode: PropTypes.func,
	};

	constructor(props: Props) {
		super(props);

		let { formatMessage } = this.props.intl;

		this.h1 = `3. ${formatMessage(i18n.time)}`;
		this.h2 = formatMessage(i18n.posterChooseTime);
		this.labelSliderInterval = formatMessage(messages.descriptionSliderInterval, {startValue: getHoursAndMinutes(1), endValue: getHoursAndMinutes(1440)});
		this.labelSliderOffset = formatMessage(messages.descriptionSliderOffset, {startValue: getHoursAndMinutes(-1439), endValue: getHoursAndMinutes(1439)});

		this.labelEditTime = formatMessage(messages.editTime);
		this.labelEditTimeAccessible = formatMessage(messages.editTimeAccessible);

		this.infoButton = {
			tmp: true, // TODO: fill with real fields
		};

		const { type, offset, randomInterval, hour, minute } = props.schedule;

		this.state = {
			selectedType: type,
			randomInterval,
			offset,
			date: this._createDate(hour, minute),
		};

		this.selectTimeAndroid = this.selectTimeAndroid.bind(this);
	}

	componentDidMount() {
		const { h1, h2, infoButton } = this;
		this.props.onDidMount(h1, h2, infoButton);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'Time';
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

	// eslint-disable-next-line flowtype/require-return-type
	selectTimeAndroid = async () => {
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
	};

	selectTime = () => {
		const { actions, navigation, isEditMode } = this.props;
		const { selectedType, randomInterval, offset, date } = this.state;

		if (!selectedType) {
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

		if (selectedType !== 'time') {
			time.offset = offset;
		} else {
			time.hour = date.getHours();
			time.minute = date.getMinutes();
		}

		actions.selectTime(selectedType, time);

		if (isEditMode()) {
			navigation.goBack();
		} else {
			navigation.navigate('Days');
		}
	};

	render(): React$Element<any> {
		const { appLayout } = this.props;
		const { selectedType, randomInterval } = this.state;
		const { container, row, marginBottom, type } = this._getStyle(appLayout);

		const shouldRender = !!selectedType;

		return (
			<ScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
				<View style={container}>
					<View style={[type.container, { marginBottom }]}>
						{this._renderTypes(TYPES)}
					</View>
					{this._renderTimeRow()}
					{shouldRender && (
						<Row containerStyle={row}>
							<TimeSlider
								description={this.labelSliderInterval}
								icon="random"
								minimumValue={0}
								maximumValue={1440}
								value={randomInterval}
								onValueChange={this.setRandomIntervalValue}
								appLayout={appLayout}
							/>
						</Row>
					)}
					{shouldRender && (
						<FloatingButton
							onPress={this.selectTime}
							imageSource={require('./img/right-arrow-key.png')}
							paddingRight={this.props.paddingRight - 2}
						/>
					)}
				</View>
			</ScrollView>
		);
	}

	_renderTimeRow = (): Object | null => {
		const { appLayout } = this.props;
		const { selectedType, offset } = this.state;

		if (!selectedType) {
			return null;
		}

		const { date } = this.state;
		const {
			row,
			iosTimeContainer,
			androidTimeContainer,
			androidTimeValueContainer,
			androidTimeValueWrapper,
			androidTimeValue,
			androidTimeValueCenterLine,
			androidTimeCaption,
			androidTimeMargin,
		} = this._getStyle(appLayout);

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
			let hours = this._formatTime(date.getHours());
			let minutes = this._formatTime(date.getMinutes());
			let accessibilityLabel = `${hours}:${minutes}, ${this.labelEditTimeAccessible}`;
			timePicker = (
				<TouchableWithoutFeedback onPress={this.selectTimeAndroid} accessibilityLabel={accessibilityLabel}>
					<View style={androidTimeContainer}>
						<View style={androidTimeValueContainer}>
							<View
								style={[
									androidTimeValueWrapper,
									androidTimeMargin,
								]}

							>
								<View style={androidTimeValueCenterLine}/>
								<Text style={androidTimeValue}>
									{hours}
								</Text>
							</View>
							<View style={androidTimeValueWrapper}>
								<View style={androidTimeValueCenterLine}/>
								<Text style={androidTimeValue}>
									{minutes}
								</Text>
							</View>
						</View>
						<Text style={androidTimeCaption}>
							{this.labelEditTime}
						</Text>
					</View>
				</TouchableWithoutFeedback>
			);
		}

		const timeSlider = (
			<TimeSlider
				description={this.labelSliderOffset}
				icon="offset"
				minimumValue={-1439}
				maximumValue={1439}
				value={offset}
				onValueChange={this.setTimeOffsetValue}
				appLayout={appLayout}
			/>
		);

		let resultRow: Object;

		if (selectedType === 'time') {
			resultRow = (
				<Row style={{ alignItems: 'center' }} containerStyle={row}>
					{timePicker}
				</Row>
			);
		} else {
			resultRow = (
				<Row containerStyle={row}>
					{timeSlider}
				</Row>
			);
		}

		return resultRow;
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

	_selectType = (row: Object) => {
		this.setState({ selectedType: row.type });
	};

	_renderTypes = (types: string[]): Object[] => {
		const { appLayout, intl } = this.props;
		const { selectedType } = this.state;

		return types.map((type: string): Object => {
			const isSelected = type === selectedType;

			return (
				<TimeBlock
					type={type}
					onPress={this._selectType}
					isSelected={isSelected}
					key={type}
					appLayout={appLayout}
					intl={intl}
				/>
			);
		});
	};

	_createDate = (hour: number, minute: number): Date => {
		const date = new Date();
		date.setHours(hour, minute, 0, 0);
		return date;
	};

	_getStyle = (appLayout: Object): Object => {
		const { brandPrimary, borderRadiusRow } = Theme.Core;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const androidTimeWidth = deviceWidth * 0.213333333;
		const androidTimeHeight = deviceWidth * 0.177333333;
		const androidTimeColor = brandPrimary;
		const marginBottom = deviceWidth * 0.025333333;

		return {
			container: {
				flex: 1,
				justifyContent: 'flex-start',
			},
			row: {
				marginBottom,
				height: null,
			},
			marginBottom,
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
				borderRadius: borderRadiusRow,
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
			androidTimeMargin: {
				marginRight: deviceWidth * 0.014666667,
			},
		};
	};

}
