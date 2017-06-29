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

import { View } from 'BaseComponents';
import { StyleSheet, Dimensions } from 'react-native';

const deviceHeight = Dimensions.get('window').height;

import { NavigationalButton } from 'TabViews_SubViews';

type Props = {
	device: Object,
};

class NavigationalDeviceDetailModal extends View {
	props: Props;

	constructor(props: Props) {
		super(props);
	}

	render() {
		const { device } = this.props;
		const { UP, DOWN, STOP } = device.supportedMethods;
		let navigationButtons = null;

		if (UP || DOWN || STOP) {
			navigationButtons = <NavigationalButton device={device} style={styles.navigation} />;
		}

		return (
			<View style={styles.container}>
				<View style={[styles.navButtonsContainer, styles.shadow]}>
					{navigationButtons}
				</View>
			</View>
		);
	}
}

NavigationalDeviceDetailModal.propTypes = {
	device: React.PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
	container: {
		flex: 0,
	},
	navButtonsContainer: {
		flex: 0,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#fff',
		marginTop: 20,
		height: (deviceHeight * 0.2),
	},
	shadow: {
		borderRadius: 4,
		backgroundColor: '#fff',
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowRadius: 1,
		shadowOpacity: 1.0,
		elevation: 2,
	},
	navigation: {
		flexDirection: 'row',
		height: 36,
		marginHorizontal: 8,
		marginVertical: 16,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

module.exports = NavigationalDeviceDetailModal;
