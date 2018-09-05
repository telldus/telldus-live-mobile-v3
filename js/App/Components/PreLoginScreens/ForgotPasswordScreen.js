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
import { connect } from 'react-redux';
import { TouchableOpacity } from 'react-native';

import {
	FormattedMessage,
	View,
	DialogueBox,
} from '../../../BaseComponents';
import { ForgotPasswordForm } from './SubViews';

import { hideModal } from '../../Actions/Modal';

import Theme from './../../Theme';
import i18n from './../../Translations/common';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
const messages = defineMessages({
	backToLogin: {
		id: 'user.backToLogin',
		defaultMessage: 'Back to Login',
		description: 'Message to show on the forgot password screen',
	},
});

type Props = {
	navigation: Object,
	intl: intlShape.isRequired,
	appLayout: Object,
	styles: Object,
	validationMessage?: string,
	validationMessageHeader?: string,
	showModal: boolean,
	dispatch: Function,
};

class ForgotPasswordScreen extends View<Props, null> {

	props: Props;

	goBackToLogin: () => void;
	closeModal: () => void;

	constructor(props: Props) {
		super(props);

		this.goBackToLogin = this.goBackToLogin.bind(this);
		this.closeModal = this.closeModal.bind(this);

		let { formatMessage } = props.intl;

		this.backToLogin = formatMessage(messages.backToLogin);

		this.labelLink = formatMessage(i18n.labelLink);
		this.labelButtondefaultDescription = formatMessage(i18n.defaultDescriptionButton);

		this.labelBackToLogin = `${this.labelLink} ${this.backToLogin} ${this.labelButtondefaultDescription}`;
	}

	goBackToLogin() {
		this.props.navigation.navigate({
			routeName: 'Login',
			key: 'Login',
		});
	}

	closeModal() {
		this.props.dispatch(hideModal());
	}

	render(): Object {
		let { showModal, validationMessage, validationMessageHeader, appLayout, intl, styles: commonStyles } = this.props;
		let styles = this.getStyles(appLayout);

		return (
			<View style={{flex: 1, alignItems: 'stretch'}}>
				<ForgotPasswordForm
					appLayout={appLayout}
					headerText={intl.formatMessage(i18n.forgotPassword)}
					styles={commonStyles}/>
				<View style={{ height: 10 }}/>
				<TouchableOpacity
					onPress={this.goBackToLogin}
					accessibilityLabel={this.labelBackToLogin}
					style={{
						alignSelf: 'center',
					}}>
					<FormattedMessage {...messages.backToLogin} style={styles.accountExist} />
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
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ForgotPasswordScreen));
