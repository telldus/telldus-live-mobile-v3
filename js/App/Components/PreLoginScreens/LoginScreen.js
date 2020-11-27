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
import { TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';

import { FormattedMessage, View } from '../../../BaseComponents';
import { LoginForm, SessionLocked } from './SubViews';

import {
	clearAppData,
} from '../../Actions/AppData';

import {
	setSocialAuthConfig,
} from './../../Actions/User';

import Theme from './../../Theme';
import i18n from './../../Translations/common';

type Props = {
	screenProps: Object,
	navigation: Object,
	loginToTelldus: Function,
	validationMessage: string,
	intl: intlShape.isRequired,
	appLayout: Object,
	styles: Object,
	accessToken: Object,
	isTokenValid: boolean,
	dispatch: Function,
	ScreenName: string,
	route: Object,
};

type State = {
	notificationText?: string,
	onPressLogout: boolean,
	showModal: boolean,
};

class LoginScreen extends View {
	props: Props;
	state: State;

	onForgotPassword: () => void;
	onNeedAccount: () => void;
	closeModal: () => void;
	onPressPositive: () => void;
	toggleOnPressLogout: (boolean) => void;

	constructor(props: Props) {
		super(props);

		this.state = this.state || {
			notificationText: false,
			onPressLogout: false,
			showModal: false,
		};

		this.onForgotPassword = this.onForgotPassword.bind(this);
		this.onNeedAccount = this.onNeedAccount.bind(this);

		this.closeModal = this.closeModal.bind(this);
		this.onPressPositive = this.onPressPositive.bind(this);
		this.toggleOnPressLogout = this.toggleOnPressLogout.bind(this);

		let { formatMessage } = props.intl;

		this.forgotPassword = formatMessage(i18n.forgotPassword);
		this.needAccount = formatMessage(i18n.needAccount);

		this.labelLink = formatMessage(i18n.labelLink);
		this.labelButtondefaultDescription = formatMessage(i18n.defaultDescriptionButton);
		this.labelForgotPassword = `${this.labelLink} ${this.forgotPassword} ${this.labelButtondefaultDescription}`;
		this.labelNeedAccount = `${this.labelLink} ${this.needAccount} ${this.labelButtondefaultDescription}`;
	}

	closeModal() {
		const { screenProps } = this.props;
		const { toggleDialogueBox } = screenProps;
		const dialogueData = {
			show: false,
		};
		this.setState({
			showModal: false,
		}, () => {
			toggleDialogueBox(dialogueData);
		});
	}

	onPressPositive() {
		this.closeModal();
		this.toggleOnPressLogout(true);
	}

	toggleOnPressLogout(onPressLogout: boolean) {
		this.setState({
			onPressLogout,
		});
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.ScreenName === nextProps.screenProps.currentScreen;
	}

	getRelativeData(extras?: Object): Object {
		const {
			intl,
		} = this.props;
		const {
			formatMessage,
		} = intl;

		let headerText = formatMessage(i18n.login),
			notificationHeader = false,
			positiveText = false,
			onPressPositive = this.closeModal,
			onPressNegative = false,
			showNegative = false, showPositive = true,
			negativeText,
			timeoutToCallPositive,
			timeoutToCallNegative,
			showIconOnHeader = false,
			onPressHeader,
			closeOnPressNegative,
			closeOnPressPositive;
		if (this.props.accessToken && !this.props.isTokenValid) {
			headerText = formatMessage(i18n.headerSessionLocked);
			positiveText = formatMessage(i18n.logout);
			notificationHeader = `${formatMessage(i18n.logout)}?`;
			onPressPositive = this.onPressPositive;
			onPressNegative = this.closeModal;
			showNegative = true;
		} else if (extras && extras.type === 'social_login_fail') {
			positiveText = formatMessage(i18n.signIn);
			negativeText = formatMessage(i18n.createAccount);
			notificationHeader = formatMessage(i18n.noLinkedAccount);
			onPressPositive = this.loginPostSocialLoginFail;
			onPressNegative = this.registerPostSocialLoginFail;
			showNegative = true;
			timeoutToCallPositive = 200;
			showIconOnHeader = true;
			onPressHeader = this.closeDialoguePostSocialLoginFail;
			closeOnPressNegative = true;
			closeOnPressPositive = true;
		}
		return {
			headerText,
			header: notificationHeader,
			showPositive,
			showNegative,
			positiveText,
			onPressPositive,
			onPressNegative,
			negativeText,
			timeoutToCallPositive,
			timeoutToCallNegative,
			showIconOnHeader,
			onPressHeader,
			closeOnPressNegative,
			closeOnPressPositive,
		};
	}

	openDialogueBox = (body: string, extras?: Object = {}) => {
		const { screenProps } = this.props;
		const { toggleDialogueBox } = screenProps;
		let dialogueBoxData = this.getRelativeData(extras);
		const dialogueData = {
			show: true,
			showHeader: true,
			text: body,
			...dialogueBoxData,
		};
		this.setState({
			showModal: true,
		}, () => {
			toggleDialogueBox(dialogueData);
		});
	}

	goBack = () => {
		this.props.navigation.goBack();
	}

	_onLoginSuccess = () => {
		const {
			navigation,
			dispatch,
		} = this.props;
		dispatch(clearAppData());
		navigation.navigate('Tabs', {
			screen: 'Dashboard',
		});
	}

	loginPostSocialLoginFail = () => {
		this.setState({
			showModal: false,
		});
	}

	registerPostSocialLoginFail = () => {
		this.setState({
			showModal: false,
		}, () => {
			const {
				navigation,
			} = this.props;
			navigation.navigate('Register');
		});
	}

	closeDialoguePostSocialLoginFail = () => {
		this.closeModal();
		this.props.dispatch(setSocialAuthConfig({}));
	}

	render(): Object {
		let { appLayout, styles: commonStyles, screenProps, intl, route = {} } = this.props;
		let styles = this.getStyles(appLayout);

		const {
			isSwitchingAccount = false,
		} = route.params || {};

		const { source = 'prelogin' } = screenProps;

		let {
			headerText,
		} = this.getRelativeData();
		return (
			<View style={{
				flex: 1,
				alignItems: 'stretch',
			}}>
				{this.props.accessToken && !this.props.isTokenValid ?
					<SessionLocked
						onPressLogout={this.state.onPressLogout}
						dialogueOpen={this.state.showModal}
						headerText={headerText}
						toggleOnPressLogout={this.toggleOnPressLogout}
						styles={commonStyles}
						openDialogueBox={this.openDialogueBox}/>
					:
					<LoginForm
						appLayout={appLayout}
						dialogueOpen={this.state.showModal}
						headerText={headerText}
						styles={commonStyles}
						openDialogueBox={this.openDialogueBox}
						onLoginSuccess={source === 'postlogin' ? this._onLoginSuccess : undefined}
						isSwitchingAccount={isSwitchingAccount}/>
				}
				{this.props.accessToken && !this.props.isTokenValid ?
					null
					:
					<View style={styles.otherLinks}>
						{source === 'prelogin' && (
							<>
								<TouchableOpacity
									onPress={this.onForgotPassword}
									accessibilityLabel={this.labelForgotPassword}>
									<FormattedMessage {...i18n.forgotPassword} style={styles.textLink}/>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={this.onNeedAccount}
									accessibilityLabel={this.labelNeedAccount}>
									<FormattedMessage {...i18n.needAccount} style={[ styles.textLink, { paddingLeft: 5 }]}/>
								</TouchableOpacity>
								<View style={{ height: 10 }}/>
							</>
						)}
						{source === 'postlogin' && (
							<TouchableOpacity
								onPress={this.goBack}
								accessibilityLabel={intl.formatMessage(i18n.cancelAndBack)}
								style={{
									alignSelf: 'center',
								}}>
								<FormattedMessage {...i18n.cancelAndBack} style={styles.textLink} />
							</TouchableOpacity>
						)}
					</View>
				}
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		let { height, width } = appLayout;
		let isPortrait = height > width;
		let deviceWidth = isPortrait ? width : height;

		const {
			maxSizeTextButton,
			baseColorPreloginScreen,
		} = Theme.Core;

		let infoFontSize = Math.floor(deviceWidth * 0.039);
		let maxFontSize = maxSizeTextButton - 2;
		infoFontSize = infoFontSize > maxFontSize ? maxFontSize : infoFontSize;

		return {
			otherLinks: {
				flexDirection: 'row',
				flexWrap: 'wrap',
				justifyContent: 'center',
				marginHorizontal: 10,
			},
			textLink: {
				color: baseColorPreloginScreen,
				fontSize: infoFontSize,
				marginHorizontal: infoFontSize * 0.2,
				marginBottom: 5,
				paddingBottom: 5,
				paddingHorizontal: 3,
			},
		};
	}

	onNeedAccount() {
		this.props.navigation.navigate('Register');
	}

	onForgotPassword() {
		this.props.navigation.navigate('ForgotPassword');
	}
}

function mapStateToProps(store: Object): Object {
	return {
		accessToken: store.user.accessToken,
		isTokenValid: store.user.isTokenValid,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(LoginScreen));
