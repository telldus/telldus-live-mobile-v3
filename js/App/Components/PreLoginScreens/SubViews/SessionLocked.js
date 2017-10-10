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
import {
	TouchableOpacity,
} from 'react-native';

import {
	H1,
	Text,
	View,
	StyleSheet,
	Dimensions,
} from 'BaseComponents';

import { logoutFromTelldus } from 'Actions';
import { refreshAccessToken } from 'LiveApi';

import Theme from 'Theme';

type SLProps = {
	refreshAccessToken: () => void;
	logoutFromTelldus: () => void;
};

class SessionLocked extends View {
	props: SLProps;

	onPressLogout: () => void;
	closeModal: () => void;

	constructor(props: SLProps) {
		super(props);
		this.state = {
			showModal: false,
		};

		this.onPressLogout = this.onPressLogout.bind(this);
		this.closeModal = this.closeModal.bind(this);
	}

	onPressLogout() {
		this.setState({
			showModal: true,
		});
	}

	closeModal() {
		this.setState({
			showModal: false,
		});
	}

	render(): Object {
		return (
			<View style={styles.container}>
				<H1 style={{
					margin: 20,
					color: '#fff',
					textAlign: 'center',
				}}>
					Lost Connection
				</H1>
				<View style={styles.bodyCover}>
					<Text style={styles.contentText}>
						For some reason we can't connect your account right now.
					</Text>
					<Text/>
					<Text style={[styles.contentText, {paddingLeft: 20}]}>
						Make sure that your internet connection is working and retry by tapping the retry button below.
					</Text>
					<TouchableOpacity
						onPress={this.props.refreshAccessToken}
						style={[styles.button, {marginTop: 10}]}>
						<View style={styles.button}>
							<Text style={{color: '#fff'}}>
									RETRY
							</Text>
						</View>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={this.onPressLogout}
						style={[styles.button, {marginTop: 10}]}>
						<View style={styles.button}>
							<Text style={{color: '#fff'}}>
									LOGOUT
							</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#00000099',
		width: Dimensions.get('window').width,
		padding: 10,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	bodyCover: {
		width: Dimensions.get('window').width - 50,
	},
	contentText: {
		color: '#fff',
		textAlign: 'center',
		fontSize: 12,
	},
	button: {
		height: 50,
		width: 200,
		backgroundColor: Theme.Core.btnPrimaryBg,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 30,
		alignSelf: 'center',
	},
});

function mapStateToProps(store) {
	return {
		tab: store.navigation.tab,
		accessToken: store.user.accessToken,
		isTokenValid: store.user.isTokenValid,
	};
}
function mapDispatchToProps(dispatch) {
	return {
		logoutFromTelldus: () => {
			dispatch(logoutFromTelldus());
		},
		refreshAccessToken: () => {
			dispatch(refreshAccessToken());
		},
		dispatch,
	};
}
module.exports = connect(mapStateToProps, mapDispatchToProps)(SessionLocked);

