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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dimensions } from 'react-native';
import Text from './Text';
import Theme from 'Theme';

const deviceWidth = Dimensions.get('window').width;

type DefaultProps = {
	color: string,
	size: number,
};

type Props = {
	icon: string,
	size?: number,
	color?: string,
	style?: Object | number,
};

export default class IconTelldus extends Component<Props, null> {
	props: Props;

	static propTypes = {
		icon: PropTypes.string.isRequired,
		size: PropTypes.number,
		color: PropTypes.string,
		style: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
	};

	static defaultProps: DefaultProps = {
		color: '#999',
		size: deviceWidth * 0.04,
	};

	render(): Object {
		const { icon, style } = this.props;
		const defaultStyle = this._getDefaultStyle();

		return (
			<Text style={[defaultStyle, style, { fontFamily: Theme.Core.fonts.telldusIconFont }]}>
				{icon}
			</Text>
		);
	}

	_getDefaultStyle = (): Object => {
		const { size, color } = this.props;

		return {
			color,
			fontSize: size,
		};
	};

}
