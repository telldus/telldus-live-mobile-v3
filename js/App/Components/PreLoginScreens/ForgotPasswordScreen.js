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
import { StyleSheet, TextInput } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { View, Text, TouchableButton } from 'BaseComponents';
import {FormContainerComponent} from 'PreLoginScreen_SubViews';

import Theme from 'Theme';

type Props = {
	navigation: Object,
}

export default class RegisterScreen extends View {

	props: Props;

	onEmailChange: (string) => void;
	goBackToLogin: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			email: '',
			isEmailValid: false,
			validationMessage: '',
			formSubmitted: false,
		};

		this.onEmailChange = this.onEmailChange.bind(this);
		this.goBackToLogin = this.goBackToLogin.bind(this);
	}

	onEmailChange(email: string) {
		this.setState({
			email,
			validationMessage: '',
		});
	}

	goBackToLogin() {
		this.props.navigation.navigate('Login');
	}

	render() {
		return (
			<FormContainerComponent headerText="Forgot Password">
				<View style={Theme.Styles.textFieldCover}>
					<Icon name="email" style={Theme.Styles.iconEmail} size={14} color="#ffffff80"/>
					<TextInput
						style={Theme.Styles.textField}
						onChangeText={this.onEmailChange}
						onBlur={this.onEmailBlur}
						placeholder="your@emailaddress.com"
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
					style={Theme.Styles.submitButton}
					onPress={this.onFormSubmit}
					text={this.state.isLoading ? 'SENDING...' : 'SEND PASSWORD'}
				/>
				<View style={{ height: 10 }}/>
				<Text style={styles.accountExist} onPress={this.goBackToLogin}> Back to Login </Text>
			</FormContainerComponent>
		);
	}
}

const styles = StyleSheet.create({
	accountExist: {
		marginTop: 10,
		color: '#bbb',
	},
});
