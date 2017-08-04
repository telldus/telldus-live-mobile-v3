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
import getDeviceWidth from '../../../Lib/getDeviceWidth';
import { Row } from 'BaseComponents';
import Day from './Day';
import { DAYS } from 'Constants';

type Props = {
	selectedDays: string[],
	onDayPress?: Function,
	containerStyle?: Object,
};

export default class DaysRow extends View<null, Props, null> {

	static propTypes = {
		selectedDays: PropTypes.arrayOf(PropTypes.string).isRequired,
		onDayPress: PropTypes.func,
		containerStyle: View.propTypes.style,
	};

	render() {
		const style = this._getStyle();

		return (
			<Row layout="row" style={style} containerStyle={this.props.containerStyle}>
				{this._renderWeekdays()}
			</Row>
		);
	}

	_renderWeekdays = (): Object[] => {
		return DAYS.map((day: string): Object => {
			return (
				<Day
					day={day}
					isSelected={this._isDaySelected(day)}
					onPress={this.props.onDayPress}
					key={day}
				/>
			);
		});
	};

	_isDaySelected = (day: string): boolean => {
		return this.props.selectedDays.includes(day);
	};

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();

		return {
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingVertical: deviceWidth * 0.102666667,
			paddingHorizontal: deviceWidth * 0.056,
		};
	};

}
