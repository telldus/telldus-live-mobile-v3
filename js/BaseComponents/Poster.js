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

import React, { PropTypes, Component } from 'react';
import { Dimensions, Image } from 'react-native';
import View from './View';

type Props = {
	children?: any,
	source?: number,
};

type DefaultProps = {
	source: number,
};

export default class Poster extends Component {
	props: Props;

	static propTypes = {
		children: PropTypes.any,
		source: PropTypes.number,
	};

	static defaultProps: DefaultProps = {
		source: require('./img/telldus-geometric-header-bg.png'),
	};

	constructor(props: Props) {
		super(props);
	}

	render(): React$Element<any> {
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
				flex: 1,
				height: undefined,
				width: deviceWidth,
				resizeMode: 'cover',
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
