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
import { Switch, Text, View } from 'react-native';
import { getDeviceWidth } from 'Lib';
import Theme from 'Theme';

type Props = {
	value: boolean,
	onValueChange: Function,
};

export default class ScheduleSwitch extends View<null, Props, null> {

	static propTypes = {
		value: PropTypes.bool.isRequired,
		onValueChange: PropTypes.func.isRequired,
	};

	render(): React$Element<any> {
		const { value, onValueChange } = this.props;
		const { container, description } = this._getStyle();

		return (
			<View style={container}>
				<Text style={description}>
					Schedule active
				</Text>
				<Switch value={value} onValueChange={onValueChange}/>
			</View>
		);
	}

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();

		const offsetMiddle = deviceWidth * 0.033333333;
		const offsetLarge = deviceWidth * 0.04;

		return {
			container: {
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				backgroundColor: '#fff',
				borderTopWidth: 1,
				borderBottomWidth: 1,
				borderColor: '#c8c7cc',
				paddingHorizontal: offsetMiddle,
				paddingVertical: deviceWidth * 0.02,
				marginVertical: offsetLarge,
				width: '100%',
			},
			description: {
				color: '#5c5c5c',
				fontSize: deviceWidth * 0.037333333,
				fontFamily: Theme.Core.fonts.robotoRegular,
			},
		};
	};

}
