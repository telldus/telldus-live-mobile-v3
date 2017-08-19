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
import Dimensions from 'Dimensions';


import { TextInput, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native';

import { BackgroundImage, TouchableButton, H1, Text, View, Modal } from 'BaseComponents';
import { loginToTelldus } from 'Actions';
import { authenticationTimeOut, testUsername, testPassword } from 'Config';

import Image from 'Image';
import StyleSheet from 'StyleSheet';
import Theme from 'Theme';

type Props = {
  dispatch: Function,
  screenProps: Object,
  navigation: Object,
};

type State = {
  notificationText? : string,
  isLoading : boolean,
  username: string,
  password: string,
};

class LoginForm extends View {
	props: Props;
	state: State;

	onChangeUsername: (username:string) => void;
	onChangePassword: (password:string) => void;
	onForgotPassword: () => void;
	onFormSubmit: () => void;
	_closeModal: () => void;

	constructor(props: Props) {
		super(props);

		this.state = this.state || {
			username: testUsername,
			password: testPassword,
			notificationText: false,
		};

		this.onChangeUsername = this.onChangeUsername.bind(this);
		this.onChangePassword = this.onChangePassword.bind(this);
		this.onForgotPassword = this.onForgotPassword.bind(this);
		this.onFormSubmit = this.onFormSubmit.bind(this);

		this._closeModal = this._closeModal.bind(this);
	}

	_closeModal() {
		this.setState({
			notificationText: false,
		});
	}

	render() {
		return (
			<View style={{
				backgroundColor: '#00000099',
				width: Dimensions.get('window').width,
				padding: 10,
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
			}}>
				<H1 style={{
					margin: 20,
					color: '#fff',
					textAlign: 'center',
				}}>
					Login
				</H1>
				<TextInput
					style={styles.formField}
					onChangeText={this.onChangeUsername}
					placeholder="Username"
					keyboardType="email-address"
					autoCapitalize="none"
					autoCorrect={false}
					placeholderTextColor="#ffffff80"
					defaultValue={this.state.username}
				/>
				<TextInput
					style={styles.formField}
					onChangeText={this.onChangePassword}
					placeholder="Password"
					secureTextEntry={true}
					autoCapitalize="none"
					autoCorrect={false}
					placeholderTextColor="#ffffff80"
					defaultValue={this.state.password}
				/>
				<View style={{ height: 20 }}/>
				<TouchableButton
					style={styles.formSubmit}
					onPress={this.onFormSubmit}
					text={this.state.isLoading ? 'Logging in...' : 'Login'}
					/>
				<View style={{ height: 40 }}/>
				<Text style={{ color: '#bbb' }} onPress={this.onForgotPassword}>Forget your password? Need an
				                                                                account?</Text>
				<View style={{ height: 10 }}/>
				<Modal modalStyle={styles.notificationModal} showModal={this.state.notificationText}>
					<View style={styles.notificationModalHeader}>
						<Text style={styles.notificationModalHeaderText}>ERROR</Text>
					</View>
					<View style={styles.notificationModalBody}>
						<Text style={styles.notificationModalBodyText}>{this.state.notificationText}</Text>
					</View>
					<View style={styles.notificationModalFooter}>
						<TouchableWithoutFeedback style={styles.notificationModalFooterTextCover}
						onPress={this._closeModal}>
							<Text style={styles.notificationModalFooterText}>OK</Text>
						</TouchableWithoutFeedback>
					</View>
				</Modal>
			</View>
		);
	}

	async formSubmit(username, password) {
		this.setState({ isLoading: true });
		await new Promise((resolve, reject) => {
			loginToTelldus(username, password)
				.then(response => resolve(response))
				.catch(reject);
			setTimeout(() => reject(new Error('timeout')), authenticationTimeOut);
		})
			.then(response => this.props.dispatch(response))
			.catch(e => {
				const message = e.message === 'timeout' ? 'Timed out, try again?' : e.message.error_description;
				this.setState({ notificationText: message });
				this.setState({ isLoading: false });
			});
	}

	onChangeUsername(username) {
		this.setState({
			username,
			notificationText: false,
		});
	}

	onChangePassword(password) {
		this.setState({
			password,
			notificationText: false,
		});
	}

	onFormSubmit() {
		this.formSubmit(this.state.username, this.state.password);
	}

	onForgotPassword() {
		this.props.navigation.navigate('Register');
	}
}

class LoginScreen extends View {
	render() {
		return (
			<BackgroundImage source={require('./img/home5.jpg')}>
				<KeyboardAvoidingView behavior="position">
					<View style={{
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
					}}>
						<Image
							source={require('./img/telldusLogoBlack.png')}
							style={{
								marginTop: 100,
								marginBottom: 100,
							}}
						/>
						<LoginForm {...this.props} />
					</View>
				</KeyboardAvoidingView>
			</BackgroundImage>
		);
	}
}

const styles = StyleSheet.create({
	notification: {
		padding: 7,
		marginTop: 10,
		marginLeft: 100,
		marginRight: 100,

		borderColor: '#f00',
		borderWidth: 1,
		borderRadius: 3,

		fontSize: 13,
		color: '#fdd',
		textAlign: 'center',
		backgroundColor: '#ff000033',
	},
	notificationModal: {
		backgroundColor: '#ffffff',
		position: 'absolute',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		top: 45,
	},
	notificationModalHeader: {
		justifyContent: 'center',
		alignItems: 'flex-start',
		paddingLeft: 20,
		height: Dimensions.get('window').height * 0.08,
		width: Dimensions.get('window').width * 0.7,
		backgroundColor: '#e26901',
	},
	notificationModalHeaderText: {
		color: '#ffffff',
		fontSize: 14,
	},
	notificationModalBody: {
		justifyContent: 'center',
		alignItems: 'flex-start',
		paddingLeft: 20,
		paddingRight: 10,
		height: Dimensions.get('window').height * 0.15,
		width: Dimensions.get('window').width * 0.7,
	},
	notificationModalBodyText: {
		fontSize: 14,
		color: '#6B6969',
	},
	notificationModalFooter: {
		alignItems: 'flex-end',
		justifyContent: 'center',
		paddingRight: 20,
		height: Dimensions.get('window').height * 0.08,
		width: Dimensions.get('window').width * 0.7,
	},
	notificationModalFooterTextCover: {
		height: Dimensions.get('window').height * 0.08,
		width: Dimensions.get('window').width * 0.3,
	},
	notificationModalFooterText: {
		color: '#e26901',
		fontSize: 14,
		fontWeight: 'bold',
	},
	formField: {
		height: 35,
		padding: 7,
		marginTop: 10,
		marginLeft: 50,
		marginRight: 50,
		minWidth: 200,
		borderColor: '#ccc',
		borderWidth: 1,
		borderRadius: 3,

		fontSize: 13,
		color: '#eee',
		textAlign: 'center',
	},
	formSubmit: {
		padding: 6,
		minWidth: 100,
		height: 50,
		width: 180,
		borderRadius: 50,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Theme.Core.btnPrimaryBg,
	},
});

function mapStateToProps(store) {
	return {
		tab: store.navigation.tab,
		accessToken: store.user.accessToken,
	};
}
module.exports = connect(mapStateToProps)(LoginScreen);
