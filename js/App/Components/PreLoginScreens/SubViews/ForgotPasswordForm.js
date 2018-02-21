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

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { View, TouchableButton } from '../../../../BaseComponents';

import i18n from '../../../Translations/common';
import { intlShape, injectIntl } from 'react-intl';

import Theme from 'Theme';


type Props = {
	intl: intlShape.isRequired,
	appLayout: Object,
}

class ForgotPasswordForm extends View {

	props: Props;

	onEmailChange: (string) => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			email: '',
			isEmailValid: false,
			validationMessage: '',
			formSubmitted: false,
		};

		this.onEmailChange = this.onEmailChange.bind(this);
	}

	onEmailChange(email: string) {
		this.setState({
			email,
			validationMessage: '',
		});
	}

	render() {
		let { appLayout } = this.props;
		return (
			<View>
				<View style={Theme.Styles.textFieldCover}>
					<Icon name="email" style={Theme.Styles.iconEmail} size={14} color="#ffffff80"/>
					<TextInput
						style={[Theme.Styles.textField, { width: appLayout.width * 0.7 }]}
						onChangeText={this.onEmailChange}
						onBlur={this.onEmailBlur}
						placeholder={this.props.intl.formatMessage(i18n.emailAddress)}
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						placeholderTextColor="#ffffff80"
						underlineColorAndroid="#ffffff80"
						defaultValue={this.state.email}
					/>
				</View>
				<View style={{ height: 10 }}/>
				<TouchableButton
					onPress={this.onFormSubmit}
					text={this.state.isLoading ? i18n.sendingpassword : i18n.sendpassword}
					postScript={this.state.isLoading ? '...' : null}
				/>
			</View>
		);
	}
}

export default injectIntl(ForgotPasswordForm);
