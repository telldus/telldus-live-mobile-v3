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

	onFirstNameChange: (string) => void;
	onLastNameChange: (string) => void;
	onEmailChange: (string) => void;
	onEmailBlur: () => void;
	onConfirmEmailChange: (string) => void;
	onConfirmEmailBlur: () => void;
	onFormSubmit: () => void;
	goBackToLogin: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			firstName: '',
			lastName: '',
			email: '',
			isEmailValid: false,
			confirmEmail: '',
			loading: false,
			validationMessage: '',
			formSubmitted: false,
		};

		this.onFirstNameChange = this.onFirstNameChange.bind(this);
		this.onLastNameChange = this.onLastNameChange.bind(this);
		this.onEmailChange = this.onEmailChange.bind(this);
		this.onEmailBlur = this.onEmailBlur.bind(this);
		this.onConfirmEmailChange = this.onConfirmEmailChange.bind(this);
		this.onConfirmEmailBlur = this.onConfirmEmailBlur.bind(this);
		this.onFormSubmit = this.onFormSubmit.bind(this);

		this.goBackToLogin = this.goBackToLogin.bind(this);
	}

	onFirstNameChange(firstName: string) {
		this.setState({
			firstName,
			validationMessage: '',
		});
	}

	onLastNameChange(lastName: string) {
		this.setState({
			lastName,
			validationMessage: '',
		});
	}

	onEmailChange(email: string) {
		this.setState({
			email,
			validationMessage: '',
		});
	}

	onEmailBlur() {
		let isEmailValid = this.validateEmail(this.state.email);
		if (isEmailValid) {
			this.onEmailValid();
		}
	}

	onConfirmEmailChange(confirmEmail: string) {
		this.setState({
			confirmEmail,
			validationMessage: '',
		});
	}

	onConfirmEmailBlur() {
		let isEmailValid = this.validateEmail(this.state.confirmEmail);
		if (isEmailValid) {
			this.onEmailValid();
		}
	}

	onFormSubmit() {
		let fn = this.state.firstName, ln = this.state.lastName, em = this.state.email, cem = this.state.confirmEmail;
		if (fn !== '' && ln !== '' && em !== '' && cem !== ''
			&& this.state.isEmailValid
			&& this.state.validationMessage === '') {
			this.setState({
				formSubmitted: true,
			});
		} else {
			let pf = 'can\'t be empty';
			let message = fn === '' ? `first name ${pf}` : ln === '' ? `last name ${pf}` : ln === '' ? `last name ${pf}` : ln === '' ? `last name ${pf}` : this.state.validationMessage;
			this.setState({
				validationMessage: message,
			});
		}
	}

	goBackToLogin() {
		this.props.navigation.navigate('Login');
	}

	validateEmail(email: string) {
		let pattern = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
		let emailValid = pattern.test(email);
		if (!emailValid) {
			this.setState({
				validationMessage: 'Invalid Email',
			});
		}
		return emailValid;
	}

	onEmailValid() {
		if (this.state.confirmEmail !== this.state.email) {
			this.setState({
				validationMessage: 'Email does not match',
			});
		} else {
			this.setState({
				isEmailValid: true,
			});
		}
	}

	render() {
		return (
			<FormContainer>
				<H1 style={{
					margin: 10,
					color: '#ffffff80',
					textAlign: 'center',
				}}>
				Create Account
				</H1>
				<View style={styles.textFieldCover}>
					<Icon name="account" style={styles.iconAccount} size={18} color="#ffffff80"/>
					<TextInput
						style={styles.formField}
						onChangeText={this.onFirstNameChange}
						placeholder="First Name"
						autoCapitalize="none"
						autoCorrect={false}
						placeholderTextColor="#ffffff80"
						underlineColorAndroid="#ffffff80"
						defaultValue={this.state.firstName}
					/>
				</View>
				<View style={styles.textFieldCover}>
					<Icon name="account" style={styles.iconAccount} size={18} color="#ffffff80"/>
					<TextInput
						style={styles.formField}
						onChangeText={this.onLastNameChange}
						placeholder="Last Name"
						autoCapitalize="none"
						autoCorrect={false}
						placeholderTextColor="#ffffff80"
						underlineColorAndroid="#ffffff80"
						defaultValue={this.state.lastName}
					/>
				</View>
				<View style={styles.textFieldCover}>
					<Icon name="email" style={styles.iconEmail} size={14} color="#ffffff80"/>
					<TextInput
						style={styles.formField}
						onChangeText={this.onEmailChange}
						onBlur={this.onEmailBlur}
						placeholder="Email Address"
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						placeholderTextColor="#ffffff80"
						underlineColorAndroid="#ffffff80"
						defaultValue={this.state.email}
					/>
				</View>
				<View style={styles.textFieldCover}>
					<Icon name="email" style={styles.iconEmail} size={14} color="#ffffff80"/>
					<TextInput
						style={styles.formField}
						onChangeText={this.onConfirmEmailChange}
						onBlur={this.onConfirmEmailBlur}
						placeholder="Confirm Email Address"
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						placeholderTextColor="#ffffff80"
						underlineColorAndroid="#ffffff80"
						defaultValue={this.state.confirmEmail}
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
					text={this.state.isLoading ? 'REGISTERING...' : 'REGISTER'}
				/>
				<Text style={styles.accountExist} onPress={this.goBackToLogin}> I already have an account </Text>
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
