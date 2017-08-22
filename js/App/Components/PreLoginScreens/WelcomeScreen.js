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

import { StyleSheet } from 'react-native';

import { View, Text, TouchableButton } from 'BaseComponents';
import {FormContainerComponent} from 'PreLoginScreen_SubViews';

type Props = {
	accessToken: Object,
	onPressOK: Function,
	registeredCredential: any,
}

class WelcomeScreen extends View {

	props: Props;

	onPressOK: () => void;

	constructor(props: Props) {
		super(props);
		this.onPressOK = this.onPressOK.bind(this);
	}

	onPressOK() {
		this.props.onPressOK(this.props.registeredCredential);
	}

	render() {
		return (
			<FormContainerComponent headerText="Welcome to Telldus!">
				<Text style={styles.textBody}>Your account is created and you will now be logged in.</Text>
				<Text style={styles.textBody}>An email is sent to you with a link to confirm your account.
				 Please confirm your account within 24 hours, otherwise the account will be deleted.</Text>
				<TouchableButton
					style={styles.formSubmit}
					onPress={this.onPressOK}
					text={'GOT IT'}
				/>
			</FormContainerComponent>
		);
	}
}

const styles = StyleSheet.create({
	textBody: {
		color: '#ffffff80',
		marginTop: 20,
		textAlign: 'center',
		fontSize: 13,
	},
	formSubmit: {
		height: 50,
		width: 180,
		marginTop: 20,
		borderRadius: 50,
	},
});

function mapStateToProps(store) {
	return {
		registeredCredential: store.user.registeredCredential,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onPressOK: (accessToken) => {
			dispatch({
				type: 'RECEIVED_ACCESS_TOKEN',
				accessToken,
			});
		},
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(WelcomeScreen);
