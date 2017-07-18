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
import { View } from 'BaseComponents';
import Theme from 'Theme';
import Row from './Row';
import BlockIcon from './BlockIcon';
import Description from './Description';
import capitalize from '../../../Lib/capitalize';
import getDeviceWidth from '../../../Lib/getDeviceWidth';

type Props = {
	type: Object,
	onPress: (number) => void,
	index: number,
	isSelected: boolean,
};

export default class TimeBlock extends View<null, Props, null> {

	static propTypes = {
		type: PropTypes.string.isRequired,
		onPress: PropTypes.func.isRequired,
		index: PropTypes.number.isRequired,
		isSelected: PropTypes.bool.isRequired,
	};

	getStyles = (): Object => {
		const { isSelected, type } = this.props;
		const { brandSecondary } = Theme.Core;

		const deviceWidth = getDeviceWidth();
		const size = deviceWidth * 0.293333333;

		let backgroundColor = '#fff';
		let iconColor = brandSecondary;
		let textColor = '#555555';

		if (type === 'sunrise') {
			iconColor = '#ffa726';
		}
		if (type === 'sunset') {
			iconColor = '#EF5350';
		}
		if (isSelected) {
			backgroundColor = brandSecondary;
			iconColor = '#fff';
			textColor = '#fff';
		}

		return {
			container: {
				flex: 0,
				backgroundColor,
				marginBottom: 0,
				height: size,
				width: size,
			},
			wrapper: {
				alignItems: 'center',
				justifyContent: 'center',
				height: null,
			},
			icon: {
				padding: 0,
				width: null,
			},
			description: {
				fontSize: deviceWidth * 0.037333333,
			},
			backgroundColor,
			iconColor,
			iconSize: deviceWidth * 0.133333333,
			textColor,
		};
	};

	render() {
		const { type, onPress, index } = this.props;

		const {
			container,
			wrapper,
			icon,
			backgroundColor,
			iconColor,
			iconSize,
			textColor,
			description,
		} = this.getStyles();

		return (
			<Row
				onPress={onPress}
				row={{ index }}
				style={container}
				wrapperStyle={wrapper}
			>
				<BlockIcon
					icon={type}
					size={iconSize}
					color={iconColor}
					bgColor={backgroundColor}
					style={icon}
				/>
				<Description color={textColor} style={description}>
					{capitalize(type)}
				</Description>
			</Row>
		);
	}
}
