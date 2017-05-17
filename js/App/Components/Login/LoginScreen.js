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

'use strict';

import React from 'react';
import { connect } from 'react-redux';
import Dimensions from 'Dimensions';
import Orientation from 'react-native-orientation';
import Platform from 'Platform';

import { TextInput, Linking, KeyboardAvoidingView } from 'react-native';

import { BackgroundImage, Button, H1, Text, View } from 'BaseComponents';
import { loginToTelldus } from 'Actions';
import { authenticationTimeOut, telldusLiveWebAuthenticationUrl } from 'Config';

import Image from 'Image';
import StyleSheet from 'StyleSheet';
import StatusBar from 'StatusBar';
import Theme from 'Theme';

class LoginForm extends View {
	constructor(props) {
		super(props);

		this.state = this.state || {};
	}

	render() {
		return (
			<View style = {{
				backgroundColor: '#00000099',
				width: Dimensions.get('window').width,
				padding: 10,
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
			}}>
				<H1 style={{ margin: 20, color: '#fff', textAlign: 'center' }}>
					Login
				</H1>
				{ this.state.notificationText ? (
					<Text style={styles.notification}>{this.state.notificationText}</Text>
				) : null }
				<TextInput
					style={styles.formField}
					onChangeText={username => this.setState({ username, notificationText: false })}
					placeholder="Username"
					autoCapitalize = "none"
					autoCorrect = {false}
					placeholderTextColor = "#ffffff80"
				/>
				<TextInput
					style={styles.formField}
					onChangeText={password => this.setState({ password, notificationText: false })}
					placeholder="Password"
					secureTextEntry={true}
					autoCapitalize = "none"
					autoCorrect = {false}
					placeholderTextColor = "#ffffff80"
				/>
				<View style = {{ height: 20 }} />
				<Button
					name="lock"
					style={styles.formSubmit}
					onPress={() => this.formSubmit(this.state.username, this.state.password)}
				>{ this.state.isLoading ? 'Logging in...' : 'Login' }</Button>
				<View style = {{ height: 40 }} />
				<Text style={{ color: '#bbb' }} onPress={() => Linking.openURL(telldusLiveWebAuthenticationUrl).catch(err => console.error('An error occurred', err))}>Forget your password? Need an account?</Text>
				<View style = {{ height: 10 }} />
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
}

class LoginScreen extends View {
	componentDidMount() {
		Platform.OS === 'ios' && StatusBar && StatusBar.setBarStyle('default');
		if (Platform.OS === 'android' && StatusBar) {
			StatusBar.setTranslucent(true);
			StatusBar.setBackgroundColor('rgba(0, 0, 0, 0.2)');
		}
		if (Platform.OS !== 'android') {
			Orientation.lockToPortrait();
		}
	}

	componentWillUnmount() {
		if (Platform.OS !== 'android') {
			Orientation.unlockAllOrientations();
		}
	}

	render() {
		return (
			<BackgroundImage source = {require('./img/home5.jpg')}>
				<KeyboardAvoidingView behavior="position">
					<View style = {{
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
					}}>
						<Image
							source = {require('./img/telldusLogoBlack.png')}
							style = {{ marginTop: 100, marginBottom: 100 }}
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

		backgroundColor: Theme.Core.btnPrimaryBg,
	},
});

function select(store) {
	return {
		tab: store.navigation.tab,
		accessToken: store.user.accessToken,
	};
}
module.exports = connect(select)(LoginScreen);
