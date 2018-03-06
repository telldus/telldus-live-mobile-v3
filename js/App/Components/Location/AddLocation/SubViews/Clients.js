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
import { View, Image } from '../../../../../BaseComponents';
import { defineMessages } from 'react-intl';
import { isIphoneX } from 'react-native-iphone-x-helper';

import getLocationImageUrl from '../../../../Lib/getLocationImageUrl';
import DeviceLocationDetail from '../../../DeviceDetails/SubViews/DeviceLocationDetail';

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
	appLayout: Object,
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
		let { appLayout } = this.props;
		let locationImageUrl = getLocationImageUrl(this.props.client.type);
		let locationData = {
			title: this.boxTitle,
			image: locationImageUrl,
			H1: this.props.client.type,
			H2: this.boxHeaderTwo,
			onPress: this.onPress,
		};

		const styles = this.getStyle(appLayout);
		const accessibilityLabel = `${this.boxTitle}, ${this.props.client.type}`;

		return (
			<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}} accessible={true} accessibilityLabel={accessibilityLabel}>
				<View style={styles.arrow}>
					<Image source={require('../../../TabViews/img/right-arrow-key.png')} style={{tintColor: '#A59F9A90'}}/>
				</View>
				<DeviceLocationDetail {...locationData} accessible={false} style={styles.locationDetails}/>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const padding = isIphoneX() ? (!isPortrait ? width * 0.1 : width * 0.055) : width * 0.06;
		const iconLeft = isIphoneX() ? (!isPortrait ? width * 0.82 : width * 0.845) : width * 0.845;

		return {
			arrow: {
				position: 'absolute',
				top: isPortrait ? height * 0.12 : width * 0.12,
				left: iconLeft,
				elevation: 3,
				zIndex: 1,
			},
			locationDetails: {
				marginVertical: 10,
				width: width - padding,
			},
		};
	}
}

