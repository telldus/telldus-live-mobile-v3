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
import { getDeviceWidth } from 'Lib';
import { Row } from 'BaseComponents';
import Day from './Day';
import { DAYS } from 'Constants';

type Props = {
	selectedDays: string[],
	onDayPress?: Function,
	containerStyle?: Object,
	editMode?: boolean,
	onPress?: Function,
};

type DefaultProps = {
	editMode: boolean,
};

export default class DaysRow extends View<DefaultProps, Props, null> {

	static propTypes = {
		selectedDays: PropTypes.arrayOf(PropTypes.string).isRequired,
		onDayPress: PropTypes.func,
		containerStyle: View.propTypes.style,
		editMode: PropTypes.bool,
		onPress: PropTypes.func,
	};

	static defaultProps = {
		editMode: false,
	};

	render(): React$Element<any> {
		const { containerStyle, onPress } = this.props;
		const { container, row } = this._getStyle();

		return (
			<Row
				layout="row"
				containerStyle={[container, containerStyle]}
				style={row}
				onPress={onPress}
			>
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
			container: {
				height: null,
				marginBottom: 0,
			},
			row: {
				alignItems: 'center',
				justifyContent: 'space-between',
				paddingVertical: this.props.editMode ? deviceWidth * 0.102666667 : deviceWidth * 0.076,
				paddingHorizontal: deviceWidth * 0.056,
			},
		};
	};

}
