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
import {ScrollView} from 'react-native';
import { connect } from 'react-redux';
import { defineMessages, intlShape, injectIntl } from 'react-intl';

import { View, StyleSheet, Dimensions, Icon, TouchableButton } from 'BaseComponents';
import {DeviceLocationDetail} from 'DeviceDetailsSubView';
import StackScreenContainer from 'StackScreenContainer';
import Banner from './Banner';

import getLocationImageUrl from '../../Lib/getLocationImageUrl';

let deviceWidth = Dimensions.get('window').width;
let deviceHeight = Dimensions.get('window').height;

const messages = defineMessages({
	locationDetected: {
		id: 'addNewLocation.locationDetected',
		defaultMessage: 'Location Detected',
		description: 'Header for which location a device belongs to',
	},
	banner: {
		id: 'addNewLocation.locationDetected.banner',
		defaultMessage: 'Select Location',
		description: 'Main Banner Text for the Location Detected Screen',
	},
	bannerSub: {
		id: 'addNewLocation.locationDetected.bannerSub',
		defaultMessage: 'Setup your TellStick to start',
		description: 'Seconday Banner Text for the Location Detected Screen',
	},
});

type Props = {
	navigation: Object,
	intl: intlShape.isRequired,
}

class LocationDetected extends View {
	props: Props;

	onActivateAuto: () => void;
	onActivateManual: () => void;

	constructor(props: Props) {
		super(props);
		this.onActivateAuto = this.onActivateAuto.bind(this);
		this.onActivateManual = this.onActivateManual.bind(this);
	}

	onActivateAuto() {
		this.props.navigation.navigate('LocationName');
	}

	onActivateManual() {
		this.props.navigation.navigate('LocationActivationManual');
	}

	render() {
		let bannerProps = {
			prefix: '1. ',
			bannerMain: messages.banner,
			bannerSub: messages.bannerSub,
		};
		let BannerComponent = Banner(bannerProps);
		let locationImageUrl = getLocationImageUrl('TellStick Net');
		let locationData = {
			title: messages.locationDetected,
			image: locationImageUrl,
			H1: 'TellStick',
			H2: 'Click to activate',
			onPress: this.onActivateAuto,
		};
		return (
			<StackScreenContainer banner={BannerComponent}>
				<View style={styles.container}>
					<ScrollView contentContainerStyle={styles.itemsContainer}>
						<Icon name="angle-right" size={44} color="#A59F9A90" style={styles.arrow} onPress={this.onActivateAuto}/>
						<DeviceLocationDetail {...locationData} style={styles.locationDetailStyle}/>
						<TouchableButton
							style={styles.button}
							onPress={this.onActivateManual}
							text={'Manual Activation'}
						/>
					</ScrollView>
				</View>
			</StackScreenContainer>
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
	button: {
		marginTop: 20,
		alignSelf: 'center',
	},
	arrow: {
		position: 'absolute',
		top: deviceHeight * 0.12,
		left: deviceWidth * 0.8,
		elevation: 3,
	},
});

function mapStateToProps(store, ownProps) {
	return {
		store,
	};
}

export default connect(mapStateToProps, null)(injectIntl(LocationDetected));

