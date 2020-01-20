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
import { Platform, Keyboard, InteractionManager } from 'react-native';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-community/google-signin';

import {
	TouchableButton,
	View,
	H1,
	MaterialTextInput,
} from '../../../../BaseComponents';
import { loginToTelldus } from '../../../Actions';
import {
	testUsername,
	testPassword,
	webClientId,
	iosClientId,
} from '../../../../Config';

import i18n from '../../../Translations/common';

type Props = {
	dispatch: Function,
	screenProps: Object,
	loginToTelldus: Function,
	intl: intlShape.isRequired,
	appLayout: Object,
	dialogueOpen: Object,
	styles: Object,
	headerText: string,

	openDialogueBox: (string, ?string) => void,
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
	onFormSubmit: () => void;
	postSubmit: () => void;
	signIn: () => any;
	signOutGoogle: () => any;

	invalidGrant: string;

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
		this.invalidGrant = `${formatMessage(i18n.errorInvalidGrant)}.`;
	}

	componentDidMount() {
		this.configureGoogleSignIn();
	}

	configureGoogleSignIn() {
		GoogleSignin.configure({
			webClientId: webClientId,
			offlineAccess: true,
			iosClientId: Platform.OS === 'ios' ? iosClientId : undefined,
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
								<MaterialTextInput
									style={styles.textFieldStyle}
									onChangeText={this.onChangeUsername}
									placeholder={this.props.intl.formatMessage(i18n.emailAddress)}
									keyboardType="email-address"
									autoCapitalize="none"
									autoCorrect={false}
									placeholderTextColor={styles.textFieldStyle.color}
									defaultValue={this.state.username}
									renderLeftAccessory={<Icon name={'email'} size={styles.iconSize} color={styles.textFieldStyle.color}/>}
								/>
							</View>
						</View>
						<View style={styles.textFieldIconContainer}>
							<View style={styles.textFieldIconCover}>
								<MaterialTextInput
									style={styles.textFieldStyle}
									onChangeText={this.onChangePassword}
									placeholder={this.props.intl.formatMessage(i18n.password)}
									secureTextEntry={true}
									autoCapitalize="none"
									autoCorrect={false}
									placeholderTextColor={styles.textFieldStyle.color}
									defaultValue={this.state.password}
									renderLeftAccessory={<Icon name={'lock'} size={styles.iconSize} color={styles.textFieldStyle.color}/>}
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
				<View style={{ height: 10 }}/>
				<GoogleSigninButton
					style={styles.loginButtonStyleG}
					size={GoogleSigninButton.Size.Wide}
					color={GoogleSigninButton.Color.Dark}
					onPress={this.signIn}
					disabled={this.state.isSigninInProgress} />
				<View style={{ height: 10 }}/>
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
		const { openDialogueBox, intl } = this.props;
		this.setState({ isSigninInProgress: true });
		try {
			await GoogleSignin.hasPlayServices();
			const data = await GoogleSignin.signIn();
			const { idToken } = data;
			if (idToken) {
				Keyboard.dismiss();
				InteractionManager.runAfterInteractions(() => {
					const credential = {
						idToken,
					};
					this.props.loginToTelldus(credential, 'google')
						.catch((err: Object) => {
							this.setState({
								isSigninInProgress: false,
							});
							this.handleLoginError(err);
						});
				});
			} else {
				openDialogueBox(this.unknownError);
			}
		  } catch (error) {
			if (error.code === statusCodes.SIGN_IN_CANCELLED) {
			  // user cancelled the login flow
			} else if (error.code === statusCodes.IN_PROGRESS) {
			  // operation (f.e. sign in) is in progress already
			} else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
			  // play services not available or outdated
			  openDialogueBox(intl.formatMessage(i18n.emailAddress));
			} else {
			  // some other error happened
			  openDialogueBox(this.unknownError);
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
		const { intl, openDialogueBox } = this.props;
		const { username, password } = this.state;
		if (this.state.username !== '' && this.state.password !== '') {
			this.setState({ isLoading: true });
			Keyboard.dismiss();
			InteractionManager.runAfterInteractions(() => {
				const credential = {
					username,
					password,
				};
				this.props.loginToTelldus(credential, 'password')
					.catch((err: Object) => {
						this.postSubmit();
						this.handleLoginError(err);
					});
			});
		} else {
			let message = intl.formatMessage(i18n.fieldEmpty);
			openDialogueBox(message);
		}
	}

	handleLoginError(error: Object) {
		let { openDialogueBox } = this.props;
		if (error.response) {
			const { data = {} } = error.response;
			let errorMessage = data.error_description ?
				data.error_description : data.error ?
					data.error : this.unknownError;
			if (data.error === 'invalid_grant') {
				errorMessage = this.invalidGrant;
			}
			openDialogueBox(errorMessage);
		} else if (error.request) {
			let errorMessage = !error.status && error.request._timedOut ? this.timedOut : this.networkFailed;
			openDialogueBox(errorMessage);
		} else {
			openDialogueBox(error.message);
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
		loginToTelldus: (credential: Object, grantType: string): Promise<any> => {
			return dispatch(loginToTelldus(credential, grantType));
		},
		dispatch,
	};
}

module.exports = connect(mapStateToProps, dispatchToProps)(injectIntl(LoginForm));
