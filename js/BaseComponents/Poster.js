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
import { Dimensions, Image, View } from 'react-native';

type Props = {
	children?: any,
	source?: number,
};

type DefaultProps = {
	source: number,
};

export default class Poster extends View<DefaultProps, Props, null> {

	static propTypes = {
		children: PropTypes.any,
		source: PropTypes.number,
	};

	static defaultProps = {
		source: require('./img/telldus-geometric-header-bg.png'),
	};

	render() {
		const { children, source } = this.props;
		const { image, mask } = this._getStyle();

		return (
			<View style={mask}>
				<Image source={source} style={image}/>
				{!!children && children}
			</View>
		);
	}

	_getStyle = (): Object => {
		const deviceWidth = Dimensions.get('window').width;

		return {
			image: {
				height: deviceWidth * 0.577333333,
				width: deviceWidth,
			},
			mask: {
				borderWidth: 0,
				height: deviceWidth * 0.333333333,
				width: deviceWidth,
				overflow: 'hidden',
			},
		};
	};

}
