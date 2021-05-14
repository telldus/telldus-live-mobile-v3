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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import View from './View';
import GeometricHeader from './GeometricHeader';

type Props = {
	children?: any,
	appLayout: Object,
	posterWidth?: number,
	posterHeight?: number,
};

class Poster extends Component<Props, null> {
	props: Props;

	static propTypes = {
		children: PropTypes.any,
	};

	constructor(props: Props) {
		super(props);
	}

	render(): Object {
		const { children, appLayout } = this.props;

		const { mask, headerHeight, headerWidth } = this._getStyle(appLayout);
		return (
			<View style={mask}>
				<GeometricHeader headerHeight={Math.ceil(headerHeight)} headerWidth={Math.ceil(headerWidth)} style={{
					marginTop: -2, // TODO: this is a work around for a very narrow line shown on top
					// of the image. Investigate and give a proper fix.
				}}/>
				{!!children && children}
			</View>
		);
	}

	_getStyle = (appLayout: Object): Object => {
		let { posterWidth, posterHeight } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		posterWidth = posterWidth ? posterWidth : width;
		posterHeight = posterHeight ? posterHeight : deviceWidth * 0.333333333;

		return {
			image: {
				resizeMode: 'cover',
			},
			headerHeight: posterHeight,
			headerWidth: posterWidth,
			mask: {
				borderWidth: 0,
				height: posterHeight,
				width: '100%',
				overflow: 'hidden',
			},
		};
	};

}

function mapStateToProps(state: Object, ownProps: Object): Object {
	return {
		appLayout: state.app.layout,
	};
}

export default (connect(mapStateToProps, null)(Poster): Object);
