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
import { deviceSetState } from '../../../../Actions/Devices';
import Theme from '../../../../Theme';

type Props = {
	device: Object,
	commandStop: number,
	deviceSetState: (id: number, command: number, value?: number) => void,
	intl: Object,
	isGatewayActive: boolean,
	isInState: boolean,
	name: string,
	methodRequested: string,
	supportedMethod: string,
	id: number,
	iconSize: number,
	style: Object | Array<any> | number,
	local: boolean,
	isOpen: boolean,
	closeSwipeRow: () => void,
};

class StopButton extends View {
	props: Props;

	onStop: (number) => void;

	constructor(props: Props) {
		super(props);

		this.onStop = this.onStop.bind(this);

		this.labelStopButton = `${props.intl.formatMessage(i18n.stop)} ${props.intl.formatMessage(i18n.button)}`;
	}
	onStop() {
		const { commandStop, id, isOpen, closeSwipeRow } = this.props;
		if (isOpen && closeSwipeRow) {
			closeSwipeRow();
			return;
		}
		this.props.deviceSetState(id, commandStop);
	}

	render(): Object {
		const noop = function () {
		};

		let { isGatewayActive, supportedMethod, isInState,
			name, methodRequested, iconSize, style, local } = this.props;

		let stopButtonStyle = !isGatewayActive ?
			(isInState === 'STOP' ? styles.offlineBackground : styles.disabledBackground) : (isInState === 'STOP' ? styles.enabledBackgroundStop : styles.disabledBackground);
		let stopIconColor = !isGatewayActive ?
			(isInState === 'STOP' ? '#fff' : '#a2a2a2') : (isInState === 'STOP' ? '#fff' : Theme.Core.brandPrimary);
		let dotColor = isInState === methodRequested ? '#fff' : local ? Theme.Core.brandPrimary : Theme.Core.brandSecondary;

		return (
			<TouchableOpacity
				style={[stopButtonStyle, style]}
				onPress={supportedMethod ? this.onStop : noop}
				accessibilityLabel={`${this.labelStopButton}, ${name}`}>
				<Icon name="stop" size={iconSize}
					style={{
						color: supportedMethod ? stopIconColor : '#eeeeee',
					}}
				/>
				{
					methodRequested === 'STOP' ?
						<ButtonLoadingIndicator style={styles.dot} color={dotColor}/>
						:
						null
				}
			</TouchableOpacity>
		);
	}
}

StopButton.defaultProps = {
	commandUp: 128,
	commandDown: 256,
	commandStop: 512,
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
	};
}

module.exports = connect(null, mapDispatchToProps)(StopButton);
