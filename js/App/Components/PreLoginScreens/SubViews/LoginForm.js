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

import { TouchableButton, View } from '../../../../BaseComponents';
import { loginToTelldus, showModal } from '../../../Actions';
import { testUsername, testPassword } from '../../../../Config';

import i18n from '../../../Translations/common';
import {defineMessages} from 'react-intl';

import Theme from '../../../Theme';

const messages = defineMessages({
	fieldEmpty: {
		id: 'form.login.fieldEmpty',
		defaultMessage: 'Something seems to be missing in your form. Please check that ' +
		'both email and password are entered correctly.',
		description: 'Validation message to show on the login screen when Form submitted with empty fields',
	},
});

type Props = {
		dispatch: Function,
		screenProps: Object,
		loginToTelldus: Function,
		intl: intlShape.isRequired,
		appLayout: Object,
		dialogueOpen: Object,
};

type State = {
		isLoading: boolean,
		username: string,
		password: string,
};

class LoginForm extends View {
	props: Props;
	state: State;

	onChangeUsername: (username:string) => void;
	onChangePassword: (password:string) => void;
	onFormSubmit: (username: string, password: string) => void;
	postSubmit: () => void;

	constructor(props: Props) {
		super(props);

		this.state = this.state || {
			username: testUsername,
			password: testPassword,
			isLoading: false,
		};

		this.onChangeUsername = this.onChangeUsername.bind(this);
		this.onChangePassword = this.onChangePassword.bind(this);
		this.onFormSubmit = this.onFormSubmit.bind(this);
		this.postSubmit = this.postSubmit.bind(this);

		let { formatMessage } = props.intl;

		this.timedOut = `${formatMessage(i18n.timedOut)}, ${formatMessage(i18n.tryAgain)}?`;
		this.unknownError = `${formatMessage(i18n.unknownError)}.`;
		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;
	}

	render() {
		let { appLayout, dialogueOpen } = this.props;
		let buttonAccessible = !this.state.isLoading && !dialogueOpen;
		let importantForAccessibility = dialogueOpen ? 'no-hide-descendants' : 'yes';

		return (
			<View importantForAccessibility={importantForAccessibility}>
				<View style={Theme.Styles.textFieldCover}>
					<Icon name="email" style={Theme.Styles.iconEmail} size={14} color="#ffffff80"/>
					<TextInput
						style={[Theme.Styles.textField, { width: appLayout.width * 0.85, fontSize: 15 }]}
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
						style={[Theme.Styles.textField, { width: appLayout.width * 0.85, fontSize: 15 }]}
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
					onPress={this.onFormSubmit}
					text={this.state.isLoading ? i18n.loggingin : i18n.login}
					postScript={this.state.isLoading ? '...' : null}
					accessible={buttonAccessible}
				/>
			</View>
		);
	}

	onChangeUsername(username: string) {
		this.setState({
			username,
			notificationText: false,
		});
	}

	onChangePassword(password: string) {
		this.setState({
			password,
			notificationText: false,
		});
	}

	onFormSubmit() {
		let { intl, dispatch } = this.props;
		if (this.state.username !== '' && this.state.password !== '') {
			this.setState({ isLoading: true });
			this.props.loginToTelldus(this.state.username, this.state.password, this.postSubmit)
				.then(res => {
					this.postSubmit();
				})
				.catch(err => {
					this.postSubmit();
					this.handleLoginError(err);
				});
		} else {
			let message = intl.formatMessage(messages.fieldEmpty);
			dispatch(showModal(message));
		}
	}

	handleLoginError(error: Object) {
		let { dispatch } = this.props;
		if (error.response) {
			let errorMessage = error.response.data.error_description ?
				error.response.data.error_description : error.response.data.error ?
					error.response.data.error : this.unknownError;
			dispatch(showModal(errorMessage));
		} else if (error.request) {
			let errorMessage = !error.status && error.request._timedOut ? this.timedOut : this.networkFailed;
			dispatch(showModal(errorMessage));
		} else {
			dispatch(showModal(error.message));
		}
	}

	postSubmit() {
		this.setState({
			isLoading: false,
		});
	}

}

function mapStateToProps(store: Object): Object {
	return {
		accessToken: store.user.accessToken,
	};
}

function dispatchToProps(dispatch: Function): Object {
	return {
		loginToTelldus: (userName: string, password: string) => {
			return dispatch(loginToTelldus(userName, password));
		},
		dispatch,
	};
}

module.exports = connect(mapStateToProps, dispatchToProps)(injectIntl(LoginForm));
