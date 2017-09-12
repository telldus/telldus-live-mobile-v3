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
 *
 *
 */

// @flow

'use strict';

import React from 'react';
import { defineMessages } from 'react-intl';

import { View, StyleSheet, Dimensions } from 'BaseComponents';
import {DeviceLocationDetail} from 'DeviceDetailsSubView';

import getLocationImageUrl from '../../Lib/getLocationImageUrl';

let deviceWidth = Dimensions.get('window').width;

const messages = defineMessages({
	locationDetected: {
		id: 'deviceSettings.locationDetected',
		defaultMessage: 'Location Detected',
		description: 'Header for which location a device belongs to',
	},
});

export default class LocationDetected extends View {
	render() {
		let locationImageUrl = getLocationImageUrl('TellStick Net');
		let locationData = {
			title: messages.locationDetected,
			image: locationImageUrl,
			H1: 'TellStick',
			H2: 'Click to activate',
		};
		return (
			<View style={styles.container}>
				<View style={styles.itemsContainer}>
					<DeviceLocationDetail {...locationData} style={styles.locationDetailStyle}/>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	itemsContainer: {
		width: (deviceWidth - 20),
		justifyContent: 'center',
	},
	locationDetailStyle: {
		marginTop: 20,
	},
});


