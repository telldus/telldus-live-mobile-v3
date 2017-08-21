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
import { connect } from 'react-redux';
import Dimensions from 'Dimensions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { TouchableButton, H1, Text, View, Modal } from 'BaseComponents';
import {NotificationComponent, FormContainerComponent} from 'PreLoginScreen_SubViews';
import { loginToTelldus } from 'Actions';
import { authenticationTimeOut, testUsername, testPassword } from 'Config';

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

class LoginScreen extends View {
	props: Props;
	state: State;

	onChangeUsername: (username:string) => void;
	onChangePassword: (password:string) => void;
	onForgotPassword: () => void;
	onNeedAccount: () => void;
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
		this.onNeedAccount = this.onNeedAccount.bind(this);
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
			<FormContainerComponent>
				<H1 style={{
					margin: 20,
					color: '#fff',
					textAlign: 'center',
				}}>
					Login
				</H1>
				<View style={styles.textFieldCover}>
					<Icon name="email" style={styles.iconEmail} size={14} color="#ffffff80"/>
					<TextInput
						style={styles.formField}
						onChangeText={this.onChangeUsername}
						placeholder="Username"
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						placeholderTextColor="#ffffff80"
						underlineColorAndroid="#ffffff80"
						defaultValue={this.state.username}
					/>
				</View>
				<View style={styles.textFieldCover}>
					<Icon name="lock" style={styles.iconLock} size={15} color="#ffffff80"/>
					<TextInput
						style={styles.formField}
						onChangeText={this.onChangePassword}
						placeholder="Password"
						secureTextEntry={true}
						autoCapitalize="none"
						autoCorrect={false}
						placeholderTextColor="#ffffff80"
						underlineColorAndroid="#ffffff80"
						defaultValue={this.state.password}
					/>
				</View>
				<View style={{ height: 20 }}/>
				<TouchableButton
					style={styles.formSubmit}
					onPress={this.onFormSubmit}
					text={this.state.isLoading ? 'Logging in...' : 'LOGIN'}
				/>
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
					<Text style={{ color: '#bbb' }} onPress={this.onForgotPassword}>Forgot your password?</Text>
					<Text style={{ color: '#bbb', paddingLeft: 5 }} onPress={this.onNeedAccount}>Need an account?</Text>
				</View>
				<View style={{ height: 10 }}/>
				<Modal modalStyle={styles.notificationModal} showModal={this.state.notificationText}>
					<NotificationComponent text={this.state.notificationText} onPress={this._closeModal} />
				</Modal>
			</FormContainerComponent>
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

	onNeedAccount() {
		this.props.navigation.navigate('Register');
	}

	onForgotPassword() {
		this.props.navigation.navigate('ForgotPassword');
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
	textFieldCover: {
		height: 40,
		width: Dimensions.get('window').width * 0.7,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	iconLock: {
		top: 15,
		left: 14,
		position: 'absolute',
	},
	iconEmail: {
		top: 18,
		left: 15,
		position: 'absolute',
	},
	formField: {
		height: 35,
		padding: 7,
		paddingLeft: 25,
		marginTop: 10,
		marginLeft: 50,
		marginRight: 50,
		minWidth: 200,

		fontSize: 13,
		color: '#eee',
		textAlign: 'left',
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
