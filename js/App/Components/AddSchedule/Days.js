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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Props extends ScheduleProps {
	paddingRight: number,
}

type State = {
	selectedWeekdays: number[],
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
		const index = DAYS.indexOf(day);

		let newSelectedWeekdays;

		if (this._isSelected(index)) {
			newSelectedWeekdays = selectedWeekdays.filter((i: number): boolean => i !== index);
		} else {
			newSelectedWeekdays = selectedWeekdays.concat(index);
		}

		this.setState({ selectedWeekdays: newSelectedWeekdays });
	};

	render() {
		const { mainContainer, weekdaysContainer } = this._getStyle();

		return (
			<View style={mainContainer}>
				<Row layout="row" style={{ height: null }} wrapperStyle={weekdaysContainer}>
					{this._renderWeekdays()}
				</Row>
			</View>
		);
	}

	_renderWeekdays = (): Object[] => {
		return DAYS.map((day: string, i: number): Object => {
			const isSelected = this._isSelected(i);

			return (
				<Weekday
					day={day}
					isSelected={isSelected}
					onPress={this.toggleWeekdayState}
					key={day}
				/>
			);
		});
	};

	_isSelected = (index: number): boolean => {
		return this.state.selectedWeekdays.includes(index);
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
				paddingHorizontal: deviceWidth * 0.056,
				paddingVertical: deviceWidth * 0.102666667,
			},
		};
	};
}
