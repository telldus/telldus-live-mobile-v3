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
import { View } from 'react-native';
import { BlockIcon, Row } from 'BaseComponents';
import TextRowWrapper from './TextRowWrapper';
import Title from './Title';
import Description from './Description';
import { getDeviceWidth } from 'Lib';
import Theme from 'Theme';

type Props = {
	row: Object,
	onPress?: Function,
	containerStyle?: Object,
};

export default class DeviceRow extends View<null, Props, null> {

	static propTypes = {
		row: PropTypes.object.isRequired,
		onPress: PropTypes.func,
		containerStyle: View.propTypes.style,
	};

	render(): React$Element {
		const { row, onPress, containerStyle } = this.props;
		const { row: rowStyle, icon, iconContainer, description } = this._getStyle();

		return (
			<Row layout="row" row={row} onPress={onPress} style={rowStyle} containerStyle={containerStyle}>
				<BlockIcon
					icon="device-alt"
					style={icon}
					containerStyle={iconContainer}
				/>
				<TextRowWrapper>
					<Title numberOfLines={1} ellipsizeMode="tail">
						{row.name}
					</Title>
					<Description numberOfLines={1} ellipsizeMode="tail" style={description}>
						{row.description}
					</Description>
				</TextRowWrapper>
			</Row>
		);
	}

	_getStyle = (): Object => {
		const { borderRadiusRow } = Theme.Core;
		const deviceWidth = getDeviceWidth();

		return {
			row: {
				alignItems: 'stretch',
			},
			icon: {
				fontSize: deviceWidth * 0.149333333,
			},
			iconContainer: {
				width: deviceWidth * 0.346666667,
				borderTopLeftRadius: borderRadiusRow,
				borderBottomLeftRadius: borderRadiusRow,
			},
			description: {
				color: '#707070',
				fontSize: deviceWidth * 0.032,
				opacity: 1,
			},
		};
	};

}
