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
import type { Dispatch } from 'Actions_Types';
import { deviceSetState, requestDeviceAction } from 'Actions_Devices';
import ButtonLoadingIndicator from './ButtonLoadingIndicator';

type Props = {
	device: Object,
	deviceSetState: (id: number, command: number, value?: number) => void,
	requestDeviceAction: (id: number, command: number) => void,
	style: Object,
	command: number,
};

class BellButton extends View {
	props: Props;

	onBell: () => void;

	constructor(props: Props) {
		super(props);

		this.onBell = this.onBell.bind(this);
	}

	onBell() {
		this.props.deviceSetState(this.props.device.id, this.props.command);
		this.props.requestDeviceAction(this.props.device.id, this.props.command);
	}

	render(): React$Element<any> {
		let {methodRequested} = this.props.device;
		return (
			<RoundedCornerShadowView style={this.props.style}>
				<TouchableOpacity onPress={this.onBell} style={styles.bell}>
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

function mapDispatchToProps(dispatch: Dispatch): Object {
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
