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
import { defineMessages, intlShape, injectIntl } from 'react-intl';

import {
	FormattedMessage,
	Container,
	Text,
	View,
	Icon,
	TouchableButton,
	DialogueBox,
} from 'BaseComponents';
import { logoutFromTelldus } from 'Actions';
import Modal from 'react-native-modal';
const DeviceInfo = require('react-native-device-info');

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
		defaultMessage: 'Re-register for push',
		description: 'Message in the settings window shown if the app was not registered for push notifications, in settings view',
	},
	pushRegisters: {
		id: 'settings.pushRegisters',
		defaultMessage: 'Registering for push',
		description: 'Message in the settings window shown when registrating for push notifications',
	},
	pushRegisterSuccess: {
		id: 'settings.pushRegisterSuccess',
		defaultMessage: 'This phone is now registered for push',
		description: 'Message to show when token registered successfully',
	},
	pushRegisterFailed: {
		id: 'settings.pushRegisterFailed',
		defaultMessage: 'Failed to register for push. Please try again',
		description: 'Message to show when token register failed',
	},
	version: {
		id: 'version',
		defaultMessage: 'version',
	},
});

const Header = ({ onPress, styles, buttonAccessibilityLabel }) => (
	<View style={styles.header}>
		<Icon name="gear" size={26} color="white"
		      style={styles.gear}/>
		<Text ellipsizeMode="middle" style={styles.textHeaderTitle}>
			<FormattedMessage {...i18n.settingsHeader} style={styles.textHeaderTitle}/>
		</Text>
		<Icon name="close" size={26} color="white" style={{ flex: 1 }} accessibilityLabel={buttonAccessibilityLabel} onPress={onPress}/>
	</View>
);

const StatusView = ({styles, accessible, importantForAccessibility}) => (
	<Text style={styles.statusText} accessible={accessible} importantForAccessibility={importantForAccessibility}>
		<FormattedMessage {...messages.pushEnabled} style={styles.statusText} />
	</Text>
);

type Props = {
	dispatch: Function,
	isVisible: boolean,
	onClose: () => void,
	onLogout: (string, Function) => void,
	onSubmitPushToken: (string) => Promise<any>,
	user: Object,
	validationMessage: string,
	showModal: boolean,
	intl: intlShape.isRequired,
	appLayout: Object,
};


type State = {
	isVisible: boolean,
	isPushSubmitLoading: boolean,
	isLogoutLoading: boolean,
};

class SettingsDetailModal extends View {
	props: Props;
	state: State;

	logout: () => void;
	postLoadMethod: () => void;
	submitPushToken: () => void;
	updateModalVisiblity: () => void;
	onConfirmLogout: () => void;
	closeModal: () => void;

	constructor(props) {
		super(props);
		this.state = {
			isVisible: this.props.isVisible,
			isPushSubmitLoading: false,
			isLogoutLoading: false,
		};
		this.logout = this.logout.bind(this);
		this.onConfirmLogout = this.onConfirmLogout.bind(this);
		this.postLoadMethod = this.postLoadMethod.bind(this);
		this.submitPushToken = this.submitPushToken.bind(this);
		this.updateModalVisiblity = this.updateModalVisiblity.bind(this);
		this.closeModal = this.closeModal.bind(this);

		let { formatMessage } = this.props.intl;

		this.confirmMessage = formatMessage(i18n.contentLogoutConfirm);
		this.labelButton = formatMessage(i18n.button);
		this.labelButtondefaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
		this.labelLogOut = `${formatMessage(i18n.labelLogOut)} ${this.labelButton}. ${this.labelButtondefaultDescription}`;
		this.labelCloseSettings = `${formatMessage(i18n.labelClose)} ${formatMessage(i18n.settingsHeader)}. ${this.labelButtondefaultDescription}`;
	}

	logout() {
		this.props.dispatch({
			type: 'REQUEST_MODAL_OPEN',
			payload: {
				data: this.confirmMessage,
			},
		});
	}

	onConfirmLogout() {
		this.closeModal();
		this.setState({
			isLogoutLoading: true,
		});
		this.props.onLogout(this.props.user.pushToken, this.postLoadMethod);
	}

	closeModal() {
		this.props.dispatch({
			type: 'REQUEST_MODAL_CLOSE',
		});
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

	getRelativeData() {
		let { formatMessage } = this.props.intl;

		let notificationHeader = `${formatMessage(i18n.logout)}?`, showPositive = true,
			showNegative = true, positiveText = formatMessage(i18n.logout).toUpperCase(),
			onPressPositive = this.onConfirmLogout, onPressNegative = this.closeModal;
		let submitButText = this.state.isPushSubmitLoading ? `${formatMessage(messages.pushRegisters)}...` : formatMessage(messages.pushRegister);
		let logoutButText = this.state.isLogoutLoading ? formatMessage(i18n.loggingout) : formatMessage(i18n.logout);
		let version = DeviceInfo.getVersion();

		return {
			notificationHeader,
			showPositive,
			showNegative,
			positiveText,
			onPressPositive,
			onPressNegative,
			submitButText,
			logoutButText,
			version,
		};
	}

	render() {
		let {
			notificationHeader,
			showPositive,
			showNegative,
			positiveText,
			onPressPositive,
			onPressNegative,
			submitButText,
			logoutButText,
			version,
		} = this.getRelativeData();
		let { appLayout, showModal } = this.props;
		let { isLogoutLoading, isPushSubmitLoading } = this.state;
		let styles = this.getStyles(appLayout);

		let buttonAccessible = !isLogoutLoading && !isPushSubmitLoading && !showModal;
		let importantForAccessibility = showModal ? 'no-hide-descendants' : 'yes';

		return (
			<Modal isVisible={this.state.isVisible} onModalHide={this.updateModalVisiblity}>
				<Container style={styles.container}>
					<Header onPress={this.props.onClose} styles={styles} buttonAccessibilityLabel={this.labelCloseSettings}/>
					<View style={styles.body}>
						<View style={styles.body}>
							{ this.props.user.notificationText ?
								<Text style={styles.notification}
									accessible={buttonAccessible}
									importantForAccessibility={importantForAccessibility}>
									{this.props.user.notificationText}
								</Text>
								:
								null
							}
							<Text style={styles.versionInfo} accessible={buttonAccessible}
								importantForAccessibility={importantForAccessibility}>
								Telldus Live! mobile{'\n'}
								<FormattedMessage {...messages.version} style={styles.versionInfo}/> {version}
							</Text>
							<TouchableButton
								style={styles.pushSubmitButton}
								labelStyle={{fontSize: 12}}
								onPress={this.submitPushToken}
								text={submitButText}
								accessible={buttonAccessible}
							/>
							<StatusView styles={styles}
								accessible={buttonAccessible}
								importantForAccessibility={importantForAccessibility}/>
							<View style={{height: 20}} />
							<TouchableButton
								onPress={this.logout}
								text={logoutButText}
								postScript={this.state.isLogoutLoading ? '...' : null}
								accessibilityLabel={this.labelLogOut}
								accessible={buttonAccessible}
							/>
						</View>
						<DialogueBox
							showDialogue={this.props.showModal}
							header={notificationHeader}
							text={this.props.validationMessage}
							showPositive={showPositive}
							showNegative={showNegative}
							positiveText={positiveText}
							onPressPositive={onPressPositive}
							onPressNegative={onPressNegative}/>
					</View>
				</Container>
			</Modal>
		);
	}

	submitPushToken() {
		this.setState({
			isPushSubmitLoading: true,
		});
		let { formatMessage } = this.props.intl;
		this.props.onSubmitPushToken(this.props.user.pushToken).then(response => {
			let message = formatMessage(messages.pushRegisterSuccess);
			this.showToast(message);
		}).catch((err) => {
			console.log(err);
			let message = formatMessage(messages.pushRegisterFailed);
			this.showToast(message);
		});

	}

	showToast(message: string) {
		this.props.dispatch({
			type: 'GLOBAL_ERROR_SHOW',
			payload: {
				source: 'settings',
				customMessage: message,
			},
		});
		this.setState({
			isPushSubmitLoading: false,
		});
	}

	getStyles(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		const isPortrait = height > width;

		return {
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
				fontSize: isPortrait ? Math.floor(width * 0.042) : Math.floor(height * 0.042),
				textAlign: 'center',
				textAlignVertical: 'center',
			},
			versionInfo: {
				color: '#1a355b',
				fontSize: isPortrait ? Math.floor(width * 0.042) : Math.floor(height * 0.042),
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

				fontSize: isPortrait ? Math.floor(width * 0.041) : Math.floor(height * 0.041),
				color: '#1a355b',
				textAlign: 'center',
				backgroundColor: '#ff000033',
			},
			pushSubmitButton: {
				width: isPortrait ? width * 0.55 : height * 0.55,
			},
		};
	}
}

function mapStateToProps(store) {
	return {
		validationMessage: store.modal.data,
		showModal: store.modal.openModal,
		appLayout: store.App.layout,
		user: store.user,
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
		onSubmitPushToken: (token) => {
			return dispatch(registerPushToken(token, DeviceInfo.getBuildNumber(), DeviceInfo.getModel(), DeviceInfo.getManufacturer(), DeviceInfo.getSystemVersion(), DeviceInfo.getUniqueID(), pushServiceId));
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

module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(SettingsDetailModal));
