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
import { StyleSheet, TouchableOpacity } from 'react-native';
import Slider from 'react-native-slider';

import { turnOn, turnOff, learn } from 'Actions/Devices';
import { setDimmerValue, updateDimmerValue } from 'Actions/Dimmer';

const ToggleButton = ({ device, onTurnOn, onTurnOff }) => (
	<RoundedCornerShadowView style={styles.toggleContainer}>
		<TouchableOpacity
			style={[styles.toggleButton, {
				backgroundColor: device.isInState === 'TURNOFF' ? 'white' : '#eeeeee',
			}]}
			onPress={onTurnOff}>
			<Text style={{
				fontSize: 16,
				color: device.isInState === 'TURNOFF' ? 'red' : '#9e9e9e' }}>
				{'Off'}
			</Text>
		</TouchableOpacity>

		<TouchableOpacity
			style={[styles.toggleButton, {
				backgroundColor: device.isInState !== 'TURNOFF' ? 'white' : '#eeeeee',
			}]}
			onPress={onTurnOn}>
			<Text style={{
				fontSize: 16,
				color: device.isInState !== 'TURNOFF' ? '#2c7e38' : '#9e9e9e' }}>
				{'On'}
			</Text>
		</TouchableOpacity>
	</RoundedCornerShadowView>
);

const LearnButton = ({ device, onLearn }) => (
	<RoundedCornerShadowView style={styles.learnContainer}>
		<TouchableOpacity onPress={onLearn} style={styles.learnButton}>
			<Text style={styles.learnText}>
				{'Learn'}
			</Text>
		</TouchableOpacity>
	</RoundedCornerShadowView>
);

class DimmerDeviceDetailModal extends View {

	constructor(props) {
		super(props);

		const dimmerValue = this.getDimmerValue(this.props.device);

		this.state = {
			temporaryDimmerValue: dimmerValue,
		};

		this.currentDimmerValue = dimmerValue;
		this.onTurnOn = this.onTurnOn.bind(this);
		this.onTurnOff = this.onTurnOff.bind(this);
		this.onLearn = this.onLearn.bind(this);
		this.onValueChange = this.onValueChange.bind(this);
		this.onSlidingComplete = this.onSlidingComplete.bind(this);
	}

	getDimmerValue(device) {
		if (device !== null && device.value !== null) {
			if (device.isInState === 'TURNON') {
				return 100;
			} else if (device.isInState === 'TURNOFF') {
				return 0;
			} else if (device.isInState === 'DIM') {
				return Math.round(device.value * 100.0 / 255);
			}
		}
	}

	onTurnOn() {
		this.props.onTurnOn(this.props.device.id);
	}

	onTurnOff() {
		this.props.onTurnOff(this.props.device.id);
	}

	onLearn() {
		this.props.onLearn(this.props.device.id);
	}

	onValueChange(value) {
		this.setState({ temporaryDimmerValue: value });
	}

	onSlidingComplete(value) {
		this.props.onDim(this.props.device.id, 255 * value / 100.0);
	}

	componentWillReceiveProps(nextProps) {
		const device = nextProps.device;
		const dimmerValue = this.getDimmerValue(device);
		if (this.currentDimmerValue !== dimmerValue) {
			this.setState({ temporaryDimmerValue: dimmerValue });
			this.currentDimmerValue = dimmerValue;
		}
	}

	render() {
		const { device } = this.props;
		const { TURNON, TURNOFF, LEARN, DIM } = device.supportedMethods;

		let toggleButton = null;
		let learnButton = null;
		let slider = null;

		if (TURNON || TURNOFF) {
			toggleButton = <ToggleButton device={device} onTurnOn={this.onTurnOn} onTurnOff={this.onTurnOff} />;
		}

		if (LEARN) {
			learnButton = <LearnButton device={device} onLearn={this.onLearn} />;
		}

		if (DIM) {
			slider = <Slider minimumValue={0} maximumValue={100} step={1} value={this.currentDimmerValue}
				style={{ marginHorizontal: 8, marginVertical: 8 }}
				minimumTrackTintColor="rgba(0,150,136,255)"
				maximumTrackTintColor="rgba(219,219,219,255)"
				thumbTintColor="rgba(0,150,136,255)"
				trackStyle={styles.trackStyle}
				onValueChange={this.onValueChange}
				onSlidingComplete={this.onSlidingComplete}
				animateTransitions={true}/>;
		}

		return (
			<View style={styles.container}>
				<Text style={styles.textDimmingLevel}>
					{`Dimming level: ${this.state.temporaryDimmerValue}%`}
				</Text>
				{slider}
				{toggleButton}
				{learnButton}
			</View>
		);
	}

}

DimmerDeviceDetailModal.propTypes = {
	device: React.PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
	container: {
		flex: 0,
	},
	textDimmingLevel: {
		color: '#1a355b',
		fontSize: 14,
		marginTop: 12,
		marginLeft: 8,
	},
	toggleContainer: {
		flexDirection: 'row',
		height: 36,
		marginHorizontal: 8,
		marginVertical: 16,
	},
	toggleButton: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	learnContainer: {
		height: 36,
		marginHorizontal: 8,
		marginVertical: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	learnButton: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	learnText: {
		fontSize: 16,
		color: 'orange',
	},
	trackStyle: {
		marginTop: -4, // fix track thumb alignment bug : https://github.com/jeanregisser/react-native-slider/issues/54
	},
});

function mapStateToProps(store) {
	return { store };
}

function mapDispatchToProps(dispatch) {
	return {
		onTurnOn: (id) => dispatch(turnOn(id)),
		onTurnOff: (id) => dispatch(turnOff(id)),
		onLearn: (id) => dispatch(learn(id)),
		onDimmerSlide: (id, value) => dispatch(setDimmerValue(id, value)),
		onDim: (id, value) => dispatch(updateDimmerValue(id, value)),
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(DimmerDeviceDetailModal);
