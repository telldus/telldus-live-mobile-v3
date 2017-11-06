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
import { ScheduleProps } from './ScheduleScreen';
import { CheckButton, DaysRow, Description } from 'Schedule_SubViews';
import { getDeviceWidth, getSelectedDays, getWeekdays, getWeekends } from 'Lib';
import { CheckboxSolid, FloatingButton, Row, View } from 'BaseComponents';
import _ from 'lodash';
import { DAYS } from 'Constants';

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

		this.h1 = '4. Days';
		this.h2 = 'Choose days for event repeating';
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
		const {
			shouldCheckAll,
			shouldUncheckAll,
			isWeekdaysSelected,
			isWeekendsSelected,
			selectedDays,
		} = this.state;

		const { mainContainer, buttonsContainer, row, rowContainer, checkbox, buttonStyle } = this._getStyle();

		return (
			<View style={mainContainer}>
				<DaysRow
					selectedDays={selectedDays}
					containerStyle={rowContainer}
					onDayPress={this.toggleDayState}
					editMode={true}
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
					/>
					<Description>
						Weekdays (Monday to Friday)
					</Description>
				</Row>
				<Row
					layout="row"
					onPress={this.toggleWeekends}
					style={row}
					containerStyle={[
						rowContainer,
						{ marginBottom: getDeviceWidth() * 0.068 },
					]}
				>
					<CheckboxSolid
						onPress={this.toggleWeekends}
						checked={isWeekendsSelected}
						style={checkbox}
					/>
					<Description>
						Weekends (Saturday & Sunday)
					</Description>
				</Row>
				<View style={[row, buttonsContainer]}>
					<CheckButton onPress={this.checkAll} disabled={!shouldCheckAll}>
						Check all
					</CheckButton>
					<CheckButton onPress={this.uncheckAll} disabled={!shouldUncheckAll}>
						Uncheck all
					</CheckButton>
				</View>
				{selectedDays.length > 0 && (
					<FloatingButton
						buttonStyle={buttonStyle}
						onPress={this.selectDays}
						imageSource={require('./img/right-arrow-key.png')}
						iconSize={getDeviceWidth() * 0.041333333}
						paddingRight={this.props.paddingRight}
					/>
				)}
			</View>
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

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();

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
		};
	};
}
