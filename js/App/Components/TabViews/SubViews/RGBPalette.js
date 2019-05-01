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

import { StyleSheet, Text } from 'react-native';

import { View, IconTelldus } from '../../../../BaseComponents';

import {
	getMainColorRGB,
	prepareMainColor,
} from '../../../Lib/rgbUtils';

type Props = {
	displayedValue: string,
	isGatewayActive: boolean,
	rgb: string,
	isInState: string,
	fontSize?: number,
	fontSizeIcon?: number,
};

type DefaultProps = {
	fontSize: number,
	fontSizeIcon: number,
};

class RGBPalette extends View<Props, null> {
	props: Props;

	static defaultProps: DefaultProps = {
		fontSize: 9,
		fontSizeIcon: 26,
	}

	constructor(props: Props) {
		super(props);
	}

	render(): Object {
		const { displayedValue, rgb, isInState, fontSize, fontSizeIcon } = this.props;

		let mainColor = isInState === 'DIM' || isInState === 'RGB' && typeof rgb !== 'undefined' ? getMainColorRGB(rgb, 10) : '#eeeeee';
		let iconColor = isInState === 'DIM' || isInState === 'RGB' ? '#FFF' : getMainColorRGB(rgb, 10);

		mainColor = prepareMainColor(mainColor);

		return (
			<View style={[styles.palette, {
				backgroundColor: mainColor,
			}]}>
				<IconTelldus icon="palette" size={fontSizeIcon} color={iconColor} />
				<Text style={[styles.lbl, { fontSize: fontSize, color: iconColor }]}>{`${displayedValue}%`}</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	palette: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	lbl: {
		marginTop: 3,
	},
});

module.exports = RGBPalette;
