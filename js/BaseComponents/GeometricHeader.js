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

import GeoHeader from '../App/Components/TabViews/img/telldus_geometric_bg.svg';

type Props = {
	headerHeight: number,
    headerWidth: number,

    style?: number | Object | Array<Object>,
};

type defaultProps = {
	headerHeight: number,
	headerWidth: number,
};

export default class GeometricHeader extends Component<Props, null> {
props: Props;
static defaultProps: defaultProps = {
	headerHeight: 20,
	headerWidth: 100,
}

ORIGINAL_SIZE: {
	width: number,
	height: number,
};

constructor(props: Props) {
	super();

	this.ORIGINAL_SIZE = {
		height: 400,
		width: 960,
	};
}

prepareSize(): Object {
	const {
		headerWidth,
	} = this.props;
	const {
		height,
		width,
	} = this.ORIGINAL_SIZE;

	let requiredHeight = Math.ceil((headerWidth / width) * height);
	return {
		width: headerWidth,
		height: requiredHeight,
	};
}

render(): Object {
	let {
		style,
	} = this.props;

	const {
		height,
		width,
	} = this.prepareSize();

	return (
		<GeoHeader style={style} height={height} width={width}/>
	);
}
}

