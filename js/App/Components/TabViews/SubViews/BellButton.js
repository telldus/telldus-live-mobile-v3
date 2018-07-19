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

import { View, Icon } from '../../../../BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { deviceSetState } from '../../../Actions/Devices';
import ButtonLoadingIndicator from './ButtonLoadingIndicator';
import i18n from '../../../Translations/common';
import Theme from '../../../Theme';

type Props = {
	device: Object,
	deviceSetState: (id: number, command: number, value?: number) => void,
	style: Object,
	command: number,
	intl: Object,
	isGatewayActive: boolean,
	appLayout: Object,
	bellButtonStyle: number | Object,
	local: boolean,
	isOpen: boolean,
	closeSwipeRow: () => void,
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
		const { command, device, isOpen, closeSwipeRow } = this.props;
		if (isOpen && closeSwipeRow) {
			closeSwipeRow();
			return;
		}
		this.props.deviceSetState(device.id, command);
	}

	render(): Object {
		let { device, isGatewayActive, bellButtonStyle } = this.props;
		let { methodRequested, name, local } = device;
		let accessibilityLabel = `${this.labelBellButton}, ${name}`;
		let iconColor = !isGatewayActive ? '#a2a2a2' : Theme.Core.brandSecondary;
		let dotColor = local ? Theme.Core.brandPrimary : Theme.Core.brandSecondary;

		return (
			<TouchableOpacity onPress={this.onBell} style={[styles.bell, this.props.style, bellButtonStyle]} accessibilityLabel={accessibilityLabel}>
				<Icon name="bell" size={22} color={iconColor} />

				{
					methodRequested === 'BELL' ?
						<ButtonLoadingIndicator style={styles.dot} color={dotColor}/>
						:
						null
				}
			</TouchableOpacity>
		);
	}
}

BellButton.defaultProps = {
	command: 4,
};

const styles = StyleSheet.create({
	bell: {
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#eeeeee',
	},
	dot: {
		position: 'absolute',
		top: 3,
		left: 3,
	},
});

function mapDispatchToProps(dispatch: Function): Object {
	return {
		deviceSetState: (id: number, command: number, value?: number) =>{
			dispatch(deviceSetState(id, command, value));
		},
	};
}

module.exports = connect(null, mapDispatchToProps)(BellButton);
