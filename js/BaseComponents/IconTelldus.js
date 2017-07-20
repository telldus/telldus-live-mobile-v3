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
import { Text } from 'react-native';
import Theme from 'Theme';
import getDeviceWidth from '../App/Lib/getDeviceWidth';

type DefaultProps = {
	color: string,
	size: number,
};

type Props = {
	icon: string,
	size?: number,
	color?: string,
	style?: Object,
};

export default class IconTelldus extends Text<DefaultProps, Props, null> {

	static propTypes = {
		icon: PropTypes.string.isRequired,
		size: PropTypes.number,
		color: PropTypes.string,
		style: Text.propTypes.style,
	};

	static defaultProps = {
		color: '#999',
		size: getDeviceWidth() * 0.04,
	};

	render() {
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
