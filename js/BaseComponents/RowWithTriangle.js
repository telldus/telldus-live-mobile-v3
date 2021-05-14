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
import { Image } from 'react-native';
import { connect } from 'react-redux';
import View from './View';
import Row from './Row';

import {
	withTheme,
	PropsThemedComponent,
} from '../App/Components/HOC/withTheme';

type Props = PropsThemedComponent & {
	children?: any,
	layout: 'row' | 'column',
	containerStyle: any,
	style: any,
	triangleColor: string,
	appLayout: Object,
	rowWithTriangleContainerStyle?: Array<any> | Object,
	triangleContainerStyle?: Array<any> | Object,
	triangleStyle?: Array<any> | Object,
};

type DefaultProps = {
	layout: 'row',
};

class RowWithTriangle extends Component<Props, null> {
	props: Props;

	static defaultProps: DefaultProps = {
		layout: 'row',
	};

	render(): Object {
		const { children, layout, containerStyle, style, rowWithTriangleContainerStyle, triangleStyle, triangleContainerStyle } = this.props;

		const {
			container,
			triangleContainer,
			triangleCommon,
			triangleShadow,
			triangle,
			rowContainer,
			row,
		} = this._getStyle();
		let styles = {...row, ...style};
		return (
			<View style={[container, rowWithTriangleContainerStyle]}>
				<View style={[triangleContainer, triangleContainerStyle]}>
					<Image
						source={{uri: 'triangle_shadow'}}
						style={[triangleCommon, triangleShadow, triangleStyle]}
					/>
					<Image
						source={{uri: 'triangle'}}
						style={[triangleCommon, triangle, triangleStyle]}
					/>
				</View>
				<Row
					layout={layout}
					containerStyle={[rowContainer, containerStyle]}
					style={styles}
				>
					{children}
				</Row>
			</View>
		);
	}

	_getStyle = (): Object => {
		const { triangleColor, colors } = this.props;
		const deviceWidth = this.props.appLayout.width;

		const _triangleColor = triangleColor || colors.inAppBrandSecondary;

		const triangleWidth = deviceWidth * 0.022666667;
		const triangleHeight = deviceWidth * 0.025333334;

		return {
			container: {
				flexDirection: 'row',
				alignItems: 'center',
				width: deviceWidth * 0.673333334,
			},
			triangleContainer: {
				width: triangleWidth,
				height: triangleHeight,
				zIndex: 3,
				elevation: 2,
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
				tintColor: _triangleColor,
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

function mapStateToProps(state: Object, ownProps: Object): Object {
	return {
		appLayout: state.app.layout,
	};
}

module.exports = (connect(mapStateToProps, null)(withTheme(RowWithTriangle)): Object);
