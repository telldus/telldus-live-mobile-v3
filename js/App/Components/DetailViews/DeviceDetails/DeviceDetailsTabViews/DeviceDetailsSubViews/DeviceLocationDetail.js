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
import { StyleSheet, Image, Dimensions, TouchableWithoutFeedback } from 'react-native';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

type Props = {
	title?: any,
	image: String,
	H1: String,
	H2: String,
	style: any,
	onPress?: Function,
};

type State = {
};

class DeviceLocationDetail extends View {
	props: Props;
	state: State;

	onPress: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
		};

		this.onPress = this.onPress.bind(this);
	}

	onPress() {
		if (this.props.onPress) {
			if (typeof this.props.onPress === 'function') {
				this.props.onPress();
			} else {
				console.warn('Invalid Prop Passed : onPress expects a Function.');
			}
		}
	}

	render() {
		return (
			<View style={[styles.shadow, styles.container, this.props.style]}>
				{this.props.title && this.props.title !== '' ?
					<FormattedMessage {...this.props.title} style={styles.textLocation} />
					:
					null
				}
				<View style={styles.imageHeaderContainer}>
					<View style={styles.locationImageContainer}>
						<Image resizeMode={'contain'} style={styles.locationImage} source={{ uri: this.props.image, isStatic: true }} />
					</View>
					<TouchableWithoutFeedback onPress={this.onPress}>
						<View style={styles.locationTextContainer}>
							<Text numberOfLines={1} style={styles.textHSH}>
								{this.props.H1}
							</Text>
							<Text numberOfLines={1} style={styles.textLocation}>
								{this.props.H2}
							</Text>
						</View>
					</TouchableWithoutFeedback>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		backgroundColor: '#fff',
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 10,
	},
	imageHeaderContainer: {
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
		height: (deviceHeight * 0.16),
		width: (deviceWidth * 0.37),
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	locationTextContainer: {
		height: (deviceHeight * 0.16),
		width: (deviceWidth * 0.53),
		marginRight: 20,
		justifyContent: 'center',
		alignItems: 'flex-start',
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
