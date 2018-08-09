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
import { Image } from 'react-native';
import View from './View';
import { ifIphoneX } from 'react-native-iphone-x-helper';

type Props = {
	children?: any,
	source?: number | Object,
	appLayout: Object,
	posterWidth?: number,
	posterHeight?: number,
};

type DefaultProps = {
	source: number | Object,
};

class Poster extends Component<Props, null> {
	props: Props;

	static propTypes = {
		children: PropTypes.any,
		source: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
	};

	static defaultProps: DefaultProps = {
		source: { uri: 'telldus_geometric_bg'},
	};

	constructor(props: Props) {
		super(props);
	}

	render(): Object {
		const { children, appLayout, source } = this.props;

		const { image, mask } = this._getStyle(appLayout);
		return (
			<View style={mask}>
				<Image source={source} style={image}/>
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
				height: posterHeight,
				...ifIphoneX({width: '100%'}, {width: posterWidth}),
				resizeMode: 'cover',
			},
			mask: {
				borderWidth: 0,
				height: posterHeight,
				...ifIphoneX({width: '100%'}, {width: posterWidth}),
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

export default connect(mapStateToProps, null)(Poster);
