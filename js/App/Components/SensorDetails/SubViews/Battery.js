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

import React from 'react';

import { View } from '../../../../BaseComponents';

import Theme from '../../../Theme';

type Props = {
	value: number,
	appLayout: Object,
	style: any,
	padding: number,
	borderWidth: number,
	outerContainerStyle: Object,
	nobStyle: Object,
};

type DefaultProps = {
    padding: number,
    borderWidth: number,
};

type State = {
    height: number,
    width: number,
};

export default class Battery extends View<Props, State> {
props: Props;
state: State;

static defaultProps: DefaultProps = {
	borderWidth: 1,
	padding: 1,
};

onLayout: (ev: Object) => void;

constructor(props: Props) {
	super(props);

	this.state = {
		height: 1,
		width: 1,
	};

	this.onLayout = this.onLayout.bind(this);
}

onLayout(ev: Object) {
	const { height, width } = ev.nativeEvent.layout;
	this.setState({
		height,
		width,
	});
}

getFillHeightWidth(value: number): Object {
	const { height: cHeight, width: cWidth } = this.state;
	const { padding, borderWidth } = this.props;
	const space = (padding * 2) + (borderWidth * 2);
	const height = Math.floor(cHeight - space);
	const width = Math.floor((cWidth - space) * (value / 100));
	return { height, width};
}

render(): Object {
	const {
		value,
		appLayout,
		style,
		outerContainerStyle,
		nobStyle,
	} = this.props;
	const {
		outerContainerDef,
		containerStyle,
		nobStyleDef,
		backgroundColor,
		batteryFillStyle,
	} = this.getStyle(appLayout, value);

	const { height, width } = this.getFillHeightWidth(value);

	return (
		<View style={[outerContainerDef, outerContainerStyle]}>
			<View style={[containerStyle, {borderColor: backgroundColor}, style]} onLayout={this.onLayout}>
				<View style={[batteryFillStyle, {backgroundColor, height, width}]}/>
			</View>
			<View style={[nobStyleDef, {backgroundColor}, nobStyle]}/>
		</View>
	);
}

getStyle(appLayout: Object, value: number): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		brandDanger,
		brandWarning,
		brandSuccess,
		fontSizeFactorFour,
	} = Theme.Core;

	const batteryHeight = Math.floor(deviceWidth * fontSizeFactorFour);
	const batteryWidth = Math.floor(deviceWidth * 0.07);

	const { padding, borderWidth } = this.props;

	return {
		outerContainerDef: {
			flex: 0,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		containerStyle: {
			height: batteryHeight,
			width: batteryWidth,
			borderRadius: Math.floor(batteryHeight * 0.2),
			borderWidth: Math.floor(borderWidth),
			justifyContent: 'center',
			alignItems: 'flex-start',
			padding,
		},
		nobStyleDef: {
			height: Math.floor(batteryHeight * 0.5),
			width: Math.floor(batteryHeight * 0.2),
			overflow: 'hidden',
			borderTopRightRadius: Math.floor(batteryHeight * 0.2),
			borderBottomRightRadius: Math.floor(batteryHeight * 0.2),
		},
		batteryFillStyle: {
		},
		backgroundColor:
(value > 100 || value < 25) ? brandDanger : ((value >= 25 && value < 60) ? brandWarning : brandSuccess),
	};
}
}
