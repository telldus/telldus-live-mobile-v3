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

import { FormattedMessage, Text, View } from 'BaseComponents';
import { StyleSheet, Image, Dimensions } from 'react-native';
import { defineMessages } from 'react-intl';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const messages = defineMessages({
	location: {
		id: 'deviceSettings.location',
		defaultMessage: 'Location',
		description: 'Header for which location a device belongs to',
	},
});

type Props = {
	locationImageUrl: string,
	locationName: string,
	locationType: string,
};

type State = {
};

class DeviceLocationDetail extends View {
	props: Props;
	state: State;

	constructor(props: Props) {
		super(props);
		this.state = {
		};
	}

	render(): React$Element<any> {
		return (
			<View style={[styles.shadow, styles.homeSweetHomeContainer]}>
				<View style={styles.locationImageContainer}>
					<Text style={styles.textLocation}>
						<FormattedMessage {...messages.location} style={styles.textLocation} />:
					</Text>
					<Image resizeMode={'contain'} style={styles.locationImage} source={{ uri: this.props.locationImageUrl, isStatic: true }} />
				</View>
				<View style={styles.locationTextContainer}>
					<Text numberOfLines={1} style={styles.textHSH}>
						{this.props.locationName}
					</Text>
					<Text numberOfLines={1} style={styles.textLocation}>
						{this.props.locationType}
					</Text>
				</View>
			</View>
		);
	}
}

DeviceLocationDetail.propTypes = {
	locationImageUrl: React.PropTypes.string.isRequired,
	locationName: React.PropTypes.string.isRequired,
	locationType: React.PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
	homeSweetHomeContainer: {
		marginTop: 10,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'flex-start',
		flexDirection: 'row',
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
	locationImageContainer: {
		height: (deviceHeight * 0.2),
		width: (deviceWidth - 20) * 0.3,
		justifyContent: 'center',
		alignItems: 'flex-start',
		flexDirection: 'column',
	},
	locationTextContainer: {
		width: (deviceWidth - 20) * 0.7,
		height: (deviceHeight * 0.2),
		justifyContent: 'center',
		alignItems: 'flex-start',
		paddingTop: 35,
	},
	locationImage: {
		width: (deviceWidth * 0.22),
		height: (deviceHeight * 0.12),
		alignItems: 'flex-start',
		marginLeft: 5,
	},
	textLocation: {
		color: '#A59F9A',
		fontSize: 14,
		paddingLeft: 10,
	},
	textHSH: {
		color: '#F06F0C',
		fontSize: 18,
	},
	textDeviceLocation: {
		color: '#A59F9A',
		fontSize: 14,
	},
});

module.exports = DeviceLocationDetail;
