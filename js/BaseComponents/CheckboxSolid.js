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

import React from 'react';

import TouchableOpacity from './TouchableOpacity';

import { getDeviceWidth } from '../App/Lib';

type DefaultProps = {
	size: number,
	disabled: boolean,
};

type Props = {
	onPress: Function,
	checked: boolean,
	size?: number,
	disabled?: boolean,
	style?: Object,
};

export default class CheckboxSolid extends React.Component<Props, null> {

	static defaultProps: DefaultProps = {
		size: getDeviceWidth() * 0.066666667,
		disabled: false,
	};

	render(): React$Element<any> {
		const { disabled, onPress, style, checked } = this.props;
		const defaultStyle = this._getStyle();

		const level = checked ? 13 : 14;

		return (
			<TouchableOpacity
				onPress={onPress}
				disabled={disabled}
				style={[defaultStyle, style]}
				level={level}
			/>
		);
	}

	_getStyle = (): Object => {
		const { size } = this.props;

		return {
			height: size,
			width: size,
		};
	};

}
