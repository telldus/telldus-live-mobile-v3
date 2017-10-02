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

import { View, Icon } from 'BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';
import DashboardShadowTile from './DashboardShadowTile';

import ButtonLoadingIndicator from './ButtonLoadingIndicator';

import { deviceSetState, requestDeviceAction } from 'Actions_Devices';
import type { Dispatch } from 'Actions_Types';

const UpButton = ({ isEnabled, onPress, methodRequested }: Object): React$Element<any> => (
	<TouchableOpacity
		style={styles.navigationButton}
		onPress={onPress}>
		<Icon name="caret-up"
		      size={42}
		      style={isEnabled ? styles.buttonEnabled : styles.buttonDisabled}
		/>
		{
			methodRequested === 'UP' ?
				<ButtonLoadingIndicator style={styles.dot} />
				:
				null
		}
	</TouchableOpacity>
);

const DownButton = ({ isEnabled, onPress, methodRequested }: Object): React$Element<any> => (
	<TouchableOpacity
		style={styles.navigationButton}
		onPress={onPress}>
		<Icon name="caret-down"
		      size={42}
		      style={isEnabled ? styles.buttonEnabled : styles.buttonDisabled}
		/>
		{
			methodRequested === 'DOWN' ?
				<ButtonLoadingIndicator style={styles.dot} />
				:
				null
		}
	</TouchableOpacity>
);

const StopButton = ({ isEnabled, onPress, methodRequested }: Object): React$Element<any> => (
	<TouchableOpacity
		style={styles.navigationButton}
		onPress={onPress}>
		<Icon name="stop"
		      size={30}
		      style={isEnabled ? styles.buttonEnabled : styles.buttonDisabled}
		/>
		{
			methodRequested === 'STOP' ?
				<ButtonLoadingIndicator style={styles.dot} />
				:
				null
		}
	</TouchableOpacity>
);

type Props = {
	item: Object,
	tileWidth: number,
	onUp: number => void,
	onDown: number => void,
	onStop: number => void,
	style: Object,
	commandUp: number,
	commandDown: number,
	commandStop: number,
	deviceSetState: (id: number, command: number, value?: number) => void,
	requestDeviceAction: (id: number, command: number) => void,
};

class NavigationalDashboardTile extends View {
	props: Props;

	onUp: (number) => void;
	onDown: (number) => void;
	onStop: (number) => void;

	constructor(props: Props) {
		super(props);

		this.onUp = this.onUp.bind(this);
		this.onDown = this.onDown.bind(this);
		this.onStop = this.onStop.bind(this);
	}

	onUp() {
		this.props.requestDeviceAction(this.props.item.id, this.props.commandUp);
		this.props.deviceSetState(this.props.item.id, this.props.commandUp);
	}
	onDown() {
		this.props.requestDeviceAction(this.props.item.id, this.props.commandDown);
		this.props.deviceSetState(this.props.item.id, this.props.commandDown);
	}
	onStop() {
		this.props.requestDeviceAction(this.props.item.id, this.props.commandStop);
		this.props.deviceSetState(this.props.item.id, this.props.commandStop);
	}

	render(): React$Element<any> {
		const { item, tileWidth } = this.props;
		const { name, supportedMethods } = item;
		const { UP, DOWN, STOP } = supportedMethods;
		const upButton = UP ? <UpButton isEnabled={true} onPress={this.onUp} methodRequested={item.methodRequested} /> : null;
		const downButton = DOWN ? <DownButton isEnabled={true} onPress={this.onDown} methodRequested={item.methodRequested} /> : null;
		const stopButton = STOP ? <StopButton isEnabled={true} onPress={this.onStop} methodRequested={item.methodRequested} /> : null;

		return (
			<DashboardShadowTile
				item={item}
				isEnabled={true}
				name={name}
				type={'device'}
				tileWidth={tileWidth}
				style={[this.props.style, { width: tileWidth, height: tileWidth }]}>
				<View style={styles.body}>
					{ upButton }
					{ downButton }
					{ stopButton }
				</View>
			</DashboardShadowTile>
		);
	}
}

NavigationalDashboardTile.defaultProps = {
	commandUp: 128,
	commandDown: 256,
	commandStop: 512,
};

const styles = StyleSheet.create({
	body: {
		flex: 30,
		flexDirection: 'row',
		backgroundColor: 'white',
		borderTopLeftRadius: 7,
		borderTopRightRadius: 7,
	},
	navigationButton: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	buttonEnabled: {
		color: '#1a355b',
	},
	buttonDisabled: {
		color: '#eeeeee',
	},
	dot: {
		position: 'absolute',
		top: 3,
		left: 3,
	},
});

function mapDispatchToProps(dispatch: Dispatch): Object {
	return {
		deviceSetState: (id: number, command: number, value?: number) => {
			dispatch(deviceSetState(id, command, value));
		},
		requestDeviceAction: (id: number, command: number) => {
			dispatch(requestDeviceAction(id, command));
		},
	};
}

module.exports = connect(null, mapDispatchToProps)(NavigationalDashboardTile);
