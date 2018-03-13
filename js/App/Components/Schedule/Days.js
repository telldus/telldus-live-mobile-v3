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
import { CheckButton, DaysRow, Description } from 'Schedule_SubViews';
import { getSelectedDays, getWeekdays, getWeekends } from '../../Lib';
import { CheckboxSolid, FloatingButton, Row, View } from '../../../BaseComponents';
import _ from 'lodash';
import { DAYS } from '../../../Constants';
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

		let { formatMessage } = this.props.intl;

		this.h1 = `4. ${formatMessage(i18n.posterDays)}`;
		this.h2 = formatMessage(i18n.posterChooseDays);
		this.labelCheckAll = formatMessage(messages.checkAll);
		this.labelUncheckAll = formatMessage(messages.unCheckAll);
		this.labelWeekDays = `${formatMessage(i18n.weekdays)} (${formatMessage(i18n.weekdaysDescription)})`;
		this.labelWeekEnds = `${formatMessage(i18n.weekends)} (${formatMessage(i18n.weekendsDescription)})`;
		this.infoButton = {
			tmp: true, // TODO: fill with real fields
		};

		this.state = {
			selectedDays: getSelectedDays(props.schedule.weekdays),
			shouldCheckAll: true,
			shouldUncheckAll: false,
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
			shouldCheckAll: newSelectedWeekdays.length !== DAYS.length,
			isWeekdaysSelected: this._isSelected('weekdays', newSelectedWeekdays),
			isWeekendsSelected: this._isSelected('weekends', newSelectedWeekdays),
		});
	};

	checkAll = () => {
		if (this.state.shouldCheckAll) {
			this.setState({
				selectedDays: DAYS,
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
			this.setState({
				selectedDays: getWeekdays(),
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
			this.setState({
				selectedDays: getWeekends(),
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
			const selectedDayIndex = DAYS.indexOf(selectedDays[i]);

			if (selectedDayIndex > -1) {
				selectedDaysIndexes.push(selectedDayIndex + 1);
			}
		}

		actions.selectDays(selectedDaysIndexes);

		if (isEditMode()) {
			navigation.goBack();
		} else {
			navigation.navigate('Summary');
		}
	};

	render(): React$Element<any> {
		const { appLayout } = this.props;
		const {
			shouldCheckAll,
			shouldUncheckAll,
			isWeekdaysSelected,
			isWeekendsSelected,
			selectedDays,
		} = this.state;

		const { mainContainer, buttonsContainer, row, rowContainer, checkbox, buttonStyle, CheckboxSolidSize, checkBoxBottom } = this._getStyle(appLayout);

		return (
			<ScrollView>
				<View style={mainContainer}>
					<DaysRow
						selectedDays={selectedDays}
						containerStyle={rowContainer}
						onDayPress={this.toggleDayState}
						editMode={true}
						appLayout={appLayout}
					/>
					<Row
						layout="row"
						onPress={this.toggleWeekdays}
						style={row}
						containerStyle={rowContainer}
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
						<CheckButton onPress={this.checkAll} disabled={!shouldCheckAll} appLayout={appLayout}>
							{this.labelCheckAll}
						</CheckButton>
						<CheckButton onPress={this.uncheckAll} disabled={!shouldUncheckAll} appLayout={appLayout}>
							{this.labelUncheckAll}
						</CheckButton>
					</View>
					{selectedDays.length > 0 && (
						<FloatingButton
							buttonStyle={buttonStyle}
							onPress={this.selectDays}
							imageSource={require('./img/right-arrow-key.png')}
							paddingRight={this.props.paddingRight}
						/>
					)}
				</View>
			</ScrollView>
		);
	}

	_isDaySelected = (day: string): boolean => {
		return this.state.selectedDays.includes(day);
	};

	_isSelected = (days: string, selectedDays?: string[] = this.state.selectedDays): boolean => {
		let isSelected: boolean = false;

		if (days === 'weekdays') {
			if (selectedDays.length === 5) {
				isSelected = _.isEqual(selectedDays, getWeekdays());
			}
		}

		if (days === 'weekends') {
			if (selectedDays.length === 2) {
				isSelected = _.isEqual(selectedDays, getWeekends());
			}
		}

		return isSelected;
	};

	_getStyle = (appLayout: Object): Object => {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		return {
			mainContainer: {
				flex: 1,
				justifyContent: 'flex-start',
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
				marginBottom: deviceWidth * 0.028,
			},
			checkbox: {
				marginRight: deviceWidth * 0.05,
			},
			buttonStyle: {
				elevation: 4,
				shadowOpacity: 0.99,
			},
			CheckboxSolidSize: deviceWidth * 0.066666667,
			checkBoxBottom: deviceWidth * 0.068,
		};
	};
}
