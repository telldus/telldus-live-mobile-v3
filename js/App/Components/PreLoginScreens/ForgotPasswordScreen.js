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

import { FormattedMessage, View } from 'BaseComponents';
import {FormContainerComponent, ForgotPasswordForm} from 'PreLoginScreen_SubViews';

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
}

class ForgotPasswordScreen extends View {

	props: Props;

	goBackToLogin: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			validationMessage: '',
			formSubmitted: false,
		};

		this.goBackToLogin = this.goBackToLogin.bind(this);
	}

	goBackToLogin() {
		this.props.navigation.navigate('Login');
	}

	render() {
		let { appLayout } = this.props;
		let styles = this.getStyles(appLayout);

		return (
			<FormContainerComponent headerText={this.props.intl.formatMessage(i18n.forgotPassword)} formContainerStyle={styles.formContainer}>
				<ForgotPasswordForm appLayout/>
				<View style={{ height: 10 }}/>
				<TouchableOpacity style={{height: 25}} onPress={this.goBackToLogin}>
					<FormattedMessage {...messages.backToLogin} style={styles.accountExist} />
				</TouchableOpacity>
			</FormContainerComponent>
		);
	}

	getStyles(appLayout: Object): Object {
		const width = appLayout.width;

		return {
			accountExist: {
				marginTop: 10,
				color: '#bbb',
			},
			formContainer: {
				width: width,
			},
		};
	}
}

function mapStateToProps(store) {
	return {
		appLayout: store.App.layout,
	};
}

export default connect(mapStateToProps, null)(injectIntl(ForgotPasswordScreen));
