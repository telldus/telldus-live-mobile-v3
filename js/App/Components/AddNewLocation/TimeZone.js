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
import { TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { defineMessages } from 'react-intl';
const DeviceInfo = require('react-native-device-info');

import Theme from 'Theme';
import {activateGateway} from 'Actions';

import {
	View,
	FormattedMessage,
	ScreenContainer,
	StyleSheet,
	Dimensions,
	Text,
	Icon,
	Modal,
} from 'BaseComponents';
import Banner from './Banner';
import NotificationComponent from '../PreLoginScreens/SubViews/NotificationComponent';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;


const messages = defineMessages({
	banner: {
		id: 'addNewLocation.timeZone.banner',
		defaultMessage: 'Time Zone',
		description: 'Main Banner Text for the Select City Screen',
	},
	bannerSub: {
		id: 'addNewLocation.timeZone.bannerSub',
		defaultMessage: 'Select Time Zone',
		description: 'Secondary Banner Text for the Select City Screen',
	},
	hint: {
		id: 'addNewLocation.timeZone.hint',
		defaultMessage: 'Autodetected',
		description: 'hint text for user',
	},
});

type Props = {
	timeZone: string,
	navigation: Object,
	dispatch: Function,
	showModal: boolean,
	modalMessage: string,
	modalExtra: string,
	activateGateway: (clientInfo: Object) => void;
}

type State = {
	timeZone: string,
}

class TimeZone extends View<void, Props, State> {

	props: Props;
	state: State;

	onTimeZoneSubmit: () => void;
	onEditTimeZone: () => void;
	getTimeZone: () => Object;
	closeModal: () => void;

	constructor(props: Props) {
		super(props);
		let {timeZone, autoDetected} = this.getTimeZone();
		this.state = {
			timeZone,
			autoDetected,
		};
		this.onTimeZoneSubmit = this.onTimeZoneSubmit.bind(this);
		this.onEditTimeZone = this.onEditTimeZone.bind(this);
		this.closeModal = this.closeModal.bind(this);
	}

	getTimeZone(): Object {
		let clientInfo = this.props.navigation.state.params.clientInfo;
		let timeZone = clientInfo.timezone ? clientInfo.timezone : DeviceInfo.getTimezone();
		let autoDetected = clientInfo.timezone ? false : true;
		return {timeZone, autoDetected};
	}

	onTimeZoneSubmit() {
		let clientInfo = this.props.navigation.state.params.clientInfo;
		clientInfo.timezone = this.state.timeZone;
		this.props.activateGateway(clientInfo);
	}

	onEditTimeZone() {
		let clientInfo = this.props.navigation.state.params.clientInfo;
		this.props.navigation.navigate('TimeZoneContinent', {clientInfo});
	}

	closeModal() {
		this.props.dispatch({
			type: 'REQUEST_MODAL_CLOSE',
		});
	}

	render() {

		let bannerProps = {
			prefix: '3. ',
			bannerMain: messages.banner,
			bannerSub: messages.bannerSub,
		};
		let BannerComponent = Banner(bannerProps);

		return (
			<ScreenContainer banner={BannerComponent}>
				<View style={[styles.itemsContainer, styles.shadow]}>
					<FormattedMessage {...messages.banner} style={styles.title}/>
					<View style={styles.timeZoneContainer}>
						<Text style={styles.timeZone}>
							{this.state.timeZone}
						</Text>
						<TouchableWithoutFeedback onPress={this.onEditTimeZone} style={{height: 20, width: 20}}>
							<Icon name="pencil" size={16} color="#A59F9A" style={{marginTop: 7}}/>
						</TouchableWithoutFeedback>
					</View>
					{this.state.autoDetected ?
						<Text style={styles.hint}>
						(
							<FormattedMessage {...messages.hint} style={styles.hint}/>
						)
						</Text>
						:
						null
					}
				</View>
				<View style={styles.circularViewContainer}>
					<TouchableWithoutFeedback onPress={this.onTimeZoneSubmit}>
						<View style={styles.circularView}>
							<Icon name="angle-right" size={44} color="#ffffff"/>
						</View>
					</TouchableWithoutFeedback>
				</View>
				<Modal
					modalStyle={[Theme.Styles.notificationModal, {top: deviceHeight * 0.22, elevation: 4}]}
					entry= "ZoomIn"
					exit= "ZoomOut"
					entryDuration= {300}
					exitDuration= {100}
					showModal={this.props.showModal}>
					<NotificationComponent text={this.props.modalMessage} onPress={this.closeModal} />
				</Modal>
			</ScreenContainer>
		);
	}
}

const styles = StyleSheet.create({
	itemsContainer: {
		flexDirection: 'column',
		backgroundColor: '#fff',
		marginTop: 20,
		paddingLeft: 20,
		paddingRight: 20,
		paddingBottom: 20,
		paddingTop: 20,
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
	timeZoneContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		paddingTop: 5,
		paddingBottom: 5,
	},
	timeZone: {
		color: '#00000099',
		fontSize: 20,
		paddingLeft: 2,
		marginRight: 10,
	},
	hint: {
		color: '#A59F9A',
		fontSize: 14,
		paddingLeft: 2,
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

function mapDispatchToProps(dispatch): Object {
	return {
		activateGateway: (clientInfo) => dispatch(activateGateway(clientInfo)),
		dispatch,
	};
}

function mapStateToProps(store, ownProps) {
	return {
		showModal: store.modal.openModal,
		modalMessage: store.modal.data,
		modalExtra: store.modal.extras,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(TimeZone);
