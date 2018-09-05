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
import { ScrollView } from 'react-native';
import { defineMessages } from 'react-intl';

import { ScheduleProps } from './ScheduleScreen';
import { CheckButton, DaysRow, Description } from './SubViews';
import { getSelectedDays, getWeekdays, getWeekends, getTranslatableDays } from '../../Lib';
import { CheckboxSolid, FloatingButton, Row, View } from '../../../BaseComponents';
import _ from 'lodash';
import Theme from '../../Theme';
import i18n from '../../Translations/common';

const messages = defineMessages({
	checkAll: {
		id: 'button.checkAll',
		defaultMessage: 'Check all',
	},
	unCheckAll: {
		id: 'button.unCheckAll',
		defaultMessage: 'Uncheck all',
	},
});
interface Props extends ScheduleProps {
	paddingRight: number,
}

type State = {
	selectedDays: string[],
	shouldCheckAll: boolean,
	shouldUncheckAll: boolean,
	isWeekdaysSelected: boolean,
	isWeekendsSelected: boolean,
};

export default class Days extends View<null, Props, State> {

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

		const { isEditMode, intl, schedule } = this.props;
		const { formatMessage, formatDate } = intl;

		this.days = getTranslatableDays(formatDate);

		this.h1 = isEditMode() ? formatMessage(i18n.posterDays) : `4. ${formatMessage(i18n.posterDays)}`;
		this.h2 = formatMessage(i18n.posterChooseDays);
		this.labelCheckAll = formatMessage(messages.checkAll);
		this.labelUncheckAll = formatMessage(messages.unCheckAll);
		this.labelWeekDays = `${formatMessage(i18n.weekdays)} (${formatMessage(i18n.weekdaysDescription)})`;
		this.labelWeekEnds = `${formatMessage(i18n.weekends)} (${formatMessage(i18n.weekendsDescription)})`;
		this.infoButton = {
			tmp: true, // TODO: fill with real fields
		};

		this.state = {
			selectedDays: getSelectedDays(schedule.weekdays, formatDate),
			shouldCheckAll: true,
			shouldUncheckAll: getSelectedDays(schedule.weekdays, formatDate).length > 0,
			isWeekdaysSelected: false,
			isWeekendsSelected: false,
		};
	}

	componentDidMount() {
		const { h1, h2, infoButton } = this;
		this.props.onDidMount(h1, h2, infoButton);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'Days';
	}

	toggleDayState = (day: string) => {
		const { selectedDays } = this.state;

		let newSelectedWeekdays: string[];

		if (this._isDaySelected(day)) {
			newSelectedWeekdays = selectedDays.filter((d: string): boolean => d !== day);
		} else {
			newSelectedWeekdays = selectedDays.concat(day);
		}

		this.setState({
			selectedDays: newSelectedWeekdays,
			shouldUncheckAll: !!newSelectedWeekdays.length,
			shouldCheckAll: newSelectedWeekdays.length !== this.days.length,
			isWeekdaysSelected: this._isSelected('weekdays', newSelectedWeekdays),
			isWeekendsSelected: this._isSelected('weekends', newSelectedWeekdays),
		});
	};

	checkAll = () => {
		if (this.state.shouldCheckAll) {
			this.setState({
				selectedDays: this.days,
				shouldCheckAll: false,
				shouldUncheckAll: true,
				isWeekdaysSelected: false,
				isWeekendsSelected: false,
			});
		}
	};

	uncheckAll = () => {
		if (this.state.shouldUncheckAll) {
			this.setState({
				selectedDays: [],
				shouldUncheckAll: false,
				shouldCheckAll: true,
				isWeekdaysSelected: false,
				isWeekendsSelected: false,
			});
		}
	};

	toggleWeekdays = () => {
		if (this._isSelected('weekdays')) {
			this.uncheckAll();
		} else {
			let { formatDate } = this.props.intl;
			this.setState({
				selectedDays: getWeekdays(formatDate),
				shouldUncheckAll: true,
				shouldCheckAll: true,
				isWeekdaysSelected: true,
				isWeekendsSelected: false,
			});
		}
	};

	toggleWeekends = () => {
		if (this._isSelected('weekends')) {
			this.uncheckAll();
		} else {
			let { formatDate } = this.props.intl;
			this.setState({
				selectedDays: getWeekends(formatDate),
				shouldUncheckAll: true,
				shouldCheckAll: true,
				isWeekdaysSelected: false,
				isWeekendsSelected: true,
			});
		}
	};

	selectDays = () => {
		const { actions, navigation, isEditMode } = this.props;

		let selectedDaysIndexes: number[] = [];
		const { selectedDays } = this.state;

		for (let i = 0; i < selectedDays.length; i++) {
			const selectedDayIndex = this.days.indexOf(selectedDays[i]);

			if (selectedDayIndex > -1) {
				selectedDaysIndexes.push(selectedDayIndex + 1);
			}
		}

		actions.selectDays(selectedDaysIndexes);

		if (isEditMode()) {
			navigation.goBack();
		} else {
			navigation.navigate({
				routeName: 'Summary',
				key: 'Summary',
			});
		}
	};

	render(): React$Element<any> {
		const { appLayout, intl } = this.props;
		const {
			shouldCheckAll,
			shouldUncheckAll,
			isWeekdaysSelected,
			isWeekendsSelected,
			selectedDays,
		} = this.state;

		const { mainContainer, buttonsContainer, row, rowContainer, checkbox, buttonStyle, CheckboxSolidSize, checkBoxBottom } = this._getStyle(appLayout);

		return (
			<ScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
				<View style={mainContainer}>
					<DaysRow
						selectedDays={selectedDays}
						containerStyle={rowContainer}
						onDayPress={this.toggleDayState}
						editMode={true}
						appLayout={appLayout}
						intl={intl}
					/>
					<Row
						layout="row"
						onPress={this.toggleWeekdays}
						style={row}
						containerStyle={rowContainer}
						accessible={true}
						importantForAccessibility={'yes'}
						accessibilityLabel={`${this.labelWeekDays}, ${intl.formatMessage(i18n.defaultDescriptionButton)}`}
					>
						<CheckboxSolid
							onPress={this.toggleWeekdays}
							checked={isWeekdaysSelected}
							style={checkbox}
							size={CheckboxSolidSize}
						/>
						<Description appLayout={appLayout}>
							{this.labelWeekDays}
						</Description>
					</Row>
					<Row
						layout="row"
						onPress={this.toggleWeekends}
						style={row}
						containerStyle={[
							rowContainer,
							{ marginBottom: checkBoxBottom },
						]}
						accessible={true}
						importantForAccessibility={'yes'}
						accessibilityLabel={`${this.labelWeekEnds}, ${intl.formatMessage(i18n.defaultDescriptionButton)}`}
					>
						<CheckboxSolid
							onPress={this.toggleWeekends}
							checked={isWeekendsSelected}
							style={checkbox}
							size={CheckboxSolidSize}
						/>
						<Description appLayout={appLayout}>
							{this.labelWeekEnds}
						</Description>
					</Row>
					<View style={[row, buttonsContainer]}>
						<CheckButton onPress={this.checkAll} disabled={!shouldCheckAll} appLayout={appLayout} intl={intl}>
							{this.labelCheckAll}
						</CheckButton>
						<CheckButton onPress={this.uncheckAll} disabled={!shouldUncheckAll} appLayout={appLayout} intl={intl}>
							{this.labelUncheckAll}
						</CheckButton>
					</View>
				</View>
				{selectedDays.length > 0 && (
					<FloatingButton
						buttonStyle={buttonStyle}
						onPress={this.selectDays}
						imageSource={{uri: 'right_arrow_key'}}
						paddingRight={this.props.paddingRight - 2}
					/>
				)}
			</ScrollView>
		);
	}

	_isDaySelected = (day: string): boolean => {
		return this.state.selectedDays.includes(day);
	};

	_isSelected = (days: string, selectedDays?: string[] = this.state.selectedDays): boolean => {
		let isSelected: boolean = false;
		let { formatDate } = this.props.intl;

		if (days === 'weekdays') {
			if (selectedDays.length === 5) {
				isSelected = _.isEqual(selectedDays, getWeekdays(formatDate));
			}
		}

		if (days === 'weekends') {
			if (selectedDays.length === 2) {
				isSelected = _.isEqual(selectedDays, getWeekends(formatDate));
			}
		}

		return isSelected;
	};

	_getStyle = (appLayout: Object): Object => {
		const { paddingFactor, maxSizeFloatingButton } = Theme.Core;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const padding = deviceWidth * paddingFactor;

		let buttonSize = deviceWidth * 0.134666667;
		buttonSize = buttonSize > maxSizeFloatingButton ? maxSizeFloatingButton : buttonSize;
		let buttonBottom = deviceWidth * 0.066666667;

		return {
			mainContainer: {
				flex: 1,
				justifyContent: 'flex-start',
				marginBottom: (buttonSize / 2) + buttonBottom,
				paddingVertical: padding - (padding / 4),
			},
			buttonsContainer: {
				flexDirection: 'row',
				justifyContent: 'space-between',
				paddingVertical: 0,
			},
			row: {
				paddingHorizontal: deviceWidth * 0.056,
				paddingVertical: deviceWidth * 0.037333333,
			},
			rowContainer: {
				marginVertical: padding / 4,
			},
			checkbox: {
				marginRight: deviceWidth * 0.05,
			},
			buttonStyle: {
				elevation: 4,
				shadowOpacity: 0.5,
			},
			CheckboxSolidSize: deviceWidth * 0.066666667,
			checkBoxBottom: deviceWidth * 0.068,
		};
	};
}
