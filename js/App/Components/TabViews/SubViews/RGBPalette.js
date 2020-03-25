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
import ButtonLoadingIndicator from './ButtonLoadingIndicator';

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
	offColorMultiplier: number,
	onColorMultiplier: number,
	methodRequested: string,
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
		const {
			displayedValue,
			rgb,
			isInState,
			fontSize,
			fontSizeIcon,
			isGatewayActive,
			onColorMultiplier,
			methodRequested,
		} = this.props;

		let mainColor = isInState === 'DIM' || isInState === 'RGB' && typeof rgb !== 'undefined' ? prepareMainColor(getMainColorRGB(rgb), onColorMultiplier) : '#eeeeee';
		let iconColor = isInState === 'DIM' || isInState === 'RGB' ? '#FFF' : prepareMainColor(getMainColorRGB(rgb), onColorMultiplier);

		mainColor = isGatewayActive ? mainColor : '#eeeeee';
		iconColor = isGatewayActive ? iconColor : '#a2a2a2';

		let dotColor = iconColor;

		return (
			<View style={[styles.palette, {
				backgroundColor: mainColor,
			}]}>
				{
					methodRequested === 'DIM' ?
						<ButtonLoadingIndicator style={styles.dot} color={dotColor}/>
						: null
				}
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
	dot: {
		position: 'absolute',
		top: 3,
		left: 3,
	},
});

module.exports = RGBPalette;
