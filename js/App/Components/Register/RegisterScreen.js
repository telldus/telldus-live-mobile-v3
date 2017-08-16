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
import { KeyboardAvoidingView, Dimensions, StyleSheet, TextInput, ScrollView } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { BackgroundImage, View, Image, H1, Text, TouchableButton } from 'BaseComponents';

const deviceWidth = Dimensions.get('window').width;

class RegisterForm extends View {

	onFirstNameChange: string => void;
	onLastNameChange: string => void;
	onEmailChange: string => void;
	onConfirmEmailChange: string => void;
	onFormSubmit: () => void;

	constructor(props) {
		super(props);
		this.state = {
			firstName: '',
			lastName: '',
			email: '',
			confirmEmail: '',
			loading: false,
		};

		this.onFirstNameChange = this.onFirstNameChange.bind(this);
		this.onLastNameChange = this.onLastNameChange.bind(this);
		this.onEmailChange = this.onEmailChange.bind(this);
		this.onConfirmEmailChange = this.onConfirmEmailChange.bind(this);
		this.onFormSubmit = this.onFormSubmit.bind(this);
	}

	onFirstNameChange(firstName) {
		this.setState({
			firstName,
		});
	}

	onLastNameChange(lastName) {
		this.setState({
			lastName,
		});
	}

	onEmailChange(email) {
		this.setState({
			email,
		});
	}

	onConfirmEmailChange(confirmEmail) {
		this.setState({
			confirmEmail,
		});
	}

	onFormSubmit() {
		console.log('test onFormSubmit');
	}

	render() {
		return (
			<ScrollView contentContainerStyle={{
				backgroundColor: '#00000099',
				width: deviceWidth,
				padding: 10,
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
			}}>
			<H1 style={{
				margin: 20,
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
					placeholder="Confirm Email Address"
					keyboardType="email-address"
					autoCapitalize="none"
					autoCorrect={false}
					placeholderTextColor="#ffffff80"
					underlineColorAndroid="#ffffff80"
					defaultValue={this.state.confirmEmail}
				/>
			</View>
			<TouchableButton
				style={styles.formSubmit}
				onPress={this.onFormSubmit}
				text={this.state.isLoading ? 'REGISTERING...' : 'REGISTER'}
			/>
			<Text style={styles.accountExist}> I already have an account </Text>
			</ScrollView>
		);
	}
}

export default class RegisterScreen extends View {

	render() {
		return (
			<BackgroundImage source={require('./../Login/img/home5.jpg')}>
				<KeyboardAvoidingView behavior="position">
					<View style={{
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
					}}>
						<Image
							source={require('./../Login/img/telldusLogoBlack.png')}
							style={{
								marginTop: 60,
								marginBottom: 60,
							}}
						/>
						<RegisterForm />
					</View>
				</KeyboardAvoidingView>
			</BackgroundImage>
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
		marginTop: 10,
	},
	accountExist: {
		marginTop: 10,
		color: '#ffffff80',
	},
});
