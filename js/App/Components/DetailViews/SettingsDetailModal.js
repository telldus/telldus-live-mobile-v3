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
import { connect } from 'react-redux';

import { Container, Text, View, Icon, TouchableButton } from 'BaseComponents';
import { StyleSheet } from 'react-native';
import { logoutFromTelldus } from 'Actions';
import Modal from 'react-native-modal';
const DeviceInfo = require('react-native-device-info');

import Theme from 'Theme';
import { pushServiceId } from '../../../Config';
import { registerPushToken, unregisterPushToken } from 'Actions_User';

const Header = ({ onPress }) => (
	<View style={styles.header}>
		<Icon name="gear" size={26} color="white"
		      style={styles.gear}/>
		<Text ellipsizeMode="middle" style={styles.textHeaderTitle}>
			{'Settings'}
		</Text>
		<Icon name="close" size={26} color="white" style={{ flex: 1 }} onPress={onPress}/>
	</View>
);

const StatusView = () => (
	<Text style={styles.statusText}>
	You have subscribed for telldus notification.
	</Text>
);

type Props = {
	isVisible: boolean,
	onClose: () => void,
	onLogout: () => void,
	onSubmitPushToken: () => void,
	store: Object,
};


type State = {
	isVisible: boolean,
};

class SettingsDetailModal extends View {
	props: Props;
	state: State;

	logout: () => void;
	postLoadMethod: () => void;
	submitPushToken: () => void;
	updateModalVisiblity: () => void;

	constructor(props) {
		super(props);
		this.state = {
			isVisible: this.props.isVisible,
			isPushSubmitLoading: false,
			isLogoutLoading: false,
		};
		this.logout = this.logout.bind(this);
		this.postLoadMethod = this.postLoadMethod.bind(this);
		this.submitPushToken = this.submitPushToken.bind(this);
		this.updateModalVisiblity = this.updateModalVisiblity.bind(this);
	}

	logout() {
		this.setState({
			isLogoutLoading: true,
		});
		this.props.onLogout(this.props.store.user.pushToken, this.postLoadMethod);
	}

	postLoadMethod(type) {
		if (type === 'REG_TOKEN') {
			this.setState({
				isPushSubmitLoading: false,
			});
		}
		if (type === 'LOGOUT') {
			this.setState({
				isLogoutLoading: false,
			});
		}
	}

	updateModalVisiblity() {
		this.props.onClose();
	}

	render() {
		let submitButText = this.state.isPushSubmitLoading ? 'Submitting Token...' : 'Submit Push Token';
		let logoutButText = this.state.isLogoutLoading ? 'Logging Out...' : 'Logout';
		let version = DeviceInfo.getVersion();
		return (
			<Modal isVisible={this.state.isVisible} onModalHide={this.updateModalVisiblity}>
				<Container style={styles.container}>
					<Header onPress={this.props.onClose}/>
					<View style={styles.body}>
						{ this.props.store.user.notificationText ?
							<Text style={styles.notification}>{this.props.store.user.notificationText}</Text>
							:
							null
						}
						<Text style={styles.versionInfo}>
							{`You are using version ${version} of Telldus Live! mobile.`}
						</Text>
						{this.props.store.user.pushToken && !this.props.store.user.pushTokenRegistered ?
							<TouchableButton
								style={Theme.Styles.submitButton}
								onPress={this.submitPushToken}
								text={submitButText}
							/>
							:
							<StatusView/>
						}
						<TouchableButton
							style={Theme.Styles.submitButton}
							onPress={this.logout}
							text={logoutButText}
						/>
					</View>
				</Container>
			</Modal>
		);
	}

	submitPushToken() {
		this.setState({
			isPushSubmitLoading: true,
		});
		this.props.onSubmitPushToken(this.props.store.user.pushToken, this.postLoadMethod);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		margin: 10,
	},
	header: {
		height: 46,
		backgroundColor: '#1a355b',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	textHeaderTitle: {
		marginLeft: 8,
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
		flex: 8,
	},
	body: {
		flex: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	statusText: {
		justifyContent: 'center',
		alignItems: 'center',
		color: '#1a355b',
		fontSize: 14,
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	versionInfo: {
		color: '#1a355b',
		fontSize: 14,
		textAlign: 'center',
		textAlignVertical: 'center',
		width: 200,
		height: 45,
		marginVertical: 20,
	},
	gear: {
		flex: 1,
		marginLeft: 8,
	},
	notification: {
		padding: 7,
		marginTop: 10,
		marginLeft: 100,
		marginRight: 100,

		borderColor: '#f00',
		borderWidth: 1,
		borderRadius: 3,

		fontSize: 13,
		color: '#1a355b',
		textAlign: 'center',
		backgroundColor: '#ff000033',
	},
});

function mapStateToProps(store) {
	return {
		store,
	};
}

function mapDispatchToProps(dispatch, ownProps) {
	return {
		onClose: () => {
			dispatch({
				type: 'ERROR',
				message: {
					error: '',
					error_description: false,
				},
			});
			ownProps.onClose();
		},
		onSubmitPushToken: (token, callback) => {
			dispatch(registerPushToken(token, DeviceInfo.getBuildNumber(), DeviceInfo.getModel(), DeviceInfo.getManufacturer(), DeviceInfo.getSystemVersion(), DeviceInfo.getUniqueID(), pushServiceId))
				.then(() => {
					callback('REG_TOKEN');
				});
		},
		onLogout: (token, callback) => {
			dispatch(unregisterPushToken(token)).then(() => {
				dispatch(logoutFromTelldus());
				callback('LOGOUT');
			});
		},
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SettingsDetailModal);
