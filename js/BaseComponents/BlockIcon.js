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
import { View, Text } from 'react-native';
import IconTelldus from './IconTelldus';
import Theme from 'Theme';

type DefaultProps = {
	color: string,
	bgColor: string,
};

type Props = {
	icon: string,
	size?: number,
	color?: string,
	bgColor?: string,
	style?: Object,
};

export default class BlockIcon extends View<DefaultProps, Props, null> {

	static propTypes = {
		icon: PropTypes.string.isRequired,
		size: PropTypes.number,
		color: PropTypes.string,
		bgColor: PropTypes.string,
		style: Text.propTypes.style,
		containerStyle: View.propTypes.style,
	};

	static defaultProps = {
		color: '#fff',
		bgColor: Theme.Core.brandPrimary,
	};

	render() {
		const { style, containerStyle, icon, size, color } = this.props;
		const defaultStyle = this._getDefaultStyle();

		return (
			<View style={[defaultStyle, containerStyle]}>
				<IconTelldus icon={icon} size={size} color={color} style={style}/>
			</View>
		);
	}

	_getDefaultStyle = (): Object => {
		return {
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: this.props.bgColor,
		};
	};
}
