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
import { Image, View } from 'react-native';
import Row from './Row';
import { getDeviceWidth } from 'Lib';
import Theme from 'Theme';

type Props = {
	children: any,
	layout: 'row' | 'column',
	containerStyle: Object,
	style: Object,
	triangleColor: string,
};

type DefaultProps = {
	layout: 'row',
	triangleColor: string,
};

export default class RowWithTriangle extends View<DefaultProps, Props, null> {

	static propTypes = {
		children: PropTypes.node.isRequired,
		layout: PropTypes.oneOf(['row', 'column']),
		containerStyle: View.propTypes.style,
		style: View.propTypes.style,
		triangleColor: PropTypes.string,
	};

	static defaultProps = {
		layout: 'row',
		triangleColor: Theme.Core.brandSecondary,
	};

	render() {
		const { children, layout, containerStyle, style } = this.props;

		const {
			container,
			triangleContainer,
			triangleCommon,
			triangleShadow,
			triangle,
			rowContainer,
			row,
		} = this._getStyle();

		return (
			<View style={container}>
				<View style={triangleContainer}>
					<Image
						source={require('./img/triangle-shadow.png')}
						style={[triangleCommon, triangleShadow]}
					/>
					<Image
						source={require('./img/triangle.png')}
						style={[triangleCommon, triangle]}
					/>
				</View>
				<Row
					layout={layout}
					containerStyle={[rowContainer, containerStyle]}
					style={[row, style]}
				>
					{children}
				</Row>
			</View>
		);
	}

	_getStyle = (): Object => {
		const { triangleColor } = this.props;
		const deviceWidth = getDeviceWidth();

		const triangleWidth = deviceWidth * 0.022666667;
		const triangleHeight = deviceWidth * 0.025333334;

		return {
			container: {
				flexDirection: 'row',
				alignItems: 'center',
				width: deviceWidth * 0.674666667,
			},
			triangleContainer: {
				width: triangleWidth,
				height: triangleHeight,
				zIndex: 3,
			},
			triangleCommon: {
				width: triangleWidth,
				height: triangleHeight,
				position: 'absolute',
				right: 0,
				top: 0,
			},
			triangleShadow: {
				zIndex: -1,
			},
			triangle: {
				zIndex: 1,
				tintColor: triangleColor,
			},
			rowContainer: {
				height: null,
				marginBottom: 0,
				width: deviceWidth * 0.650666667,
			},
			row: {
				alignItems: 'stretch',
			},
		};
	};

}
