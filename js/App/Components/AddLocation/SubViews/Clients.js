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
import {View, Icon, StyleSheet, Dimensions} from 'BaseComponents';
import { defineMessages } from 'react-intl';

import getLocationImageUrl from '../../../Lib/getLocationImageUrl';
import {DeviceLocationDetail} from 'DeviceDetailsSubView';

let deviceWidth = Dimensions.get('window').width;
let deviceHeight = Dimensions.get('window').height;

const messages = defineMessages({
	locationDetected: {
		id: 'addNewLocation.locationDetected',
		defaultMessage: 'Location Detected',
		description: 'Header for which location a device belongs to',
	},
	labelBoxHeaderTwo: {
		id: 'addNewLocation.locationDetected.labelBoxHeaderTwo',
		defaultMessage: 'Click to activate',
		description: 'Secondary header for location details box',
	},
});

type Props = {
	onPress: Function,
	client: Object,
	intl: Object,
};

export default class Clients extends View {
	onPress: () => void;

	props: Props;

	constructor(props: Props) {
		super(props);
		this.onPress = this.onPress.bind(this);

		this.boxTitle = `${props.intl.formatMessage(messages.locationDetected)}:`;
		this.boxHeaderTwo = props.intl.formatMessage(messages.labelBoxHeaderTwo);
	}

	onPress() {
		if (this.props.onPress) {
			this.props.onPress(this.props.client);
		}
	}

	render() {
		let locationImageUrl = getLocationImageUrl(this.props.client.type);
		let locationData = {
			title: this.boxTitle,
			image: locationImageUrl,
			H1: this.props.client.name,
			H2: this.boxHeaderTwo,
			onPress: this.onPress,
		};
		return (
			<View style={{flex: 1}}>
				<Icon name="angle-right" size={44} color="#A59F9A90" style={styles.arrow}/>
				<DeviceLocationDetail {...locationData} style={{marginTop: 20}}/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	arrow: {
		position: 'absolute',
		top: deviceHeight * 0.12,
		left: deviceWidth * 0.823,
		elevation: 3,
	},
});
