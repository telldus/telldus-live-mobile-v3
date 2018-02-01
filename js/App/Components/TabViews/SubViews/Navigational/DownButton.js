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

import { Icon, View } from 'BaseComponents';
import { StyleSheet, TouchableOpacity } from 'react-native';

import ButtonLoadingIndicator from '../ButtonLoadingIndicator';
import i18n from '../../../../Translations/common';
import { deviceSetState, requestDeviceAction } from 'Actions_Devices';
import Theme from 'Theme';

type Props = {
	commandDown: number,
	deviceSetState: (id: number, command: number, value?: number) => void,
	requestDeviceAction: (id: number, command: number) => void,
	intl: Object,
	isGatewayActive: boolean,
	isInState: boolean,
	name: string,
	methodRequested: string,
	supportedMethod: string,
	id: number,
	iconSize: number,
};

class DownButton extends View {
	props: Props;

	onDown: (number) => void;

	constructor(props: Props) {
		super(props);

		this.onDown = this.onDown.bind(this);

		this.labelDownButton = `${props.intl.formatMessage(i18n.down)} ${props.intl.formatMessage(i18n.button)}`;
	}

	onDown() {
		this.props.requestDeviceAction(this.props.id, this.props.commandDown);
		this.props.deviceSetState(this.props.id, this.props.commandDown);
	}

	render() {
		const noop = function () {
		};

		let { isGatewayActive, supportedMethod, isInState,
			name, methodRequested, iconSize } = this.props;


		let downButtonStyle = !isGatewayActive ?
			(isInState === 'DOWN' ? styles.offlineBackground : styles.disabledBackground) : (isInState === 'DOWN' ? styles.enabledBackground : styles.disabledBackground);
		let downIconColor = !isGatewayActive ?
			(isInState === 'DOWN' ? '#fff' : '#a2a2a2') : (isInState === 'DOWN' ? '#fff' : Theme.Core.brandSecondary);


		return (
			<TouchableOpacity
				style={[styles.navigationButton, downButtonStyle]}
				onPress={supportedMethod ? this.onDown : noop}
				accessibilityLabel={`${this.labelDownButton}, ${name}`}>
				<Icon name="caret-down" size={iconSize}
					style={{
						color: supportedMethod ? downIconColor : '#eeeeee',
					}}
				/>
				{
					methodRequested === 'DOWN' ?
						<ButtonLoadingIndicator style={styles.dot} />
						:
						null
				}
			</TouchableOpacity>
		);
	}
}

DownButton.defaultProps = {
	commandDown: 256,
};

const styles = StyleSheet.create({
	navigationButton: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	enabled: {
		color: '#1a355b',
	},
	enabledBackground: {
		backgroundColor: Theme.Core.brandSecondary,
	},
	disabledBackground: {
		backgroundColor: '#eeeeee',
	},
	enabledBackgroundStop: {
		backgroundColor: Theme.Core.brandPrimary,
	},
	offlineBackground: {
		backgroundColor: '#a2a2a2',
	},
	disabled: {
		color: '#eeeeee',
	},
	dot: {
		position: 'absolute',
		top: 3,
		left: 3,
	},
});

function mapDispatchToProps(dispatch) {
	return {
		deviceSetState: (id: number, command: number, value?: number) => dispatch(deviceSetState(id, command, value)),
		requestDeviceAction: (id: number, command: number) => dispatch(requestDeviceAction(id, command)),
	};
}

module.exports = connect(null, mapDispatchToProps)(DownButton);
