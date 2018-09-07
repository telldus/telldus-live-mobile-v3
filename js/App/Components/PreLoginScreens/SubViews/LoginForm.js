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
import { TextInput, Platform } from 'react-native';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
import firebase from 'react-native-firebase';

import { TouchableButton, View, H1 } from '../../../../BaseComponents';
import { loginToTelldus, showModal } from '../../../Actions';
import {
	testUsername,
	testPassword,
	webClientId,
	iosClientId,
} from '../../../../Config';

import i18n from '../../../Translations/common';
import {defineMessages} from 'react-intl';

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
		styles: Object,
		headerText: string,
};

type State = {
		isLoading: boolean,
		username: string,
		password: string,
		isSigninInProgress: boolean,
};

class LoginForm extends View {
	props: Props;
	state: State;

	onChangeUsername: (username: string) => void;
	onChangePassword: (password: string) => void;
	onFormSubmit: (username: string, password: string) => void;
	postSubmit: () => void;
	signIn: () => any;

	constructor(props: Props) {
		super(props);

		this.state = this.state || {
			username: testUsername,
			password: testPassword,
			isLoading: false,
			isSigninInProgress: false,
		};

		this.onChangeUsername = this.onChangeUsername.bind(this);
		this.onChangePassword = this.onChangePassword.bind(this);
		this.onFormSubmit = this.onFormSubmit.bind(this);
		this.postSubmit = this.postSubmit.bind(this);
		this.signIn = this.signIn.bind(this);
		this.signOutGoogle = this.signOutGoogle.bind(this);

		let { formatMessage } = props.intl;

		this.timedOut = `${formatMessage(i18n.timedOut)}, ${formatMessage(i18n.tryAgain)}?`;
		this.unknownError = `${formatMessage(i18n.unknownError)}.`;
		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;
	}

	componentDidMount() {
		this.configureGoogleSignIn();
	}

	configureGoogleSignIn() {
		// TODO: AUTOMATE values of secret key's webClientId, iosClientId and iosReversedClientId for release builds.
		// iosReversedClientId : used as URL Scheme in info.plist file
		GoogleSignin.configure({
			webClientId: webClientId,
			offlineAccess: true,
			iosClientId: Platform.OS === 'ios' ? iosClientId : null,
		});
	  }

	render(): Object {
		let { dialogueOpen, styles, headerText } = this.props;
		let buttonAccessible = !this.state.isLoading && !dialogueOpen;
		let importantForAccessibility = dialogueOpen ? 'no-hide-descendants' : 'yes';

		return (
			<View
				importantForAccessibility={importantForAccessibility}
				style={styles.formCover}>
				<H1 style={styles.headerTextStyle}>
					{headerText}
				</H1>
				<View style={styles.fieldsContainerStyle}>
					<View style={styles.fieldsPairContainerStyle}>
						<View style={styles.textFieldIconContainer}>
							<View style={[styles.textFieldIconCover, styles.textFieldIconCoverOne]}>
								<Icon name="email" style={styles.iconStyle} size={styles.iconSize} color="#ffffff80"/>
								<TextInput
									style={styles.textFieldStyle}
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
						</View>
						<View style={styles.textFieldIconContainer}>
							<View style={styles.textFieldIconCover}>
								<Icon name="lock" style={styles.iconStyle} size={styles.iconSize} color="#ffffff80"/>
								<TextInput
									style={styles.textFieldStyle}
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
						</View>
					</View>
				</View>
				<View style={{ height: 10 }}/>
				<TouchableButton
					onPress={this.onFormSubmit}
					text={this.state.isLoading ? i18n.loggingin : i18n.login}
					postScript={this.state.isLoading ? '...' : null}
					accessible={buttonAccessible}
				/>
				<GoogleSigninButton
					style={{ width: 200, height: 48, alignSelf: 'center' }}
					size={GoogleSigninButton.Size.Wide}
					color={GoogleSigninButton.Color.Dark}
					onPress={this.signIn}
					disabled={this.state.isSigninInProgress} />
			</View>
		);
	}

	async signOutGoogle(): any {
		try {
			await GoogleSignin.revokeAccess();
			await GoogleSignin.signOut();

			this.setState({ userInfo: null, error: null });
		  } catch (error) {
			this.setState({
			  error,
			});
		  }
	}

	async signIn(): any {
		this.setState({ isSigninInProgress: true });
		try {
			await GoogleSignin.hasPlayServices();
			const data = await GoogleSignin.signIn();
			console.log('TEST GoogleSignin user info', data);
			// create a new firebase credential with the token
			const credential = firebase.auth.GoogleAuthProvider.credential(data.idToken, data.accessToken);
			// login with credential
			const currentUser = await firebase.auth().signInAndRetrieveDataWithCredential(credential);

			console.log('TEST user credential after signing into firebase', currentUser.user.toJSON());
			this.setState({
				data,
				isSigninInProgress: false,
			});
		  } catch (error) {
			console.log('TEST error', error);
			if (error.code === statusCodes.SIGN_IN_CANCELLED) {
			  // user cancelled the login flow
			} else if (error.code === statusCodes.IN_PROGRESS) {
			  // operation (f.e. sign in) is in progress already
			} else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
			  // play services not available or outdated
			} else {
			  // some other error happened
			}
			this.setState({ isSigninInProgress: false });
		  }
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
			this.props.loginToTelldus(this.state.username, this.state.password)
				.catch((err: Object) => {
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
		loginToTelldus: (userName: string, password: string): Promise<any> => {
			return dispatch(loginToTelldus(userName, password));
		},
		dispatch,
	};
}

module.exports = connect(mapStateToProps, dispatchToProps)(injectIntl(LoginForm));
