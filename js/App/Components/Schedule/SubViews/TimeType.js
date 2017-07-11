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
import { Dimensions, TouchableOpacity } from 'react-native';
import { View, Text } from 'BaseComponents';
import Theme from 'Theme';

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

type Props = {
	type: Object,
	select: (number) => void,
	index: number,
	isSelected: boolean,
};

class TimeType extends View {

	props: Props;

	getStyles: () => Object;
	selectType: () => void;

	static propTypes = {
		type: PropTypes.object.isRequired,
		select: PropTypes.func.isRequired,
		index: PropTypes.number.isRequired,
		isSelected: PropTypes.bool.isRequired,
	};

	constructor(props) {
		super(props);
	}

	getStyles = () => {
		const { isSelected } = this.props;
		const { brandSecondary, telldusIconFont } = Theme.Core;

		const deviceWidth = Dimensions.get('window').width;
		const size = deviceWidth * 0.293333333;
		const backgroundColor = isSelected ? brandSecondary : '#fff';
		const color = isSelected ? '#fff' : brandSecondary;

		return {
			container: {
				backgroundColor,
				borderRadius: 2,
				elevation: 2,
				shadowOffset: {
					width: 0,
					height: 2,
				},
				shadowRadius: 2,
				shadowColor: '#000',
				shadowOpacity: 0.23,
				height: size,
				width: size,
			},
			wrapper: {
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
			},
			icon: {
				color,
				fontFamily: telldusIconFont,
				fontSize: deviceWidth * 0.133333333,
			},
			name: {
				color,
				fontSize: deviceWidth * 0.037333333,
			},
		};
	};

	selectType = () => {
		const { select, index } = this.props;
		select(index);
	};

	render() {
		const { container, wrapper, icon, name } = this.getStyles();
		const { type } = this.props;

		return (
			<TouchableOpacity
				style={container}
				onPress={this.selectType}
				outlineProvider="bounds"
			>
				<View style={wrapper}>
					<Text style={icon}>{type}</Text>
					<Text style={name}>{type.capitalize()}</Text>
				</View>
			</TouchableOpacity>
		);
	}
}

module.exports = TimeType;
