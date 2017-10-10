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
import {defineMessages, intlShape, injectIntl} from 'react-intl';

import {
	Text,
	View,
	StyleSheet,
	Dimensions,
} from 'BaseComponents';

import { logoutFromTelldus } from 'Actions';
import { refreshAccessToken } from 'LiveApi';

import Theme from 'Theme';

const messages = defineMessages({
	sessionLocked: {
		id: 'user.sessionLockedLogoutConfirm',
		defaultMessage: 'If you logout from your account you will have to add your devices to your dashboard manually.',
		description: 'Content for Logout Confirmation Dialoge in Session Locked Screen',
	},
});

type Props = {
	refreshAccessToken: () => void;
	logoutFromTelldus: () => void;
	intl: intlShape.isRequired,
	dispatch: Function;
	onPressLogout: boolean,
};

class SessionLocked extends View {
	props: Props;

	onPressLogout: () => void;

	constructor(props: Props) {
		super(props);

		this.onPressLogout = this.onPressLogout.bind(this);
	}

	onPressLogout() {
		let message = this.props.intl.formatMessage(messages.sessionLocked);
		this.props.dispatch({
			type: 'REQUEST_MODAL_OPEN',
			payload: {
				data: message,
			},
		});
	}

	componentWillReceiveProps(nextProps: Object) {
		if (nextProps.onPressLogout) {
			this.props.logoutFromTelldus();
		}
	}

	render(): Object {
		return (
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
		color: '#ffffff80',
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
module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(SessionLocked));

