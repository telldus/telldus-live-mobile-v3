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

'use strict';

import React from 'react';
import { View, Platform } from 'react-native';
import Base from './Base';
import Icon from './Icon';

export default class CheckBox extends Base {

	getInitialStyle() {
		return {
			checkbox: {
				borderRadius: (Platform.OS === 'ios') ? 13 : 2,
				overflow: 'hidden',
				width: this.getTheme().checkboxSize,
				height: this.getTheme().checkboxSize,
				borderWidth: (Platform.OS === 'ios') ? 1 : 2,
				paddingLeft: (Platform.OS === 'ios') ? 5 : 2,
				paddingBottom: (Platform.OS === 'ios') ? 0 : 5,
				borderColor: this.getTheme().checkboxBgColor,
				backgroundColor: this.props.checked ? this.getTheme().checkboxBgColor : 'transparent',
			},
		};
	}

	render() {
		return (
			<View style={this.getInitialStyle().checkbox}>
				<Icon name={(Platform.OS === 'ios') ? 'ios-checkmark-outline' : 'md-checkmark'} style={{color: this.props.checked ? this.getTheme().checkboxTickColor : 'transparent', lineHeight: (Platform.OS === 'ios') ? this.getTheme().checkboxSize / 0.93 : this.getTheme().checkboxSize - 5, marginTop: (Platform.OS === 'ios') ? undefined : 1, fontSize: (Platform.OS === 'ios') ? this.getTheme().checkboxSize / 0.8 : this.getTheme().checkboxSize / 1.2}} />
			</View>
		);
	}
}
