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

'use strict';

import React from 'react';
import { connect } from 'react-redux';

import { RoundedCornerShadowView, Text, View } from 'BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';
import DeviceDetailModal from './DeviceDetailModal';

import { turnOn, turnOff, learn} from 'Actions/Devices';

const ToggleButton = ({device, onTurnOn, onTurnOff}) => (
    <RoundedCornerShadowView style={styles.toggleContainer}>
        <TouchableOpacity
            style={[styles.toggleButton, {
	backgroundColor: device.isInState === 'TURNOFF' ? 'white' : '#eeeeee',
}]}
            onPress={onTurnOff}>
            <Text style={{
	fontSize: 16,
	color: device.isInState === 'TURNOFF' ? 'red' : '#9e9e9e'}}>
                {'Off'}
            </Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={[styles.toggleButton, {
	backgroundColor: device.isInState === 'TURNON' ? 'white' : '#eeeeee',
}]}
            onPress={onTurnOn}>
            <Text style={{
	fontSize: 16,
	color: device.isInState === 'TURNON' ? '#2c7e38' : '#9e9e9e'}}>
                {'On'}
            </Text>
        </TouchableOpacity>
    </RoundedCornerShadowView>
);

const LearnButton = ({device, onLearn}) => (
    <RoundedCornerShadowView style={{
	height: 36,
	marginHorizontal: 8,
	marginVertical: 8,
	justifyContent: 'center',
	alignItems: 'center'}}>
        <TouchableOpacity onPress={onLearn}>
            <Text style={{fontSize: 16, color: 'orange'}}>
                {'Learn'}
            </Text>
        </TouchableOpacity>
    </RoundedCornerShadowView>
);

class ToggleDeviceDetailModal extends View {

	constructor(props) {
		super(props);

		this.onTurnOn = this.onTurnOn.bind(this);
		this.onTurnOff = this.onTurnOff.bind(this);
		this.onLearn = this.onLearn.bind(this);
	}

	onTurnOn() {
		this.props.onTurnOn(this.props.deviceId);
	}

	onTurnOff() {
		this.props.onTurnOff(this.props.deviceId);
	}

	onLearn() {
		this.props.onLearn(this.props.deviceId);
	}

	render() {
		let hasToggleButton = false;
		let hasLearnButton = false;
		let toggleButton = null;
		let learnButton = null;

		const device = this.props.store.devices.find(item => item.id === this.props.deviceId);
		if (device) {
			const { TURNON, TURNOFF, LEARN } = device.supportedMethods;
			hasToggleButton = TURNON || TURNOFF;
			hasLearnButton = LEARN;
		}

		if (hasToggleButton) {
			toggleButton = <ToggleButton device={device} onTurnOn={this.onTurnOn} onTurnOff={this.onTurnOff} />;
		}

		if (hasLearnButton) {
			learnButton = <LearnButton device={device} onLearn={this.onLearn} />;
		}

		return (
            <DeviceDetailModal
                isVisible={this.props.isVisible}
                onCloseSelected={this.props.onCloseSelected}
                deviceId={this.props.deviceId}>
                {toggleButton}
                {learnButton}
            </DeviceDetailModal>
		);
	}

}

ToggleDeviceDetailModal.propTypes = {
	onCloseSelected: React.PropTypes.func.isRequired,
	deviceId: React.PropTypes.number.isRequired
};

const styles = StyleSheet.create({
	toggleContainer: {
		flexDirection: 'row',
		height: 36,
		marginHorizontal: 8,
		marginVertical: 16
	},
	toggleButton: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
});

function select(store) {
	return { store };
}

function actions(dispatch) {
	return {
		onTurnOn: (id) => dispatch(turnOn(id)),
		onTurnOff: (id) => dispatch(turnOff(id)),
		onLearn: (id) => dispatch(learn(id))
	};
}

module.exports = connect(select, actions)(ToggleDeviceDetailModal);
