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

import { Icon, View } from '../../../../../BaseComponents';
import { StyleSheet, TouchableOpacity } from 'react-native';

import ButtonLoadingIndicator from '../ButtonLoadingIndicator';
import i18n from '../../../../Translations/common';
import { deviceSetState, requestDeviceAction } from '../../../../Actions/Devices';
import Theme from '../../../../Theme';

type Props = {
	commandUp: number,
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
	style: Object | Array<any> | number,
};

class UpButton extends View {
	props: Props;

	onUp: (number) => void;

	constructor(props: Props) {
		super(props);

		this.onUp = this.onUp.bind(this);

		this.labelUpButton = `${props.intl.formatMessage(i18n.up)} ${props.intl.formatMessage(i18n.button)}`;
	}

	onUp() {
		this.props.requestDeviceAction(this.props.id, this.props.commandUp);
		this.props.deviceSetState(this.props.id, this.props.commandUp);
	}

	render(): Object {
		const noop = function () {
		};

		let { isGatewayActive, supportedMethod, isInState,
			name, methodRequested, iconSize, style } = this.props;

		let upButtonStyle = !isGatewayActive ?
			(isInState === 'UP' ? styles.offlineBackground : styles.disabledBackground) : (isInState === 'UP' ? styles.enabledBackground : styles.disabledBackground);
		let upIconColor = !isGatewayActive ?
			(isInState === 'UP' ? '#fff' : '#a2a2a2') : (isInState === 'UP' ? '#fff' : Theme.Core.brandSecondary);

		return (
			<TouchableOpacity
				style={[upButtonStyle, style]}
				onPress={supportedMethod ? this.onUp : noop}
				accessibilityLabel={`${this.labelUpButton}, ${name}`}>
				<Icon name="caret-up" size={iconSize}
		      style={{
			      color: supportedMethod ? upIconColor : '#eeeeee',
		      }}
				/>
				{
					methodRequested === 'UP' ?
						<ButtonLoadingIndicator style={styles.dot} />
						:
						null
				}
			</TouchableOpacity>
		);
	}
}

UpButton.defaultProps = {
	commandUp: 128,
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

function mapDispatchToProps(dispatch: Function): Object {
	return {
		deviceSetState: (id: number, command: number, value?: number): any => dispatch(deviceSetState(id, command, value)),
		requestDeviceAction: (id: number, command: number): any => dispatch(requestDeviceAction(id, command)),
	};
}

module.exports = connect(null, mapDispatchToProps)(UpButton);
