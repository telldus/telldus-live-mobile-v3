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
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import appleAuth, {
	AppleButton,
	AppleAuthRequestOperation,
	AppleAuthRequestScope,
	AppleAuthCredentialState,
	AppleAuthError,
} from '@invertase/react-native-apple-authentication';
const jwtDecode = require('jwt-decode');

import {
	TouchableButton,
	View,
	H1,
	MaterialTextInput,
} from '../../../../BaseComponents';
import {
	loginToTelldus,
	setSocialAuthConfig,
} from '../../../Actions';
import {
	testUsername,
	testPassword,
	webClientId,
	iosClientId,
	deployStore,
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
	socialAuthConfig: Object,
	isSwitchingAccount: boolean,

	onLoginSuccess?: () => void,
	openDialogueBox: (string, ?Object) => void,
};

type State = {
	isLoading: boolean,
	username: string,
	password: string,
	isSigninInProgress: boolean,
	isAppleSigningInProgress: boolean,
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
			isAppleSigningInProgress: false,
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

	onPressSignInApple = async () => {
		this.setState({
			isAppleSigningInProgress: true,
		});
		try {
			// performs login request
			const appleAuthRequestResponse = await appleAuth.performRequest({
				requestedOperation: AppleAuthRequestOperation.LOGIN,
				requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
			});

			// get current authentication state for user
			const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
			// use credentialState response to ensure the user is authenticated
			if (credentialState === AppleAuthCredentialState.AUTHORIZED) {
				// user is authenticated
				Keyboard.dismiss();
				InteractionManager.runAfterInteractions(() => {
					const credential = {
						id_token: appleAuthRequestResponse.identityToken,
					};
					const provider = 'apple';
					this.props.loginToTelldus(credential, provider)
						.catch((err: Object) => {
							this.setState({
								isAppleSigningInProgress: false,
							});
							if (err.response && err.response.status === 404 && appleAuthRequestResponse.identityToken) {
								const {
									identityToken,
									email,
									fullName = {},
								} = appleAuthRequestResponse;
								const _fullName = {
									fn: fullName.givenName,
									ln: fullName.familyName || fullName.middleName,
								};
								const tokenJSON = jwtDecode(identityToken) || {};
								const isPvtEmail = Boolean(tokenJSON.is_private_email);
								this.onSocialLoginFail404({
									idToken: identityToken,
									provider,
									fullName: _fullName,
									email: isPvtEmail ? '' : (email || tokenJSON.email),
								});
								return;
							}
							this.handleLoginError(err);
						});
				});
			} else {
				this.props.openDialogueBox(this.unknownError);
				this.setState({
					isAppleSigningInProgress: false,
				});
			}
		} catch (e) {
			if (e.code !== AppleAuthError.CANCELED) {
				this.props.openDialogueBox(this.unknownError);
			}
			this.setState({
				isAppleSigningInProgress: false,
			});
		}
	}

	render(): Object {
		const {
			isSigninInProgress,
			isLoading,
			isAppleSigningInProgress,
		} = this.state;

		let {
			dialogueOpen,
			styles,
			headerText,
			socialAuthConfig,
		} = this.props;
		let buttonAccessible = !isLoading && !dialogueOpen;
		let importantForAccessibility = dialogueOpen ? 'no-hide-descendants' : 'yes';

		const disableAllSignin = isLoading || isSigninInProgress || isAppleSigningInProgress;

		const {
			accountLinked = true,
		} = socialAuthConfig;

		const showSocialAuth = accountLinked;

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
									inputContainerStyle={styles.inputContainerStyle}
									containerStyle={styles.containerStyle}
									contentInset={styles.contentInset}
									renderLeftAccessory={
										<Icon
											name={'email'}
											size={styles.iconSize}
											color={styles.textFieldStyle.color}
											style={styles.leftAccessoryStyle}/>}
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
									contentInset={styles.contentInset}
									inputContainerStyle={styles.inputContainerStyle}
									containerStyle={styles.containerStyle}
									renderLeftAccessory={
										<Icon name={'lock'}
											size={styles.iconSize}
											color={styles.textFieldStyle.color}
											style={styles.leftAccessoryStyle}/>}
								/>
							</View>
						</View>
					</View>
				</View>
				<View style={{ height: 10 }}/>
				<TouchableButton
					onPress={this.onFormSubmit}
					buttonLevel={disableAllSignin ? 7 : 24}
					textLevel={disableAllSignin ? 13 : 40}
					text={this.state.isLoading ? i18n.loggingin : i18n.login}
					postScript={this.state.isLoading ? '...' : null}
					accessible={buttonAccessible}
					disabled={disableAllSignin}
				/>
				<View style={{ height: 20 }}/>
				{(Platform.OS === 'ios' && appleAuth.isSupported && showSocialAuth) &&
				(
					<AppleButton
						buttonStyle={AppleButton.Style.WHITE}
						buttonType={AppleButton.Type.SIGN_IN}
						style={styles.loginButtonStyleA}
						onPress={disableAllSignin ? undefined : this.onPressSignInApple}
					/>
				)
				}
				{deployStore !== 'huawei' && showSocialAuth && (<GoogleSigninButton
					style={styles.loginButtonStyleG}
					size={GoogleSigninButton.Size.Wide}
					color={GoogleSigninButton.Color.Dark}
					onPress={this.signIn}
					disabled={disableAllSignin} />
				)}
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

	onSocialLoginFail404 = (authConfig: Object) => {
		const {
			dispatch,
			openDialogueBox,
			intl,
		} = this.props;
		dispatch(setSocialAuthConfig({
			...authConfig,
			accountLinked: false,
		}));
		openDialogueBox(intl.formatMessage(i18n.noLinkedAccountInfo),
			{
				type: 'social_login_fail',
			});
	}

	async signIn(): any {
		const { openDialogueBox, intl, onLoginSuccess } = this.props;
		this.setState({ isSigninInProgress: true });
		try {
			await GoogleSignin.hasPlayServices();
			const data: Object = await GoogleSignin.signIn();

			const { idToken } = data;
			if (idToken) {
				Keyboard.dismiss();
				InteractionManager.runAfterInteractions(() => {
					const credential = {
						idToken,
					};
					const provider = 'google';
					this.props.loginToTelldus(credential, provider).then(() => {
						if (onLoginSuccess) {
							onLoginSuccess();
						}
					}).catch((err: Object = {}) => {
						this.setState({
							isSigninInProgress: false,
						});
						if (err.response && err.response.status === 404 && idToken) {

							const {
								user = {},
							} = data || {};
							const {
								email,
								givenName,
								familyName,
								name = '',
							} = user;
							const [fn, ln] = name.split(' ');

							const _fullName = {
								fn: fn || givenName,
								ln: ln || familyName,
							};

							this.onSocialLoginFail404({
								idToken,
								provider,
								email,
								fullName: _fullName,
							});
							return;
						}
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
		const { intl, openDialogueBox, onLoginSuccess } = this.props;
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
					.then(() => {
						if (onLoginSuccess) {
							onLoginSuccess();
						}
					})
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
		socialAuthConfig: store.user.socialAuthConfig || {},
	};
}

function dispatchToProps(dispatch: Function, ownProps: Object): Object {
	return {
		loginToTelldus: (credential: Object, grantType: string): Promise<any> => {
			return dispatch(loginToTelldus(credential, grantType, {
				isSwitchingAccount: ownProps.isSwitchingAccount,
			}));
		},
		dispatch,
	};
}

module.exports = connect(mapStateToProps, dispatchToProps)(injectIntl(LoginForm));
