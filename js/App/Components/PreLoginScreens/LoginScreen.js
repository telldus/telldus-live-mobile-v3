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
import {TouchableOpacity} from 'react-native';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';

import { FormattedMessage, View, DialogueBox, Dimensions } from 'BaseComponents';
import { FormContainerComponent, LoginForm, SessionLocked } from 'PreLoginScreen_SubViews';

import i18n from './../../Translations/common';
import {defineMessages} from 'react-intl';

import StyleSheet from 'StyleSheet';

const messages = defineMessages({
	needAccount: {
		id: 'user.needAccount',
		defaultMessage: 'Need an account?',
		description: 'Message to show on the login screen',
	},
	headerSessionLocked: {
		id: 'user.headerSessionLocked',
		defaultMessage: 'Lost Connection',
		description: 'Header for Session Locked Screen',
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
		onPressLogout: boolean,
};

class LoginScreen extends View {
	props: Props;
	state: State;

	onForgotPassword: () => void;
	onNeedAccount: () => void;
	closeModal: () => void;
	onPressPositive: () => void;

	constructor(props: Props) {
		super(props);

		this.state = this.state || {
			notificationText: false,
			onPressLogout: false,
		};

		this.onForgotPassword = this.onForgotPassword.bind(this);
		this.onNeedAccount = this.onNeedAccount.bind(this);

		this.closeModal = this.closeModal.bind(this);
		this.onPressPositive = this.onPressPositive.bind(this);
	}

	closeModal() {
		this.props.dispatch({
			type: 'REQUEST_MODAL_CLOSE',
		});
	}

	onPressPositive() {
		this.closeModal();
		this.setState({
			onPressLogout: true,
		});
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object) {
		if (nextProps.navigation.state.routeName !== nextProps.screenProps.currentScreen) {
			return false;
		}
		return true;
	}

	getRelativeData() {
		let headerText = this.props.intl.formatMessage(i18n.login), notificationHeader = false,
			positiveText = false, onPressPositive = this.closeModal, onPressNegative = false,
			showNegative = false, showPositive = true;
		if (this.props.accessToken && !this.props.isTokenValid) {
			headerText = this.props.intl.formatMessage(messages.headerSessionLocked);
			positiveText = this.props.intl.formatMessage(i18n.logout).toUpperCase();
			notificationHeader = `${this.props.intl.formatMessage(i18n.logout)}?`;
			onPressPositive = this.onPressPositive;
			onPressNegative = this.closeModal;
			showNegative = true;
		}
		return {
			headerText,
			notificationHeader,
			showPositive,
			showNegative,
			positiveText,
			onPressPositive,
			onPressNegative,
		};
	}

	render() {
		let {
			headerText, notificationHeader, positiveText,
			onPressPositive, onPressNegative, showPositive, showNegative} = this.getRelativeData();
		return (
			<FormContainerComponent headerText={headerText} formContainerStyle={styles.formContainer}>
				{this.props.accessToken && !this.props.isTokenValid ?
					<SessionLocked onPressLogout={this.state.onPressLogout} />
					:
					<View>
						<LoginForm />
						<View style={styles.otherLinks}>
							<TouchableOpacity style={{height: 25}} onPress={this.onForgotPassword}>
								<FormattedMessage {...i18n.forgotPassword} style={{ color: '#bbb' }}/>
							</TouchableOpacity>
							<TouchableOpacity style={{height: 25, paddingLeft: 5 }} onPress={this.onNeedAccount}>
								<FormattedMessage {...messages.needAccount} style={{ color: '#bbb', paddingLeft: 5 }}/>
							</TouchableOpacity>
						</View>
						<View style={{ height: 10 }}/>
					</View>
				}
				<DialogueBox
					showDialogue={this.props.showModal}
					header={notificationHeader}
					text={this.props.validationMessage}
					showPositive={showPositive}
					showNegative={showNegative}
					positiveText={positiveText}
					onPressPositive={onPressPositive}
					onPressNegative={onPressNegative}/>

			</FormContainerComponent>
		);
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
		marginTop: 15,
		justifyContent: 'center',
		marginHorizontal: 10,
	},
	formContainer: {
		height: Dimensions.get('window').height * 0.50,
	},
});

function mapStateToProps(store) {
	return {
		tab: store.navigation.tab,
		accessToken: store.user.accessToken,
		isTokenValid: store.user.isTokenValid,
		validationMessage: store.modal.data,
		showModal: store.modal.openModal,
	};
}

function dispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, dispatchToProps)(injectIntl(LoginScreen));
