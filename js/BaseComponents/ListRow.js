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
import BlockIcon from './BlockIcon';
import RowWithTriangle from './RowWithTriangle';
import { getDeviceWidth } from 'Lib';
import Theme from 'Theme';

type Props = {
	children: any,
	roundIcon: string,
	roundIconContainerStyle: Object,
	time: string,
	timeStyle: Object,
	containerStyle: Object,
	rowContainerStyle: Object,
	rowStyle: Object,
	isFirst: boolean,
	triangleColor: string,
};

type DefaultProps = {
	isFirst: boolean,
};

export default class ListRow extends View<DefaultProps, Props, null> {

	static propTypes = {
		children: PropTypes.node.isRequired,
		roundIcon: PropTypes.string,
		roundIconContainerStyle: View.propTypes.style,
		time: PropTypes.string,
		timeStyle: View.propTypes.style,
		containerStyle: View.propTypes.style,
		rowContainerStyle: View.propTypes.style,
		rowStyle: View.propTypes.style,
		isFirst: PropTypes.bool,
		triangleColor: PropTypes.string,
	};

	static defaultProps = {
		isFirst: false,
	};

	render() {
		const {
			children,
			roundIcon,
			roundIconContainerStyle,
			time,
			timeStyle,
			containerStyle,
			rowContainerStyle,
			rowStyle,
			triangleColor,
		} = this.props;

		const style = this._getStyle();

		return (
			<View style={[style.container, containerStyle]}>
				<BlockIcon
					icon={roundIcon}
					containerStyle={[style.roundIconContainer, roundIconContainerStyle]}
					style={style.roundIcon}
				/>
				{!!time && (
					<Text style={[style.time, timeStyle]}>
						{time}
					</Text>
				)}
				<RowWithTriangle
					layout="row"
					triangleColor={triangleColor}
					containerStyle={rowContainerStyle}
					style={rowStyle}
				>
					{children}
				</RowWithTriangle>
			</View>
		);
	}

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();

		const roundIconWidth = deviceWidth * 0.061333333;

		const padding = deviceWidth * 0.013333333;

		return {
			container: {
				flexDirection: 'row',
				alignItems: 'center',
				paddingTop: this.props.isFirst ? deviceWidth * 0.037333333 : padding,
				paddingBottom: padding,
			},
			roundIconContainer: {
				backgroundColor: '#929292',
				aspectRatio: 1,
				width: roundIconWidth,
				borderRadius: roundIconWidth / 2,
			},
			roundIcon: {
				color: '#fff',
				fontSize: deviceWidth * 0.044,
			},
			time: {
				color: '#555',
				fontSize: Math.floor(deviceWidth * 0.046666667),
				fontFamily: Theme.Core.fonts.robotoMedium,
				marginHorizontal: deviceWidth * 0.033333333,
			},
		};
	};

}
