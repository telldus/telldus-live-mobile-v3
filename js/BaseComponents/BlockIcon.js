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
import View from './View';
import IconTelldus from './IconTelldus';
import Theme from '../App/Theme';

type DefaultProps = {
	color: string,
	bgColor: string,
	backgroundMask: boolean,
};

type Props = {
	icon?: string,
	size?: number,
	color?: string,
	bgColor?: string,
	style?: Array<any> | Object,
	containerStyle?: Array<any> | Object,
	backgroundMask?: boolean,
	backgroundMaskStyle?: Array<any> | Object,
	iconLevel?: number,
	blockLevel?: number,
};

export default class BlockIcon extends Component<Props, null> {
	props: Props;

	static defaultProps: DefaultProps = {
		color: '#fff',
		bgColor: Theme.Core.brandPrimary,
		backgroundMask: false,
	};

	render(): Object {
		const {
			style,
			containerStyle,
			icon,
			size,
			color,
			backgroundMask,
			backgroundMaskStyle,
			iconLevel,
			blockLevel,
		} = this.props;
		const defaultStyle = this._getDefaultStyle();

		return (
			<View
				level={blockLevel || 8}
				style={[defaultStyle, containerStyle]}>
				{backgroundMask && (<View style={backgroundMaskStyle}/>)}
				<IconTelldus
					level={iconLevel}
					icon={icon}
					size={size}
					color={typeof iconLevel === 'undefined' ? color : undefined}
					style={style}/>
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
