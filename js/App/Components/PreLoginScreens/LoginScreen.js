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
import { TouchableOpacity, NativeModules } from 'react-native';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';

import { FormattedMessage, View, DialogueBox } from '../../../BaseComponents';
import { LoginForm, SessionLocked } from './SubViews';

import Theme from './../../Theme';
import i18n from './../../Translations/common';

type Props = {
	dispatch: Function,
	screenProps: Object,
	navigation: Object,
	loginToTelldus: Function,
	validationMessage: string,
	showModal: boolean,
	intl: intlShape.isRequired,
	appLayout: Object,
	styles: Object,
	accessToken: Object,
	isTokenValid: boolean,
};

type State = {
	notificationText?: string,
	onPressLogout: boolean,
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

	componentDidMount = () => {
		NativeModules.WidgetManager.showWidget(false);
	}

	closeModal() {
		this.props.dispatch({
			type: 'REQUEST_MODAL_CLOSE',
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
		if (nextProps.navigation.state.routeName !== nextProps.screenProps.currentScreen) {
			return false;
		}
		return true;
	}

	getRelativeData(): Object {
		let headerText = this.props.intl.formatMessage(i18n.login), notificationHeader = false,
			positiveText = false, onPressPositive = this.closeModal, onPressNegative = false,
			showNegative = false, showPositive = true;
		if (this.props.accessToken && !this.props.isTokenValid) {
			headerText = this.props.intl.formatMessage(i18n.headerSessionLocked);
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

	render(): Object {
		let { appLayout, styles: commonStyles } = this.props;
		let styles = this.getStyles(appLayout);

		let {
			headerText, notificationHeader, positiveText,
			onPressPositive, onPressNegative, showPositive, showNegative} = this.getRelativeData();
		return (
			<View style={{
				flex: 1,
				alignItems: 'stretch',
			}}>
				{this.props.accessToken && !this.props.isTokenValid ?
					<SessionLocked
						onPressLogout={this.state.onPressLogout}
						dialogueOpen={this.props.showModal}
						headerText={headerText}
						toggleOnPressLogout={this.toggleOnPressLogout}
						styles={commonStyles}/>
					:
					<LoginForm
						appLayout={appLayout}
						dialogueOpen={this.props.showModal}
						headerText={headerText}
						styles={commonStyles}/>
				}
				{this.props.accessToken && !this.props.isTokenValid ?
					null
					:
					<View style={styles.otherLinks}>
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
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		let { height, width } = appLayout;
		let isPortrait = height > width;
		let deviceWidth = isPortrait ? width : height;

		let infoFontSize = Math.floor(deviceWidth * 0.039);
		let maxFontSize = Theme.Core.maxSizeTextButton - 2;
		infoFontSize = infoFontSize > maxFontSize ? maxFontSize : infoFontSize;

		return {
			otherLinks: {
				flexDirection: 'row',
				flexWrap: 'wrap',
				justifyContent: 'center',
				marginHorizontal: 10,
			},
			textLink: {
				color: '#bbb',
				fontSize: infoFontSize,
				marginHorizontal: infoFontSize * 0.2,
				marginBottom: 10,
			},
		};
	}

	onNeedAccount() {
		this.closeModal();
		this.props.navigation.navigate({
			routeName: 'Register',
			key: 'Register',
		});
	}

	onForgotPassword() {
		this.closeModal();
		this.props.navigation.navigate({
			routeName: 'ForgotPassword',
			key: 'ForgotPassword',
		});
	}
}

function mapStateToProps(store: Object): Object {
	return {
		tab: store.navigation.tab,
		accessToken: store.user.accessToken,
		isTokenValid: store.user.isTokenValid,
		validationMessage: store.modal.data,
		showModal: store.modal.openModal,
	};
}

function dispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, dispatchToProps)(injectIntl(LoginScreen));
