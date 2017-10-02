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
import { BlockIcon, Row, View } from 'BaseComponents';
import Theme from 'Theme';
import Description from './Description';
import { capitalize, getDeviceWidth } from 'Lib';

type Props = {
	type: string,
	onPress: (number) => void,
	isSelected: boolean,
};

export default class TimeBlock extends View<null, Props, null> {

	static propTypes = {
		type: PropTypes.string.isRequired,
		onPress: PropTypes.func.isRequired,
		isSelected: PropTypes.bool.isRequired,
	};

	render(): React$Element<any> {
		const { type, onPress } = this.props;

		const {
			container,
			row,
			iconContainer,
			backgroundColor,
			iconColor,
			iconSize,
			description,
		} = this._getStyle();

		return (
			<Row
				onPress={onPress}
				row={{ type }}
				style={row}
				containerStyle={container}
			>
				<BlockIcon
					icon={type}
					size={iconSize}
					color={iconColor}
					bgColor={backgroundColor}
					containerStyle={iconContainer}
				/>
				<Description style={description}>
					{capitalize(type)}
				</Description>
			</Row>
		);
	}

	_getStyle = (): Object => {
		const { isSelected, type } = this.props;
		const { brandSecondary } = Theme.Core;

		const deviceWidth = getDeviceWidth();
		const size = deviceWidth * 0.293333333;

		const backgroundColor = isSelected ? brandSecondary : '#fff';
		const iconColor = isSelected ? '#fff' : Theme.Core[`${type}Color`];
		const textColor = isSelected ? '#fff' : '#555555';

		return {
			container: {
				flex: 0,
				marginBottom: 0,
				height: size,
				width: size,
			},
			row: {
				backgroundColor,
				alignItems: 'center',
				justifyContent: 'center',
			},
			iconContainer: {
				marginBottom: deviceWidth * 0.02,
			},
			description: {
				color: textColor,
				fontSize: deviceWidth * 0.037333333,
			},
			backgroundColor,
			iconColor,
			iconSize: deviceWidth * 0.133333333,
		};
	};
}
