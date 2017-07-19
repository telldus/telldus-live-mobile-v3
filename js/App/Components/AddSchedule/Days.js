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
import getDeviceWidth from '../../Lib/getDeviceWidth';
import DayButton from './SubViews/DayButton';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Props extends ScheduleProps {
	paddingRight: number,
}

type State = {
	selectedWeekdays: string[],
	shouldCheckAll: boolean,
	shouldUncheckAll: boolean,
};

export default class Days extends View<null, Props, State> {

	static propTypes = {
		navigation: PropTypes.object,
		actions: PropTypes.object,
		onDidMount: PropTypes.func,
		paddingRight: PropTypes.number,
	};

	state = {
		selectedWeekdays: [],
		shouldCheckAll: true,
		shouldUncheckAll: false,
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
		const { selectedWeekdays } = this.state;

		let newSelectedWeekdays: string[];

		if (this._isSelected(day)) {
			newSelectedWeekdays = selectedWeekdays.filter((d: string): boolean => d !== day);
		} else {
			newSelectedWeekdays = selectedWeekdays.concat(day);
		}

		this.setState({
			selectedWeekdays: newSelectedWeekdays,
			shouldUncheckAll: !!newSelectedWeekdays.length,
			shouldCheckAll: newSelectedWeekdays.length !== DAYS.length,
		});
	};

	checkAll = () => {
		if (this.state.shouldCheckAll) {
			this.setState({
				selectedWeekdays: DAYS,
				shouldCheckAll: false,
				shouldUncheckAll: true,
			});
		}
	};

	uncheckAll = () => {
		if (this.state.shouldUncheckAll) {
			this.setState({
				selectedWeekdays: [],
				shouldUncheckAll: false,
				shouldCheckAll: true,
			});
		}
	};

	render() {
		const { shouldCheckAll, shouldUncheckAll } = this.state;
		const { mainContainer, weekdaysContainer, buttonsContainer, row } = this._getStyle();

		return (
			<View style={mainContainer}>
				<Row layout="row" style={weekdaysContainer} containerStyle={row}>
					{this._renderWeekdays()}
				</Row>
				<View style={buttonsContainer}>
					<DayButton onPress={this.checkAll} disabled={!shouldCheckAll}>
						Check all
					</DayButton>
					<DayButton onPress={this.uncheckAll} disabled={!shouldUncheckAll}>
						Uncheck all
					</DayButton>
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
		return this.state.selectedWeekdays.includes(day);
	};

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();

		const paddingHorizontal = deviceWidth * 0.056;

		return {
			mainContainer: {
				flex: 1,
				justifyContent: 'flex-start',
			},
			weekdaysContainer: {
				justifyContent: 'space-between',
				paddingHorizontal,
				paddingVertical: deviceWidth * 0.102666667,
			},
			buttonsContainer: {
				flexDirection: 'row',
				justifyContent: 'space-between',
				paddingHorizontal,
			},
			row: {
				height: null,
				marginBottom: deviceWidth * 0.028,
			},
		};
	};
}
