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
import {
	Platform,
	TouchableWithoutFeedback,
	ScrollView,
	LayoutAnimation,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { FloatingButton, Row, Text, View } from '../../../BaseComponents';
import { ScheduleProps } from './ScheduleScreen';
import { TimeBlock, TimeSlider } from './SubViews';
import { LayoutAnimations } from '../../Lib';
import Theme from '../../Theme';
import i18n from '../../Translations/common';

import {
	withTheme,
	PropsThemedComponent,
} from '../HOC/withTheme';

const TYPES = ['sunrise', 'sunset', 'time'];

interface Props extends ScheduleProps {
	paddingRight: number,
}

type State = {
	selectedType: string,
	randomInterval: number,
	offset: number,
	date: Date,
	offsetEdit: boolean,
	intervalEdit: boolean,
	shouldRenderTimePickerAndroid: boolean,
};

class Time extends View<null, Props & PropsThemedComponent, State> {

	selectTimeAndroid: Function;
	toggleEdit: (string) => void;

	static propTypes = {
		navigation: PropTypes.object,
		actions: PropTypes.object,
		onDidMount: PropTypes.func,
		schedule: PropTypes.object,
		paddingRight: PropTypes.number,
		isEditMode: PropTypes.func,
	};

	constructor(props: Props & PropsThemedComponent) {
		super(props);

		const { isEditMode, intl, schedule } = this.props;
		const { formatMessage } = intl;

		this.h1 = isEditMode() ? formatMessage(i18n.time) : formatMessage(i18n.time);
		this.h2 = formatMessage(i18n.posterChooseTime);
		this.labelSliderIntervalEdit = formatMessage(i18n.descriptionSliderInterval, {startValue: '0min', endValue: '1440min'});
		this.labelSliderOffsetEdit = formatMessage(i18n.descriptionSliderOffset, {startValue: '-1439min', endValue: '1439min'});

		this.labelEditTime = formatMessage(i18n.editTime);
		this.labelEditTimeAccessible = formatMessage(i18n.editTimeAccessible);

		const { type, offset, randomInterval, hour, minute } = schedule;

		this.state = {
			selectedType: type,
			randomInterval,
			offset,
			date: this._createDate(hour, minute),
			offsetEdit: false,
			intervalEdit: false,
			shouldRenderTimePickerAndroid: false,
		};

		this.selectTimeAndroid = this.selectTimeAndroid.bind(this);
		this.toggleEdit = this.toggleEdit.bind(this);
	}

	componentDidMount() {
		const { h1, h2 } = this;
		this.props.onDidMount(h1, h2);
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

	toggleEdit(type: string) {
		const { offsetEdit, intervalEdit } = this.state;
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		if (type === 'OFFSET') {
			this.setState({
				offsetEdit: !offsetEdit,
			});
		}
		if (type === 'INTERVAL') {
			this.setState({
				intervalEdit: !intervalEdit,
			});
		}
	}

	selectTimeAndroid = () => {
		this.setState({
			shouldRenderTimePickerAndroid: true,
		});
	};

	selectTime = () => {
		const { actions, navigation, isEditMode, route } = this.props;
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
			time.offset = 0;
		}

		actions.selectTime(selectedType, time);

		if (isEditMode()) {
			navigation.goBack();
		} else {
			navigation.navigate({
				name: 'Days',
				key: 'Days',
				params: route.params,
			});
		}
	};

	render(): React$Element<any> {
		const { appLayout, intl } = this.props;
		const {
			selectedType,
			randomInterval,
			shouldRenderTimePickerAndroid,
			date,
		} = this.state;
		const {
			container,
			row,
			marginBottom,
			type,
			textColorDateTimePicker,
		} = this._getStyle(appLayout);

		const shouldRender = !!selectedType;

		return (
			<View style={{flex: 1}}>
				<ScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps={'always'}>
					<View style={container}>
						<View style={[type.container, { marginBottom }]}>
							{this._renderTypes(TYPES)}
						</View>
						{this._renderTimeRow()}
						{shouldRender && (
							<Row containerStyle={row}>
								<TimeSlider
									description={this.labelSliderIntervalEdit}
									icon="random"
									minimumValue={0}
									maximumValue={1440}
									value={randomInterval}
									onValueChange={this.setRandomIntervalValue}
									appLayout={appLayout}
									intl={intl}
									type="INTERVAL"
									toggleEdit={this.toggleEdit}
									autoFocus={false}
								/>
							</Row>
						)}
					</View>
				</ScrollView>
				{shouldRenderTimePickerAndroid && (
					<DateTimePicker
						mode="time"
						value={date}
						textColor={textColorDateTimePicker}
						onChange={this._onDateChange}/>
				)}
				{shouldRender && (
					<FloatingButton
						onPress={this.selectTime}
						imageSource={{uri: 'right_arrow_key'}}
						paddingRight={this.props.paddingRight - 2}
					/>
				)}
			</View>
		);
	}

	_renderTimeRow = (): Object | null => {
		const { appLayout, intl } = this.props;
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
			textColorDateTimePicker,
		} = this._getStyle(appLayout);

		let timePicker;

		if (Platform.OS === 'ios') {
			timePicker = (
				<View style={iosTimeContainer}>
					<DateTimePicker
						value={date}
						mode="time"
						style={{ flex: 1 }}
						textColor={textColorDateTimePicker}
						display={'spinner'}
						onChange={this._onDateChange}
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
				description={this.labelSliderOffsetEdit}
				icon="offset"
				minimumValue={-1439}
				maximumValue={1439}
				value={offset}
				onValueChange={this.setTimeOffsetValue}
				appLayout={appLayout}
				intl={intl}
				type="OFFSET"
				toggleEdit={this.toggleEdit}
				autoFocus={false}
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

	_onDateChange = (event: Object, date: Date) => {
		if (Platform.OS === 'ios') {
			if (date === undefined) {
				// dismissedAction
				this.setState({
					shouldRenderTimePickerAndroid: false,
				});
			}
		} else {
			this.setState({
				shouldRenderTimePickerAndroid: false,
			});
		}

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
		const {
			colors,
		} = this.props;

		const {
			inAppBrandPrimary,
			textThree,
		} = colors;

		const { borderRadiusRow, maxSizeFloatingButton } = Theme.Core;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const androidTimeWidth = deviceWidth * 0.213333333;
		const androidTimeHeight = deviceWidth * 0.177333333;
		const androidTimeColor = inAppBrandPrimary;

		const padding = deviceWidth * Theme.Core.paddingFactor;
		const marginBottom = padding / 4;

		let buttonSize = deviceWidth * 0.134666667;
		buttonSize = buttonSize > maxSizeFloatingButton ? maxSizeFloatingButton : buttonSize;
		let buttonBottom = deviceWidth * 0.066666667;

		return {
			textColorDateTimePicker: textThree,
			container: {
				flex: 1,
				justifyContent: 'flex-start',
				marginBottom: (buttonSize / 2) + buttonBottom,
				paddingVertical: padding - (padding / 4),
			},
			row: {
				marginBottom,
				height: deviceWidth * 0.309333333,
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

export default (withTheme(Time): Object);
