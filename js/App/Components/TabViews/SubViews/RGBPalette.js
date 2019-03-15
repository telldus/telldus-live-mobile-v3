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

import { View, IconTelldus } from '../../../../BaseComponents';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';

// Relative import
import Theme from '../../../Theme';

type Props = {
	openRGBModel: () => void,
	device: Object,
	isGatewayActive: boolean,
};

class RGBPalette extends View {
	props: Props;

	onPalette: () => void;

	constructor(props: Props) {
		super(props);
	}

	onPalette = () => {
		const { openRGBModel } = this.props;
		openRGBModel();
	}

	render(): Object {
		let { device, isGatewayActive } = this.props;
		let { value } = device;
		let iconColor = !isGatewayActive ? '#a2a2a2' : Theme.Core.brandSecondary;

		return (
			<TouchableOpacity onPress={this.onPalette} style={[styles.palette]}>
				<IconTelldus icon="palette" size={22} color={iconColor} /><Text style={styles.lbl}>{`${value}%`}</Text>
			</TouchableOpacity>
		);
	}
}

const styles = StyleSheet.create({
	palette: {
		justifyContent: 'center',
		alignItems: 'center',
		width: Theme.Core.buttonWidth,
		height: Theme.Core.rowHeight,
		borderLeftWidth: 1,
		backgroundColor: '#21A296',
		borderLeftColor: '#ddd',
	},
	lbl: {
		color: '#FFF',
		fontSize: 14,
	},
});

module.exports = RGBPalette;
