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
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';

import Theme from '../App/Theme';
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

	static propTypes = {
		onPress: PropTypes.func.isRequired,
		checked: PropTypes.bool.isRequired,
		size: PropTypes.number,
		disabled: PropTypes.bool,
		style: PropTypes.object,
	};

	static defaultProps: DefaultProps = {
		size: getDeviceWidth() * 0.066666667,
		disabled: false,
	};

	render(): React$Element<any> {
		const { disabled, onPress, style } = this.props;
		const defaultStyle = this._getStyle();

		return (
			<TouchableOpacity
				onPress={onPress}
				disabled={disabled}
				style={[defaultStyle, style]}
			/>
		);
	}

	_getStyle = (): Object => {
		const { size, checked } = this.props;
		const { inactiveGray, brandSecondary } = Theme.Core;

		return {
			backgroundColor: checked ? brandSecondary : inactiveGray,
			height: size,
			width: size,
		};
	};

}
