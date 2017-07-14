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

type DefaultProps = {
	layout: 'column',
};

type Props = {
	children: any,
	onPress?: (row: Object) => void,
	layout?: 'row' | 'column',
};

export default class Row extends View<DefaultProps, Props, null> {

	static propTypes = {
		children: PropTypes.node.isRequired,
		onPress: PropTypes.func,
		layout: PropTypes.oneOf(['row', 'column']),
	};

	static defaultProps = {
		layout: 'column',
	};

	render() {
		const { children, onPress } = this.props;
		const defaultStyle = this._getDefaultStyle();

		return (
			<TouchableOpacity
				onPress={onPress}
				style={defaultStyle.container}
				outlineProvider="bounds"
				disabled={!onPress}
			>
				<View style={defaultStyle.wrapper}>
					{children}
				</View>
			</TouchableOpacity>
		);
	}

	_getDefaultStyle = (): Object => {
		const deviceWidth = getDeviceWidth();

		return {
			container: {
				flex: 1,
				marginBottom: deviceWidth * 0.006666667,
				elevation: 2,
				shadowColor: '#000',
				shadowRadius: 2,
				shadowOpacity: 0.23,
				shadowOffset: {
					width: 0,
					height: 1,
				},
			},
			wrapper: {
				flex: 1,
				flexDirection: this.props.layout,
				height: deviceWidth * 0.209333333,
				overflow: 'hidden',
				borderRadius: 2,
			},
		};
	};

}
