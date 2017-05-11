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
import Text from './Text';

export default class Title extends Base {

	render() {
		return (
			<View><Text style={{ color: this.getTheme().toolbarTextColor, fontSize: this.getTheme().titleFontSize, fontFamily: this.getTheme().btnFontFamily, fontWeight: (Platform.OS === 'ios') ? '500' : undefined, alignSelf: (Platform.OS === 'ios' ) ? 'center' : 'flex-start' }}>{this.props.children}</Text></View>
		);
	}
}
