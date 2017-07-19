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
import { View } from 'react-native';
import { ScheduleProps } from './ScheduleScreen';
import Row from './SubViews/Row';
import Weekday from './SubViews/Weekday';
import Description from './SubViews/Description';
import getDeviceWidth from '../../Lib/getDeviceWidth';
import CheckButton from './SubViews/CheckButton';
import { CheckboxSolid } from 'BaseComponents';
import _ from 'lodash';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Props extends ScheduleProps {
	paddingRight: number,
}

type State = {
	selectedDays: string[],
	shouldCheckAll: boolean,
	shouldUncheckAll: boolean,
	weekdaysSelected: boolean,
};

export default class Days extends View<null, Props, State> {

	static propTypes = {
		navigation: PropTypes.object,
		actions: PropTypes.object,
		onDidMount: PropTypes.func,
		paddingRight: PropTypes.number,
	};

	state = {
		selectedDays: [],
		shouldCheckAll: true,
		shouldUncheckAll: false,
		weekdaysSelected: false,
	};

	constructor(props: Props) {
		super(props);

		this.h1 = '4. Days';
		this.h2 = 'Choose days for event repeating';
		this.infoButton = {
			tmp: true, // TODO: fill with real fields
		};
	}

	componentDidMount() {
		const { h1, h2, infoButton } = this;
		this.props.onDidMount(h1, h2, infoButton);
	}

	toggleWeekdayState = (day: string) => {
		const { selectedDays } = this.state;

		let newSelectedWeekdays: string[];

		if (this._isSelected(day)) {
			newSelectedWeekdays = selectedDays.filter((d: string): boolean => d !== day);
		} else {
			newSelectedWeekdays = selectedDays.concat(day);
		}

		this.setState({
			selectedDays: newSelectedWeekdays,
			shouldUncheckAll: !!newSelectedWeekdays.length,
			shouldCheckAll: newSelectedWeekdays.length !== DAYS.length,
			weekdaysSelected: this._isWeekdaysSelected(newSelectedWeekdays),
		});
	};

	checkAll = () => {
		if (this.state.shouldCheckAll) {
			this.setState({
				selectedDays: DAYS,
				shouldCheckAll: false,
				shouldUncheckAll: true,
				weekdaysSelected: false,
			});
		}
	};

	uncheckAll = () => {
		if (this.state.shouldUncheckAll) {
			this.setState({
				selectedDays: [],
				shouldUncheckAll: false,
				shouldCheckAll: true,
				weekdaysSelected: false,
			});
		}
	};

	toggleWeekdays = () => {
		if (this._isWeekdaysSelected()) {
			this.uncheckAll();
		} else {
			this.setState({
				selectedDays: this._getWeekdays(),
				shouldUncheckAll: true,
				shouldCheckAll: true,
				weekdaysSelected: true,
			});
		}
	};

	render() {
		const { shouldCheckAll, shouldUncheckAll, weekdaysSelected } = this.state;

		const {
			mainContainer,
			weekdaysContainer,
			buttonsContainer,
			row,
			rowContainer,
			checkbox,
			checkboxText,
		} = this._getStyle();

		return (
			<View style={mainContainer}>
				<Row layout="row" style={[row, weekdaysContainer]} containerStyle={rowContainer}>
					{this._renderWeekdays()}
				</Row>
				<Row
					layout="row"
					onPress={this.toggleWeekdays}
					style={row}
					containerStyle={rowContainer}
				>
					<CheckboxSolid
						onPress={this.toggleWeekdays}
						checked={weekdaysSelected}
						style={checkbox}
					/>
					<Description style={checkboxText}>
						Weekdays (Monday to Friday)
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
			</View>
		);
	}

	_renderWeekdays = (): Object[] => {
		return DAYS.map((day: string): Object => {
			return (
				<Weekday
					day={day}
					isSelected={this._isSelected(day)}
					onPress={this.toggleWeekdayState}
					key={day}
				/>
			);
		});
	};

	_isSelected = (day: string): boolean => {
		return this.state.selectedDays.includes(day);
	};

	_isWeekdaysSelected = (selectedDays?: string[] = this.state.selectedDays): boolean => {
		let isWeekdaysSelected: boolean = false;

		if (selectedDays.length === 5) {
			isWeekdaysSelected = _.isEqual(selectedDays, this._getWeekdays());
		}

		return isWeekdaysSelected;
	};

	_getWeekdays = (): string[] => {
		return DAYS.slice(0, 5);
	};

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();

		return {
			mainContainer: {
				flex: 1,
				justifyContent: 'flex-start',
			},
			weekdaysContainer: {
				justifyContent: 'space-between',
				paddingVertical: deviceWidth * 0.102666667,
			},
			buttonsContainer: {
				flexDirection: 'row',
				justifyContent: 'space-between',
				paddingVertical: 0,
			},
			row: {
				alignItems: 'center',
				paddingHorizontal: deviceWidth * 0.056,
				paddingVertical: deviceWidth * 0.037333333,
			},
			rowContainer: {
				height: null,
				marginBottom: deviceWidth * 0.028,
			},
			checkbox: {
				marginRight: deviceWidth * 0.05,
			},
			checkboxText: {
				color: '#555555',
				fontSize: deviceWidth * 0.037333333,
			},
		};
	};
}
