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
	source?: number,
	appLayout: Object,
	source750: number,
	source1500: number,
	source3000: number,
	posterWidth?: number,
};

type DefaultProps = {
	source750: number,
	source1500: number,
	source3000: number,
};

class Poster extends Component<Props, null> {
	props: Props;

	static propTypes = {
		children: PropTypes.any,
		source: PropTypes.number,
	};

	static defaultProps: DefaultProps = {
		source750: require('../App/Components/TabViews/img/telldus-geometric-bg-750.png'),
		source1500: require('../App/Components/TabViews/img/telldus-geometric-bg-1500.png'),
		source3000: require('../App/Components/TabViews/img/telldus-geometric-bg-3000.png'),
	};

	constructor(props: Props) {
		super(props);
	}

	getImageSource(height: number): number {
		let { source750, source1500, source3000 } = this.props;
		switch (height) {
			case height > 700 && height < 1400:
				return source1500;
			case height >= 1400:
				return source3000;
			default:
				return source750;
		}
	}

	render(): Object {
		const { children, appLayout, source } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceHeight = isPortrait ? height : width;

		let imageSource = source;
		if (!imageSource) {
			imageSource = this.getImageSource(deviceHeight);
		}

		const { image, mask } = this._getStyle(appLayout);
		return (
			<View style={mask}>
				<Image source={imageSource} style={image}/>
				{!!children && children}
			</View>
		);
	}

	_getStyle = (appLayout: Object): Object => {
		let { posterWidth } = this.props;
		console.log('TEST IN posterWidth ONE', posterWidth);
		const { height, width } = appLayout;
		const isPortrait = height > width;
		posterWidth = posterWidth ? posterWidth : width;
		console.log('TEST IN posterWidth', posterWidth);
		return {
			image: {
				flex: 1,
				height: undefined,
				...ifIphoneX({width: '100%'}, {width: posterWidth}),
				resizeMode: 'cover',
			},
			mask: {
				borderWidth: 0,
				height: isPortrait ? width * 0.333333333 : height * 0.333333333,
				...ifIphoneX({width: '100%'}, {width: posterWidth}),
				overflow: 'hidden',
			},
		};
	};

}

function mapStateToProps(state: Object, ownProps: Object): Object {
	return {
		appLayout: state.App.layout,
	};
}

export default connect(mapStateToProps, null)(Poster);
