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
import React from 'react';
import { connect } from 'react-redux';
import { ColorWheel } from 'react-native-color-wheel';
const colorsys = require('colorsys');

import {
	View,
} from '../../../BaseComponents';

import { deviceSetStateRGB } from '../../Actions/Devices';
import { getMainColorRGB } from '../../Lib/rgbUtils';

type Props = {
	device: Object,
	deviceSetStateRGB: (id: number, r: number, g: number, b: number) => void,
    appLayout: Object,

    style?: Array<any> | Object | number,
    thumStyle?: Array<any> | Object | number,
    thumbSize?: number,
};

type DefaultProps = {
    thumbSize: number,
};

class RGBColorWheel extends View<Props, null> {
props: Props;
static defaultProps: DefaultProps = {
	thumbSize: 15,
};

	onColorChangeComplete: string => void;

	constructor(props: Props) {
		super(props);
		this.onColorChangeComplete = this.onColorChangeComplete.bind(this);
	}

	onColorChangeComplete(color: string) {
		if (!color) {
			return;
		}
		const { device } = this.props;
		const rgb = colorsys.hsvToRgb(color);
		const { r, g, b } = rgb;
		this.props.deviceSetStateRGB(device.id, r, g, b);
	}

	render(): Object {
		const {
			device,
			thumStyle,
			colorWheel,
			thumbSize,
		} = this.props;
		const { RGB: rgbValue } = device.stateValues;
		const mainColorRGB = getMainColorRGB(rgbValue);

		return (
			<ColorWheel
				initialColor={mainColorRGB}
				onColorChangeComplete={this.onColorChangeComplete}
				style={colorWheel}
				thumbStyle={thumStyle}
				thumbSize={thumbSize}
			/>
		);
	}

	getStyles(): Object {
		return {
		};
	}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		deviceSetStateRGB: (id: number, r: number, g: number, b: number) => {
			dispatch(deviceSetStateRGB(id, r, g, b));
		},
	};
}

export default connect(null, mapDispatchToProps)(RGBColorWheel);
