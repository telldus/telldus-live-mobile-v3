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

import { View, Text } from 'BaseComponents';
import { StyleSheet, Dimensions, Image } from 'react-native';
import { BellButton } from 'TabViews_SubViews';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

type Props = {
  device: Object,
  locationData: Object,
  onBell: number => void,
};

class BellDeviceDetailModal extends View {
	props: Props;
	onBell : number => void;
	constructor(props: Props) {
		super(props);
		this.onBell = this.onBell.bind(this);
	}
	onBell() {
		this.props.onBell(this.props.device.id);
	}
	render() {
		const { device } = this.props;
		const { BELL } = device.supportedMethods;
		const { locationImageUrl, locationType, locationName } = this.props.locationData;

		let bellButton = null;

		if (BELL) {
			bellButton = <BellButton id={device.id} style={styles.bell} />;
		}

		return (
			<View style={styles.container}>
				<View style={styles.itemsContainer}>
					<View style={[styles.bellButtonContainer, styles.shadow]}>
						{bellButton}
					</View>
					<View style={[styles.shadow, styles.homeSweetHomeContainer]}>
						<View style={styles.locationImageContainer}>
							<Text style={styles.textLocation}>
								Location :
							</Text>
							<Image resizeMode={'stretch'} style={styles.locationImage} source={{ uri: locationImageUrl }} />
						</View>
						<View style={styles.locationTextContainer}>
							<Text numberOfLines={1} style={styles.textHSH}>
								{locationName}
							</Text>
							<Text numberOfLines={1} style={styles.textDeviceLocation}>
								{locationType}
							</Text>
						</View>
					</View>
				</View>
			</View>
		);
	}
}

BellDeviceDetailModal.propTypes = {
	locationData: React.PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
	container: {
		flex: 0,
		alignItems: 'center',
		justifyContent: 'center',
	},
	itemsContainer: {
		width: (deviceWidth - 20),
		justifyContent: 'center',
	},
	bellButtonContainer: {
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
	bell: {
		height: 36,
		marginHorizontal: 8,
		marginVertical: 16,
		justifyContent: 'center',
		alignItems: 'center',
	},
	homeSweetHomeContainer: {
		marginTop: 10,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'flex-start',
		flexDirection: 'row',
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

module.exports = BellDeviceDetailModal;
