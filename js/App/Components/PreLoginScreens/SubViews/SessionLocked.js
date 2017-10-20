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
import {defineMessages, intlShape, injectIntl} from 'react-intl';

import {
	Text,
	View,
	StyleSheet,
	Dimensions,
	TouchableButton,
} from 'BaseComponents';

import i18n from '../../../Translations/common';
import { logoutFromTelldus } from 'Actions';
import { refreshAccessToken } from 'LiveApi';

const messages = defineMessages({
	sessionLockedBodyParaOne: {
		id: 'user.sessionLockedBodyParaOne',
		defaultMessage: 'For some reason we can\'t connect your account right now.',
		description: 'Para One content for Session Locked Screen',
	},
	sessionLockedBodyParaTwo: {
		id: 'user.sessionLockedBodyParaTwo',
		defaultMessage: 'Make sure that your internet connection is working and retry by tapping the retry button below.',
		description: 'Para Two content for Session Locked Screen',
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

		this.bodyOne = this.props.intl.formatMessage(messages.sessionLockedBodyParaOne);
		this.bodyTwo = this.props.intl.formatMessage(messages.sessionLockedBodyParaTwo);
		this.buttonOne = this.props.intl.formatMessage(i18n.retry);
		this.buttonTwo = this.props.intl.formatMessage(i18n.logout);
		this.confirmMessage = this.props.intl.formatMessage(i18n.contentLogoutConfirm);
		this.onPressLogout = this.onPressLogout.bind(this);
	}

	onPressLogout() {
		this.props.dispatch({
			type: 'REQUEST_MODAL_OPEN',
			payload: {
				data: this.confirmMessage,
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
					{this.bodyOne}
				</Text>
				<Text/>
				<Text style={[styles.contentText, {paddingLeft: 20}]}>
					{this.bodyTwo}
				</Text>
				<TouchableButton
					onPress={this.props.refreshAccessToken}
					text={this.buttonOne}
					style={{marginTop: 10}}/>
				<TouchableButton
					onPress={this.onPressLogout}
					text={this.buttonTwo}
					style={{marginTop: 10}}/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	bodyCover: {
		width: Dimensions.get('window').width - 50,
	},
	contentText: {
		color: '#ffffff80',
		textAlign: 'center',
		fontSize: 12,
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
			refreshAccessToken();
		},
		dispatch,
	};
}
module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(SessionLocked));

