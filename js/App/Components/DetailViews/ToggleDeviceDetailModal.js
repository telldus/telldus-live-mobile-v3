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

import { RoundedCornerShadowView, Text, View, Icon } from 'BaseComponents';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';

import { turnOn, turnOff, learn } from 'Actions/Devices';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const ToggleButton = ({ device, onTurnOn, onTurnOff, request, fadeAnim }) => {
	let blinking = function () {
		Animated.sequence([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 500,
			}),
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 500,
			}),
		]).start(event => {
			if (event.finished) {
				blinking();
			}
		});
	};

	if (request === 'on-request' || request === 'off-request') {
		blinking();
	}

	return (
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
					backgroundColor: device.isInState === 'TURNON' ? 'white' : '#eeeeee',
				}]}
				onPress={onTurnOn}>
				<Text style={{
					fontSize: 16,
					color: device.isInState === 'TURNON' ? '#2c7e38' : '#9e9e9e' }}>
					{'On'}
				</Text>
			</TouchableOpacity>
			{
				request === 'off-request' ?
				<AnimatedIcon name="circle" size={10} color="orange" style={[styles.leftCircle, { opacity: fadeAnim }]} />
				:
				request === 'on-request' ?
				<AnimatedIcon name="circle" size={10} color="orange" style={[styles.rightCircle, { opacity: fadeAnim }]} />
				:
				null
			}
	</RoundedCornerShadowView>
	);
};

const LearnButton = ({ device, onLearn }) => (
	<RoundedCornerShadowView style={styles.learnContainer}>
		<TouchableOpacity onPress={onLearn} style={styles.learnButton}>
			<Text style={styles.learnText}>
				{'Learn'}
			</Text>
		</TouchableOpacity>
	</RoundedCornerShadowView>
);

class ToggleDeviceDetailModal extends View {

	constructor(props) {
		super(props);
		this.state = {
			fadeAnim: new Animated.Value(0),
			request: 'none',
		};

    this.onTurnOn = this.onTurnOn.bind(this);
    this.onTurnOff = this.onTurnOff.bind(this);
    this.onLearn = this.onLearn.bind(this);
  }

	componentWillReceiveProps(nextProps) {
		this.setState({ request: 'none' });
	}

	onTurnOn() {
		this.setState({ request: 'on-request' });
		this.props.onTurnOn(this.props.device.id);
	}

	onTurnOff() {
		this.setState({ request: 'off-request' });
		this.props.onTurnOff(this.props.device.id);
	}

  onLearn() {
    this.props.onLearn(this.props.device.id);
  }

  render() {
    const { device } = this.props;
    const { TURNON, TURNOFF, LEARN } = device.supportedMethods;

    let toggleButton = null;
    let learnButton = null;

		if (TURNON || TURNOFF) {
			toggleButton = <ToggleButton device={device} onTurnOn={this.onTurnOn} onTurnOff={this.onTurnOff} request={this.state.request} fadeAnim={this.state.fadeAnim} />;
		}

    if (LEARN) {
      learnButton = <LearnButton device={device} onLearn={this.onLearn} />;
    }

    return (
			<View style={styles.container}>
				{toggleButton}
				{learnButton}
			</View>
    );
  }

}

ToggleDeviceDetailModal.propTypes = {
  device: React.PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
	container: {
		flex: 0,
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
	leftCircle: {
		position: 'absolute',
		top: 3,
		left: 3,
	},
	rightCircle: {
		position: 'absolute',
		top: 3,
		right: 3,
	},
});

function mapDispatchToProps(dispatch) {
  return {
    onTurnOn: (id) => dispatch(turnOn(id)),
    onTurnOff: (id) => dispatch(turnOff(id)),
    onLearn: (id) => dispatch(learn(id)),
  };
}

module.exports = connect(null, mapDispatchToProps)(ToggleDeviceDetailModal);
