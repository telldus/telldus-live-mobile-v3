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
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { defineMessages, intlShape, injectIntl } from 'react-intl';

import { Text, View } from 'BaseComponents';

const messages = defineMessages({
	defaultHeader: {
		id: 'notification.defaultHeader',
		defaultMessage: 'OOPS',
		description: 'Default Header for the notification component',
	},
});


type Props = {
	onPress: Function,
	text: string,
	header?: string,
	intl: intlShape.isRequired,
}

class NotificationComponent extends View {

	props: Props;

	_closeModal: () => void;

	constructor(props: Props) {
		super(props);
		this._closeModal = this._closeModal.bind(this);
	}

	_closeModal() {
		this.props.onPress();
	}

	render() {
		let header = this.props.header ? this.props.header :
			`${this.props.intl.formatMessage(messages.defaultHeader)}!`;
		return (
			<View>
				<View style={styles.notificationModalHeader}>
					<Text style={styles.notificationModalHeaderText}>
						{header}
					</Text>
				</View>
				<View style={styles.notificationModalBody}>
					<Text style={styles.notificationModalBodyText}>{this.props.text}</Text>
				</View>
				<View style={styles.notificationModalFooter}>
					<TouchableOpacity style={styles.notificationModalFooterTextCover}
						onPress={this._closeModal}>
						<Text style={styles.notificationModalFooterText}>OK</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	notificationModalHeader: {
		justifyContent: 'center',
		alignItems: 'flex-start',
		paddingLeft: 20,
		height: Dimensions.get('window').height * 0.08,
		width: Dimensions.get('window').width * 0.75,
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
		height: Dimensions.get('window').height * 0.2,
		width: Dimensions.get('window').width * 0.75,
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
		width: Dimensions.get('window').width * 0.75,
	},
	notificationModalFooterTextCover: {
		alignItems: 'flex-end',
		justifyContent: 'center',
		height: Dimensions.get('window').height * 0.08,
		width: Dimensions.get('window').width * 0.3,
	},
	notificationModalFooterText: {
		color: '#e26901',
		fontSize: 14,
		fontWeight: 'bold',
	},
});

export default injectIntl(NotificationComponent);
