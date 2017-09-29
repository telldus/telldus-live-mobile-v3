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
import { Text, TouchableOpacity, View } from 'react-native';
import Theme from 'Theme';
import { getDeviceWidth } from 'Lib';

type Props = {
	day: string,
	isSelected: boolean,
	onPress?: (index: number) => void,
};

export default class Day extends View<null, Props, null> {

	static propTypes = {
		day: PropTypes.string.isRequired,
		isSelected: PropTypes.bool.isRequired,
		onPress: PropTypes.func,
	};

	handlePress = () => {
		this.props.onPress(this.props.day);
	};

	render(): React$Element {
		const { day, onPress } = this.props;
		const { container, name } = this._getStyle();

		return (
			<TouchableOpacity onPress={this.handlePress} disabled={!onPress} style={container}>
				<Text style={name}>
					{day.charAt(0).toUpperCase()}
				</Text>
			</TouchableOpacity>
		);
	}

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();
		const { brandSecondary, inactiveGray, fonts } = Theme.Core;

		const size = deviceWidth * 0.101333333;
		const backgroundColor = this.props.isSelected ? brandSecondary : inactiveGray;

		return {
			container: {
				backgroundColor,
				alignItems: 'center',
				justifyContent: 'center',
				height: size,
				width: size,
			},
			name: {
				backgroundColor: 'transparent',
				color: '#fff',
				fontFamily: fonts.robotoMedium,
				fontSize: deviceWidth * 0.05,
			},
		};
	};
}
