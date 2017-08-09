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

import { Icon, View, RoundedCornerShadowView } from 'BaseComponents';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { deviceSetState } from 'Actions_Devices';

const UpButton = ({ supportedMethod, onPress }) => (
	<TouchableOpacity
		style={styles.navigationButton}
		onPress={onPress}>
		<Icon name="caret-up" size={30}
		      style={{
			      color: supportedMethod ? '#1a355b' : '#eeeeee',
		      }}
		/>
	</TouchableOpacity>
);

const DownButton = ({ supportedMethod, onPress }) => (
	<TouchableOpacity
		style={styles.navigationButton}
		onPress={onPress}>
		<Icon name="caret-down" size={30}
			style={supportedMethod ? styles.enabled : styles.disabled}
		/>
	</TouchableOpacity>
);

const StopButton = ({ supportedMethod, onPress }) => (
	<TouchableOpacity
		style={styles.navigationButton}
		onPress={onPress}>
		<Icon name="stop" size={20}
			style={supportedMethod ? styles.enabled : styles.disabled}
		/>
	</TouchableOpacity>
);

type Props = {
	device: Object,
	onUp: number => void,
	onDown: number => void,
	onStop: number => void,
	style: Object,
	commandUp: number,
	commandDown: number,
	commandStop: number,
};

class NavigationalButton extends View {
	props: Props;

	render() {
		const noop = function () {
		};
		const { UP, DOWN, STOP } = this.props.device.supportedMethods;
		const id = this.props.device.id;

		return (
			<RoundedCornerShadowView style={this.props.style}>
				<UpButton supportedMethod={UP} onPress={UP ? this.props.onUp(id, this.props.commandUp) : noop} />
				<DownButton supportedMethod={DOWN} onPress={DOWN ? this.props.onDown(id, this.props.commandDown) : noop} />
				<StopButton supportedMethod={STOP} onPress={STOP ? this.props.onStop(id, this.props.commandStop) : noop} />
			</RoundedCornerShadowView>
		);
	}
}

NavigationalButton.defaultProps = {
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
	disabled: {
		color: '#eeeeee',
	},
});

function mapDispatchToProps(dispatch) {
	return {
		onDown: (id, command) =>() => dispatch(deviceSetState(id, command)),
		onUp: (id, command) => () => dispatch(deviceSetState(id, command)),
		onStop: (id, command) => () => dispatch(deviceSetState(id, command)),
	};
}

module.exports = connect(null, mapDispatchToProps)(NavigationalButton);
