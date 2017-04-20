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
import Forms from 'tcomb-form-native';
import Dimensions from 'Dimensions';
import Orientation from 'react-native-orientation';
import Platform from 'Platform';

import { Button, Container, Content, H1, Icon, Text, View } from 'BaseComponents';
import { getAccessToken, loginToTelldus, switchTab } from 'Actions';
import { apiServer, publicKey, privateKey, testUsername, testPassword } from 'Config';

import Image from 'Image';
import StyleSheet from 'StyleSheet';
import StatusBar from 'StatusBar';
import Theme from 'Theme';

import {stylesheet} from 'tcomb-form-native/lib/stylesheets/bootstrap';

var Form = Forms.form.Form;
var LoginDetails = Forms.struct({
	username: Forms.String,
	password: Forms.String,
});

class LoginScreen extends View {
	constructor(props) {
		super(props);
	}

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
			<View>
				<Image
					style = { styles.backgroundImage }
					source = { require('./img/home5.jpg') }
				/>
				<View style = {{
					position: 'absolute',
					top: 0,
					left: 0,
					width: Dimensions.get('window').width,
					height: Dimensions.get('window').height,
					flexDirection: 'column',
					justifyContent: 'space-around',
					alignItems: 'center',
					paddingTop: 20
				}}>
					<Image
						source = { require('./img/telldusLogoBlack.png') }
					/>
					<View style = {{
						minWidth: 425,
						padding: 10,
						backgroundColor: "#00000099",
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
					}}>
						<View style = {{ height:20 }} />
						<H1 style = {{ marginBottom: 20, color: "#fff" }}>
							Login
						</H1>
						<Form
							ref="loginForm"
							type={ LoginDetails }
							value={{ username: testUsername, password: testPassword }}
							options={{
								auto: 'placeholders',
								stylesheet: Theme.Forms,
								fields: {
									username: {
										autoCapitalize: 'none',
										autoCorrect: false,
										placeholderTextColor: "#ffffff80"
									},
									password: {
										secureTextEntry: true,
										autoCapitalize: 'none',
										autoCorrect: false,
										placeholderTextColor: "#ffffff80"
									}
								}
							}}
						/>
						<View style = {{ height:20 }} />
						<Button
							name = { apiServer == 'https://api.telldus.com' ? 'lock' : 'exclamation-circle' }
							backgroundColor = { this.getTheme().btnPrimaryBg }
							style = {{ padding: 6, minWidth: 100 }}
							onPress={ () => this.logIn() }
						>Login</Button>
						<View style = {{ height:20 }} />
					</View>
					<View style = {{  }} />
				</View>
			</View>
		)
	}

	async logIn() {
		const { dispatch } = this.props;
		this.setState({ isLoading: true });

		await new Promise((resolve, reject) => {
			loginToTelldus(this.refs.loginForm.getValue().username, this.refs.loginForm.getValue().password)
				.then(function(response) { resolve(response) })
				.catch(function(e) { reject(new Error('Failed login')) });
			setTimeout(() => reject(new Error('Timed out')), 3000);
		})
		.then(function(response) { dispatch(response); })
		.catch(function(e) { console.log(e); });

		this._isMounted && this.setState({ isLoading: false });
	}
}

var styles = StyleSheet.create({
	backgroundImage: {
		flex: 1,
		backgroundColor: 'transparent',
		width: undefined,
		height: undefined

	}
});

function select(store) {
	return {
		tab: store.navigation.tab,
		accessToken: store.user.accessToken
	};
}
module.exports = connect(select)(LoginScreen);
