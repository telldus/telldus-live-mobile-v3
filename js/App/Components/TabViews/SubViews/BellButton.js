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

import { View, RoundedCornerShadowView, Icon } from 'BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { deviceSetState, requestDeviceAction } from 'Actions_Devices';
import ButtonLoadingIndicator from './ButtonLoadingIndicator';
import i18n from '../../../Translations/common';

type Props = {
	device: Object,
	deviceSetState: (id: number, command: number, value?: number) => void,
	requestDeviceAction: (id: number, command: number) => void,
	style: Object,
	command: number,
	intl: Object,
};

class BellButton extends View {
	props: Props;

	onBell: () => void;

	constructor(props: Props) {
		super(props);

		this.onBell = this.onBell.bind(this);
		this.labelBellButton = `${props.intl.formatMessage(i18n.bell)} ${props.intl.formatMessage(i18n.button)}`;
	}

	onBell() {
		this.props.deviceSetState(this.props.device.id, this.props.command);
		this.props.requestDeviceAction(this.props.device.id, this.props.command);
	}

	render() {
		let { methodRequested, name } = this.props.device;
		let accessibilityLabel = `${this.labelBellButton}, ${name}`;

		return (
			<RoundedCornerShadowView style={this.props.style}>
				<TouchableOpacity onPress={this.onBell} style={styles.bell} accessibilityLabel={accessibilityLabel}>
					<Icon name="bell" size={22} color="orange" />
				</TouchableOpacity>
				{
					methodRequested === 'BELL' ?
						<ButtonLoadingIndicator style={styles.dot} />
						:
						null
				}
			</RoundedCornerShadowView>
		);
	}
}

BellButton.defaultProps = {
	command: 4,
};

const styles = StyleSheet.create({
	bell: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	dot: {
		position: 'absolute',
		top: 3,
		left: 3,
	},
});

function mapDispatchToProps(dispatch) {
	return {
		deviceSetState: (id: number, command: number, value?: number) =>{
			dispatch(deviceSetState(id, command, value));
		},
		requestDeviceAction: (id: number, command: number) => {
			dispatch(requestDeviceAction(id, command));
		},
	};
}

module.exports = connect(null, mapDispatchToProps)(BellButton);
