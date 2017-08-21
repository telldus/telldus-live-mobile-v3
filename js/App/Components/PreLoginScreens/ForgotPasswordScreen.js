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
import { Dimensions, StyleSheet, TextInput } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { View, H1, Text, TouchableButton } from 'BaseComponents';
import FormContainer from './FormContainer';

const deviceWidth = Dimensions.get('window').width;

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
			<FormContainer>
			<H1 style={{
				margin: 10,
				color: '#ffffff80',
				textAlign: 'center',
			}}>
				Forgot Password
			</H1>
			<View style={styles.textFieldCover}>
				<Icon name="email" style={styles.iconEmail} size={14} color="#ffffff80"/>
				<TextInput
					style={styles.formField}
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
			<Text style={{
				height: 16,
				width: deviceWidth,
				textAlign: 'center',
				color: '#f00',
			}}>{this.state.validationMessage}</Text>
			<TouchableButton
				style={styles.formSubmit}
				onPress={this.onFormSubmit}
				text={this.state.isLoading ? 'SENDING...' : 'SEND PASSWORD'}
			/>
			<Text style={styles.accountExist} onPress={this.goBackToLogin}> Back to Login </Text>
			</FormContainer>
		);
	}
}

const styles = StyleSheet.create({
	textFieldCover: {
		height: 50,
		width: deviceWidth * 0.7,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	iconAccount: {
		top: 15,
		left: 2,
		position: 'absolute',
	},
	iconEmail: {
		top: 18,
		left: 3,
		position: 'absolute',
	},
	formField: {
		paddingLeft: 35,
		paddingTop: 10,
		minWidth: 200,
		borderRadius: 3,

		height: 40,
		width: deviceWidth * 0.7,
		fontSize: 14,
		color: '#ffffff80',
		textAlign: 'left',
	},
	formSubmit: {
		height: 50,
		width: 180,
		borderRadius: 50,
	},
	accountExist: {
		marginTop: 10,
		color: '#ffffff80',
	},
});
