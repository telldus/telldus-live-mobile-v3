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
import { TextInput } from 'react-native';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { FormattedMessage, TouchableButton, Text, View, Modal } from 'BaseComponents';
import {NotificationComponent, FormContainerComponent} from 'PreLoginScreen_SubViews';
import { loginToTelldus } from 'Actions';
import { testUsername, testPassword } from 'Config';

import i18n from './../../Translations/common';
import {defineMessages} from 'react-intl';

import StyleSheet from 'StyleSheet';
import Theme from 'Theme';

const messages = defineMessages({
	needAccount: {
		id: 'user.needAccount',
		defaultMessage: 'Need an account?',
		description: 'Message to show on the login screen',
	},
});

type Props = {
		dispatch: Function,
		screenProps: Object,
		navigation: Object,
		loginToTelldus: Function,
		validationMessage: string,
		showModal: boolean,
		intl: intlShape.isRequired,
};

type State = {
		notificationText? : string,
		isLoading : boolean,
		username: string,
		password: string,
};

class LoginScreen extends View {
	props: Props;
	state: State;

	onChangeUsername: (username:string) => void;
	onChangePassword: (password:string) => void;
	onForgotPassword: () => void;
	onNeedAccount: () => void;
	onFormSubmit: () => void;
	closeModal: () => void;
	onModalOpen: () => void;

	constructor(props: Props) {
		super(props);

		this.state = this.state || {
			username: testUsername,
			password: testPassword,
			notificationText: false,
		};

		this.onChangeUsername = this.onChangeUsername.bind(this);
		this.onChangePassword = this.onChangePassword.bind(this);
		this.onForgotPassword = this.onForgotPassword.bind(this);
		this.onNeedAccount = this.onNeedAccount.bind(this);
		this.onFormSubmit = this.onFormSubmit.bind(this);

		this.closeModal = this.closeModal.bind(this);
		this.onModalOpen = this.onModalOpen.bind(this);
	}

	closeModal() {
		this.props.dispatch({
			type: 'REQUEST_MODAL_CLOSE',
		});
	}

	onModalOpen() {
		this.setState({
			isLoading: false,
		});
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object) {
		if (nextProps.navigation.state.routeName !== nextProps.screenProps.currentScreen) {
			return false;
		}
		return true;
	}

	render() {
		return (
			<FormContainerComponent headerText={this.props.intl.formatMessage(i18n.login)}>
				<View style={Theme.Styles.textFieldCover}>
					<Icon name="email" style={Theme.Styles.iconEmail} size={14} color="#ffffff80"/>
					<TextInput
						style={Theme.Styles.textField}
						onChangeText={this.onChangeUsername}
						placeholder={this.props.intl.formatMessage(i18n.emailAddress)}
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						placeholderTextColor="#ffffff80"
						underlineColorAndroid="#ffffff80"
						defaultValue={this.state.username}
					/>
				</View>
				<View style={Theme.Styles.textFieldCover}>
					<Icon name="lock" style={Theme.Styles.iconLock} size={15} color="#ffffff80"/>
					<TextInput
						style={Theme.Styles.textField}
						onChangeText={this.onChangePassword}
						placeholder={this.props.intl.formatMessage(i18n.password)}
						secureTextEntry={true}
						autoCapitalize="none"
						autoCorrect={false}
						placeholderTextColor="#ffffff80"
						underlineColorAndroid="#ffffff80"
						defaultValue={this.state.password}
					/>
				</View>
				<View style={{ height: 10 }}/>
				<TouchableButton
					style={Theme.Styles.submitButton}
					onPress={this.onFormSubmit}
					text={this.state.isLoading ? i18n.loggingin : i18n.login}
					postScript={this.state.isLoading ? '...' : null}
				/>
				<View style={styles.otherLinks}>
					<Text style={{ color: '#bbb' }} onPress={this.onForgotPassword}><FormattedMessage {...i18n.forgotPassword} style={{ color: '#bbb' }}/></Text>
					<Text style={{ color: '#bbb', paddingLeft: 5 }} onPress={this.onNeedAccount}><FormattedMessage {...messages.needAccount} style={{ color: '#bbb', paddingLeft: 5 }}/></Text>
				</View>
				<View style={{ height: 10 }}/>
				<Modal
					modalStyle={Theme.Styles.notificationModal}
					entry= "ZoomIn"
					exit= "ZoomOut"
					entryDuration= {300}
					exitDuration= {100}
					onOpen= {this.onModalOpen}
					showModal={this.props.showModal}>
					<NotificationComponent text={this.props.validationMessage} onPress={this.closeModal} />
				</Modal>
			</FormContainerComponent>
		);
	}

	onChangeUsername(username) {
		this.setState({
			username,
			notificationText: false,
		});
	}

	onChangePassword(password) {
		this.setState({
			password,
			notificationText: false,
		});
	}

	onFormSubmit() {
		this.setState({ isLoading: true });
		this.props.loginToTelldus(this.state.username, this.state.password);
	}

	onNeedAccount() {
		this.closeModal();
		this.props.navigation.navigate('Register');
	}

	onForgotPassword() {
		this.closeModal();
		this.props.navigation.navigate('ForgotPassword');
	}
}

const styles = StyleSheet.create({
	otherLinks: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginTop: 15 },
});

function mapStateToProps(store) {
	return {
		tab: store.navigation.tab,
		accessToken: store.user.accessToken,
		validationMessage: store.modal.data,
		showModal: store.modal.openModal,
	};
}

function dispatchToProps(dispatch) {
	return {
		loginToTelldus: (userName: string, password: string) => {
			dispatch(loginToTelldus(userName, password));
		},
		dispatch,
	};
}

module.exports = connect(mapStateToProps, dispatchToProps)(injectIntl(LoginScreen));
