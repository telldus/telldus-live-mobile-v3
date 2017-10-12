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
import { defineMessages } from 'react-intl';

import { FormattedMessage, Container, Text, View, Icon, TouchableButton } from 'BaseComponents';
import { StyleSheet } from 'react-native';
import { logoutFromTelldus } from 'Actions';
import type { Dispatch } from 'Actions_Types';
import Modal from 'react-native-modal';
const DeviceInfo = require('react-native-device-info');

import Theme from 'Theme';
import { pushServiceId } from '../../../Config';
import { registerPushToken, unregisterPushToken } from 'Actions_User';

import i18n from './../../Translations/common';

const messages = defineMessages({
	pushEnabled: {
		id: 'settings.pushEnabled',
		defaultMessage: 'Device subscribed for push notifications.',
		description: 'Message in the settings window shown if app is registered for push notifications, in settings view',
	},
	pushRegister: {
		id: 'settings.pushRegister',
		defaultMessage: 'Register for push notifications',
		description: 'Message in the settings window shown if the app was not registered for push notifications, in settings view',
	},
	pushRegisters: {
		id: 'settings.pushRegisters',
		defaultMessage: 'Registers for push notifications',
		description: 'Message in the settings window shown when registrating for push notifications',
	},
	version: {
		id: 'version',
		defaultMessage: 'version',
	},
});

const Header = ({ onPress }: Object): React$Element<any> => (
	<View style={styles.header}>
		<Icon name="gear" size={26} color="white"
		      style={styles.gear}/>
		<Text ellipsizeMode="middle" style={styles.textHeaderTitle}>
			<FormattedMessage {...i18n.settingsHeader} style={styles.textHeaderTitle}/>
		</Text>
		<Icon name="close" size={26} color="white" style={{ flex: 1 }} onPress={onPress}/>
	</View>
);

const StatusView = (): React$Element<any> => (
	<Text style={styles.statusText}>
		<FormattedMessage {...messages.pushEnabled} style={styles.statusText} />
	</Text>
);

type Props = {
	isVisible: boolean,
	onClose: () => void,
	onLogout: (string, (string) => void) => void,
	onSubmitPushToken: (string, (string) => void) => void,
	pushToken: string,
	pushTokenRegistered: boolean,
	notificationText: string,
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

	constructor(props: Props) {
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
		this.props.onLogout(this.props.pushToken, this.postLoadMethod);
	}

	postLoadMethod(type: string) {
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

	render(): React$Element<any> {
		let submitButText = this.state.isPushSubmitLoading ? messages.pushRegisters : messages.pushRegister;
		let logoutButText = this.state.isLogoutLoading ? i18n.loggingout : i18n.logout;
		let version = DeviceInfo.getVersion();
		return (
			<Modal isVisible={this.state.isVisible} onModalHide={this.updateModalVisiblity}>
				<Container style={styles.container}>
					<Header onPress={this.props.onClose}/>
					<View style={styles.body}>
						{ this.props.notificationText ?
							<Text style={styles.notification}>{this.props.notificationText}</Text>
							:
							null
						}
						<Text style={styles.versionInfo}>
							Telldus Live! mobile{'\n'}
							<FormattedMessage {...messages.version} style={styles.versionInfo}/> {version}
						</Text>
						{this.props.pushToken && !this.props.pushTokenRegistered ?
							<TouchableButton
								style={Theme.Styles.submitButton}
								onPress={this.submitPushToken}
								text={submitButText}
								postScript={this.state.isPushSubmitLoading ? '...' : null}
							/>
							:
							<StatusView/>
						}
						<View style={{height: 20}} />
						<TouchableButton
							style={Theme.Styles.submitButton}
							onPress={this.logout}
							text={logoutButText}
							postScript={this.state.isLogoutLoading ? '...' : null}
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
		this.props.onSubmitPushToken(this.props.pushToken, this.postLoadMethod);
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

function mapStateToProps(store: Object): Object {
	return {
		pushToken: store.user.pushToken,
		pushTokenRegistered: store.user.pushTokenRegistered,
		notificationText: store.user.notificationText,
	};
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: Object): Object {
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
		onSubmitPushToken: (token: string, callback: (string) => void) => {
			dispatch(registerPushToken(token, DeviceInfo.getBuildNumber(), DeviceInfo.getModel(), DeviceInfo.getManufacturer(), DeviceInfo.getSystemVersion(), DeviceInfo.getUniqueID(), pushServiceId))
				.then(() => {
					callback('REG_TOKEN');
				});
		},
		onLogout: (token: string, callback: (string) => void) => {
			dispatch(unregisterPushToken(token)).then(() => {
				dispatch(logoutFromTelldus());
				callback('LOGOUT');
			});
		},
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SettingsDetailModal);
