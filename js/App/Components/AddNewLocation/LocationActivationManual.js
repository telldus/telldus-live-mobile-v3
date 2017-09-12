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
import { connect } from 'react-redux';
import { TextInput, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native';
import { defineMessages } from 'react-intl';

import StackScreenContainer from 'StackScreenContainer';
import Banner from './Banner';
import {View, StyleSheet, FormattedMessage, Text, Dimensions, Icon} from 'BaseComponents';

let deviceWidth = Dimensions.get('window').width;

const messages = defineMessages({
	activationCode: {
		id: 'addNewLocation.activateManual',
		defaultMessage: 'Activation Code',
		description: 'Label for the field Location Manual Activate Field',
	},
	banner: {
		id: 'addNewLocation.activateManual.banner',
		defaultMessage: 'Select Location',
		description: 'Main Banner Text for the Location Manual Activate Screen',
	},
	bannerSub: {
		id: 'addNewLocation.activateManual.bannerSub',
		defaultMessage: 'Enter Activation Code',
		description: 'Main Banner Text for the Location Manual Activate Screen',
	},
});
type Props = {
	navigation: Object,
}

class LocationActivationManual extends View {
	props: Props;

	onActivationCodeChange: (string) => void;
	onActivationCodeSubmit: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			activationCode: '',
		};

		this.onActivationCodeChange = this.onActivationCodeChange.bind(this);
		this.onActivationCodeSubmit = this.onActivationCodeSubmit.bind(this);
	}

	onActivationCodeChange(activationCode: string) {
		this.setState({
			activationCode,
		});
	}

	onActivationCodeSubmit() {
		this.props.navigation.navigate('LocationName');
	}

	render() {
		let bannerProps = {
			prefix: '1. ',
			bannerMain: messages.banner,
			bannerSub: messages.bannerSub,
		};
		let BannerComponent = Banner(bannerProps);
		return (
			<StackScreenContainer banner={BannerComponent}>
				<KeyboardAvoidingView behavior="position" contentContainerStyle={{justifyContent: 'center'}}>
					<View style={styles.container}>
						<View style={[styles.itemsContainer, styles.shadow]}>
							<FormattedMessage {...messages.activationCode} style={styles.title}/>
							<TextInput
								style={styles.textField}
								onChangeText={this.onActivationCodeChange}
								autoCapitalize="none"
								autoCorrect={false}
								underlineColorAndroid="#e26901"
								defaultValue={this.state.activationCode}
							/>
							<Text style={styles.textBody}>Activate your TellStick by typing the activation code. The activation code
							is written on the label on the bottom of your TellStick.
							</Text>
						</View>
					</View>
				</KeyboardAvoidingView>
				<View style={styles.circularViewContainer}>
					<TouchableWithoutFeedback onPress={this.onActivationCodeSubmit}>
						<View style={styles.circularView}>
							<Icon name="angle-right" size={44} color="#ffffff"/>
						</View>
					</TouchableWithoutFeedback>
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
		flexDirection: 'column',
		backgroundColor: '#fff',
		marginTop: 20,
		paddingLeft: 10,
		paddingRight: 10,
		paddingBottom: 10,
		paddingTop: 10,
		alignItems: 'flex-start',
		width: (deviceWidth - 20),
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
	title: {
		color: '#e26901',
		fontSize: 14,
		paddingLeft: 2,
	},
	textBody: {
		color: '#A59F9A',
		marginTop: 10,
		textAlign: 'left',
		fontSize: 13,
		paddingLeft: 2,
	},
	textField: {
		height: 50,
		width: deviceWidth - 40,
	},
	circularViewContainer: {
		width: (deviceWidth - 20),
		alignItems: 'flex-end',
		justifyContent: 'flex-end',
		flex: 1,
		marginBottom: 20,
	},
	circularView: {
		height: 50,
		width: 50,
		borderRadius: 50,
		backgroundColor: '#e26901',
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 0,
		},
		alignItems: 'center',
		justifyContent: 'center',
		shadowRadius: 50,
		shadowOpacity: 1.0,
		elevation: 25,
	},
});

export default connect()(LocationActivationManual);
