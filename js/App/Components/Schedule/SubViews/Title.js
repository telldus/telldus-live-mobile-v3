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
import { Text, View } from 'react-native';
import Theme from 'Theme';
import getDeviceWidth from '../../../Lib/getDeviceWidth';

type DefaultProps = {
	color: string,
};

type Props = {
	children: string,
	style?: Object,
	color?: string,
};

export default class Title extends View<DefaultProps, Props, null> {

	static propTypes = {
		children: PropTypes.string.isRequired,
		style: Text.propTypes.style,
		color: PropTypes.string,
	};

	static defaultProps = {
		color: Theme.Core.brandSecondary,
	};

	render() {
		const { children, style, color } = this.props;
		const defaultStyle = this._getDefaultStyle();

		return (
			<Text style={[defaultStyle, style, { color }]} numberOfLines={1} ellipsizeMode="tail">
				{children}
			</Text>
		);
	}

	_getDefaultStyle = (): Object => {
		const deviceWidth = getDeviceWidth();
		return {
			fontFamily: Theme.Core.fonts.sfnsDisplay,
			fontSize: deviceWidth * 0.053333333,
			marginBottom: deviceWidth * 0.008,
		};
	};

}
