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
import { View, TextInput } from 'react-native';
import Base from './Base';
import computeProps from './computeProps';

export default class Textarea extends Base {

	getInitialStyle() {
		return {
			input: {
				height: this.props.rowSpan * 25,
				color: this.getTheme().textColor,
				paddingLeft: 5,
				paddingRight: 5,
				fontSize: 18,
			},
		};
	}

	getBorderStyle() {
		return {
			underline: {
				borderTopWidth: 0,
				borderRightWidth: 0,
				borderLeftWidth: 0,
				marginTop: 5,
			},

			bordered: {
				marginTop: 5,
			},

			rounded: {
				borderRadius: 30,
				marginTop: 5,
			},
		};
	}

	prepareRootProps() {

		let defaultProps = {
			style: this.getInitialStyle().input,
		};

		return computeProps(this.props, defaultProps);

	}

	render() {

		return (
			<View style={{
				flex: 1,
				borderColor: this.getContextForegroundColor(),
				borderBottomWidth: this.getTheme().borderWidth,
			}}>
				<TextInput {...this.prepareRootProps()} multiline={true}
				           placeholderTextColor={this.getTheme().inputColorPlaceholder}
				           underlineColorAndroid="rgba(0,0,0,0)"/>
			</View>
		);
	}

}
