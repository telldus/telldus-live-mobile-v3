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

import { FormattedMessage, View, DialogueBox } from '../../../BaseComponents';
import { RegisterForm } from './SubViews';

import Theme from './../../Theme';
import i18n from './../../Translations/common';

type Props = {
	navigation: Object,
	dispatch: Function,
	validationMessage: string,
	showModal: boolean,
	registeredCredential: any,
	intl: intlShape.isRequired,
	validationMessageHeader: string,
	appLayout: Object,
	styles: Object,
	screenProps: Object,
};

class RegisterScreen extends View {

	props: Props;

	goBackToLogin: () => void;
	closeModal: () => void;

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
			navigation.navigate({
				routeName: 'Welcome',
				key: 'Welcome',
			});
		}
	}

	closeModal() {
		this.props.dispatch({
			type: 'REQUEST_MODAL_CLOSE',
		});
	}

	goBackToLogin() {
		this.closeModal();
		this.props.navigation.navigate({
			routeName: 'Login',
			key: 'Login',
		});
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		if (nextProps.navigation.state.routeName !== nextProps.screenProps.currentScreen) {
			return false;
		}
		return true;
	}

	render(): Object {
		let { showModal, validationMessage, validationMessageHeader, appLayout, intl, styles: commonStyles } = this.props;
		let styles = this.getStyles(appLayout);

		return (
			<View style={{
				flex: 1,
				alignItems: 'stretch',
			}}>
				<RegisterForm
					appLayout={appLayout}
					dialogueOpen={this.props.showModal}
					headerText={intl.formatMessage(i18n.createAccount)}
					styles={commonStyles}/>
				<TouchableOpacity
					onPress={this.goBackToLogin}
					accessibilityLabel={this.labelAlreadyHaveAccount}
					style={{
						alignSelf: 'center',
					}}>
					<FormattedMessage {...i18n.alreadyHaveAccount} style={styles.accountExist}/>
				</TouchableOpacity>
				<DialogueBox
					showDialogue={showModal}
					text={validationMessage}
					header={validationMessageHeader}
					showPositive={true}
					showNegative={false}
					onPressPositive={this.closeModal}/>
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
			accountExist: {
				fontSize: infoFontSize,
				marginHorizontal: infoFontSize * 0.2,
				marginVertical: infoFontSize * 0.8,
				color: '#bbb',
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
		validationMessage: store.modal.data,
		validationMessageHeader: store.modal.extras,
		showModal: store.modal.openModal,
		registeredCredential: store.user.registeredCredential,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(RegisterScreen));
