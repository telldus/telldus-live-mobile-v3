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
import { TouchableOpacity, View } from 'react-native';
import getDeviceWidth from '../../../Lib/getDeviceWidth';
import Theme from 'Theme';

type DefaultProps = {
	layout: 'column',
};

type Props = {
	children: any,
	row?: Object,
	onPress?: (row: Object) => void,
	layout?: 'row' | 'column',
	style?: Object,
	containerStyle?: Object,
};

export default class Row extends View<DefaultProps, Props, null> {

	static propTypes = {
		children: PropTypes.node.isRequired,
		row: PropTypes.object,
		onPress: PropTypes.func,
		layout: PropTypes.oneOf(['row', 'column']),
		style: View.propTypes.style,
		containerStyle: View.propTypes.style,
	};

	static defaultProps = {
		layout: 'column',
	};

	returnRow = () => {
		const { row, onPress } = this.props;

		if (row) {
			onPress(row);
		}
	};

	render() {
		const { children, onPress, style, containerStyle } = this.props;
		const defaultStyle = this._getDefaultStyle();

		return (
			<TouchableOpacity
				onPress={this.returnRow}
				style={[defaultStyle.container, containerStyle]}
				outlineProvider="bounds"
				disabled={!onPress}
			>
				<View style={[defaultStyle.wrapper, style]}>
					{children}
				</View>
			</TouchableOpacity>
		);
	}

	_getDefaultStyle = (): Object => {
		const deviceWidth = getDeviceWidth();

		const borderRadius = 2;
		const backgroundColor = '#fff';

		return {
			container: {
				backgroundColor,
				flexDirection: 'row',
				marginBottom: deviceWidth * 0.006666667,
				height: deviceWidth * 0.209333333,
				...Theme.Core.shadow,
				borderRadius,
			},
			wrapper: {
				backgroundColor,
				flex: 1,
				flexDirection: this.props.layout,
				overflow: 'hidden',
				borderRadius,
			},
		};
	};

}
