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
import { injectIntl } from 'react-intl';

import { FormattedMessage, View } from '../../../BaseComponents';
import { RegisterForm } from './SubViews';

import {
	getLinkTextFontSize,
} from '../../Lib/styleUtils';
import Theme from './../../Theme';
import i18n from './../../Translations/common';

type Props = {
	navigation: Object,
	dispatch: Function,
	validationMessage: string,
	registeredCredential: any,
	intl: Object,
	validationMessageHeader: string,
	appLayout: Object,
	styles: Object,
	screenProps: Object,
	ScreenName: string,
};

type State = {
	showModal: boolean,
};

class RegisterScreen extends View<Props, State> {

	props: Props;

	goBackToLogin: () => void;
	closeModal: () => void;

	state: State = {
		showModal: false,
	};

	constructor(props: Props) {
		super(props);

		this.goBackToLogin = this.goBackToLogin.bind(this);
		this.closeModal = this.closeModal.bind(this);

		let { formatMessage } = props.intl;

		this.alreadyHaveAccount = formatMessage(i18n.alreadyHaveAccount);

		this.labelLink = formatMessage(i18n.labelLink);
		this.labelButtondefaultDescription = formatMessage(i18n.defaultDescriptionButton);

		this.labelAlreadyHaveAccount = `${this.labelLink} ${this.alreadyHaveAccount} ${this.labelButtondefaultDescription}`;
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		const { screenProps, registeredCredential, navigation } = this.props;
		if (registeredCredential && screenProps.currentScreen !== 'Welcome') {
			navigation.navigate('Welcome');
		}
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

	goBackToLogin() {
		this.props.navigation.navigate('Login');
	}

	openDialogueBox = (body: string, header?: Object) => {
		const { screenProps } = this.props;
		const { toggleDialogueBox } = screenProps;
		const dialogueData = {
			show: true,
			showHeader: true,
			header: header,
			text: body,
			onPressNegative: this.closeModal,
			onPressPositive: this.closeModal,
			showPositive: true,
			showNegative: false,
		};
		this.setState({
			showModal: true,
		}, () => {
			toggleDialogueBox(dialogueData);
		});
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.ScreenName === nextProps.screenProps.currentScreen;
	}

	goBack = () => {
		this.props.navigation.goBack();
	}

	render(): Object {
		let { appLayout, intl, styles: commonStyles, screenProps } = this.props;
		let styles = this.getStyles(appLayout);

		const { source = 'prelogin' } = screenProps;

		return (
			<View style={{
				flex: 1,
				alignItems: 'stretch',
			}}>
				<RegisterForm
					appLayout={appLayout}
					dialogueOpen={this.state.showModal}
					headerText={intl.formatMessage(i18n.createAccount)}
					styles={commonStyles}
					openDialogueBox={this.openDialogueBox}/>
				{source === 'prelogin' && (
					<TouchableOpacity
						onPress={this.goBackToLogin}
						accessibilityLabel={this.labelAlreadyHaveAccount}
						style={{
							alignSelf: 'center',
						}}>
						<FormattedMessage {...i18n.alreadyHaveAccount} style={styles.accountExist}/>
					</TouchableOpacity>
				)}
				{source === 'postlogin' && (
					<TouchableOpacity
						onPress={this.goBack}
						accessibilityLabel={intl.formatMessage(i18n.cancelAndBack)}
						style={{
							alignSelf: 'center',
						}}>
						<FormattedMessage {...i18n.cancelAndBack} style={styles.accountExist} />
					</TouchableOpacity>
				)}
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		let { height, width } = appLayout;
		let isPortrait = height > width;
		let deviceWidth = isPortrait ? width : height;

		const {
			baseColorPreloginScreen,
		} = Theme.Core;

		const infoFontSize = getLinkTextFontSize(deviceWidth);

		return {
			accountExist: {
				fontSize: infoFontSize,
				marginHorizontal: infoFontSize * 0.2,
				marginVertical: infoFontSize * 0.8,
				color: baseColorPreloginScreen,
				padding: 5,
			},
		};
	}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

function mapStateToProps(store: Object): Object {
	return {
		registeredCredential: store.user.registeredCredential,
	};
}

export default (connect(mapStateToProps, mapDispatchToProps)(injectIntl(RegisterScreen)): Object);
