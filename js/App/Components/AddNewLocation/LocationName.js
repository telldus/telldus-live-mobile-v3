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
import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icon_location from '../TabViews/img/selection.json';
const CustomIcon = createIconSetFromIcoMoon(icon_location);

import StackScreenContainer from 'StackScreenContainer';
import NotificationComponent from '../PreLoginScreens/SubViews/NotificationComponent';
import Banner from './Banner';
import {View, StyleSheet, FormattedMessage, Dimensions, Icon, Modal} from 'BaseComponents';
import Theme from 'Theme';

let deviceWidth = Dimensions.get('window').width;

const messages = defineMessages({
	locationName: {
		id: 'addNewLocation.locationName',
		defaultMessage: 'Name',
		description: 'Label for the field Location Name',
	},
	bannerSub: {
		id: 'addNewLocation.locationName.bannerSub',
		defaultMessage: 'Setup your TellStick to start',
		description: 'Secondary Banner Text for the Location Detected Screen',
	},
});
type Props = {
	navigation: Object,
}

class LocationName extends View {
	props: Props;

	onLocationNameChange: (string) => void;
	onNameSubmit: () => void;
	closeModal: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			locationName: '',
			showModal: false,
		};
		this.onLocationNameChange = this.onLocationNameChange.bind(this);
		this.onNameSubmit = this.onNameSubmit.bind(this);
		this.closeModal = this.closeModal.bind(this);
	}

	onLocationNameChange(locationName) {
		this.setState({
			locationName,
		});
	}

	onNameSubmit() {
		if (this.state.locationName !== '') {
			let navigation = this.props.navigation;
			let clientInfo = {
				clientId: navigation.state.params.clientInfo.clientId,
				uuid: navigation.state.params.clientInfo.uuid,
				name: this.state.locationName,
			};
			this.props.navigation.navigate('TimeZoneContinent', {clientInfo});
		} else {
			// using the local state to control Modal as it is a local validation, not using the action/reducer.
			this.setState({
				showModal: true,
			});
		}
	}

	closeModal() {
		this.setState({
			showModal: false,
		});
	}

	render() {
		let bannerProps = {
			prefix: '2. ',
			bannerMain: messages.locationName,
			bannerSub: messages.bannerSub,
		};
		let BannerComponent = Banner(bannerProps);
		return (
			<StackScreenContainer banner={BannerComponent}>
				<KeyboardAvoidingView behavior="position" contentContainerStyle={{justifyContent: 'center'}}>
					<View style={styles.container}>
						<View style={[styles.itemsContainer, styles.shadow]}>
							<FormattedMessage {...messages.locationName} style={styles.title}/>
							<CustomIcon name="icon_location" size={34} color="#A59F9A" style={styles.locationIcon}/>
							<TextInput
								style={styles.textField}
								onChangeText={this.onLocationNameChange}
								autoCapitalize="none"
								autoCorrect={false}
								underlineColorAndroid="#e26901"
								defaultValue={this.state.locationName}
							/>
						</View>
					</View>
				</KeyboardAvoidingView>
				<View style={styles.circularViewContainer}>
					<TouchableWithoutFeedback onPress={this.onNameSubmit}>
						<View style={styles.circularView}>
							<Icon name="angle-right" size={44} color="#ffffff"/>
						</View>
					</TouchableWithoutFeedback>
				</View>
				<Modal
					modalStyle={[Theme.Styles.notificationModal, {top: 120}]}
					entry= "ZoomIn"
					exit= "ZoomOut"
					entryDuration= {300}
					exitDuration= {100}
					showModal={this.state.showModal}>
					<NotificationComponent text={'Please enter a valid name.'} onPress={this.closeModal} />
				</Modal>
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
		paddingLeft: 35,
		color: '#A59F9A',
		fontSize: 20,
	},
	locationIcon: {
		position: 'absolute',
		top: 35,
		left: 8,
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

export default connect()(LocationName);
