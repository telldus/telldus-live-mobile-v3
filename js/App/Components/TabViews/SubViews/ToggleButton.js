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

import React, { PropTypes } from 'react';
import { Text, View, RoundedCornerShadowView, Icon } from 'BaseComponents';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const OffButton = ({ isInState, enabled, onPress, request, fadeAnim }) => {
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

	if (request === 'off-request') {
		blinking();
	}

	return (
		<View style={[styles.turnOffButtonContainer, { backgroundColor: isInState === 'TURNOFF' ? '#fafafa' : '#eeeeee' }]}>
			<TouchableOpacity
				disabled={!enabled}
				onPress={onPress}
				style={styles.button} >
				<Text
					ellipsizeMode="middle"
					numberOfLines={1}
					style = {[styles.buttonText, { color: isInState === 'TURNOFF' ? 'red' : '#a2a2a2' }]}>
					{'Off'}
				</Text>
			</TouchableOpacity>
			{
				request === 'off-request' ?
				<AnimatedIcon name="circle" size={10} color="orange" style={[styles.leftCircle, { opacity: fadeAnim }]} />
				:
				null
			}
		</View>
	);
};

const OnButton = ({ isInState, enabled, onPress, request, fadeAnim }) => {
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

	if (request === 'on-request') {
		blinking();
	}

	return (
		<View style={[styles.turnOnButtonContainer, { backgroundColor: isInState === 'TURNON' ? '#fafafa' : '#eeeeee' }]}>
			<TouchableOpacity
				disabled={!enabled}
				onPress={onPress}
				style={styles.button} >
				<Text
					ellipsizeMode="middle"
					numberOfLines={1}
					style = {[styles.buttonText, { color: isInState === 'TURNON' ? 'green' : '#a2a2a2' }]}>
					{'On'}
				</Text>
			</TouchableOpacity>
			{
				request === 'on-request' ?
				<AnimatedIcon name="circle" size={10} color="orange" style={[styles.rightCircle, { opacity: fadeAnim }]} />
				:
				null
			}
		</View>
	);
};

class ToggleButton extends View {
	constructor(props) {
		super(props);
		this.state = {
			fadeAnimLeft: new Animated.Value(0),
			fadeAnimRight: new Animated.Value(0),
			request: 'none',
		};

		this.onTurnOn = this.onTurnOn.bind(this);
		this.onTurnOff = this.onTurnOff.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ request: 'none' });
	}

	onTurnOn() {
		this.setState({ request: 'on-request' });
		this.props.onTurnOn();
	}

	onTurnOff() {
		this.setState({ request: 'off-request' });
		this.props.onTurnOff();
	}

  render() {
    const { TURNON, TURNOFF } = this.props.device.supportedMethods;
    const isInState = this.props.device.isInState;

		const turnOnButton = <OnButton isInState={isInState} enabled={!!TURNON} onPress={this.onTurnOn} request={this.state.request} fadeAnim={this.state.fadeAnimRight}/>;
		const turnOffButton = <OffButton isInState={isInState} enabled={!!TURNOFF} onPress={this.onTurnOff} request={this.state.request} fadeAnim={this.state.fadeAnimLeft} />;

    return (
            <RoundedCornerShadowView style={styles.container} hasShadow={!!TURNON || !!TURNOFF}>
                { turnOffButton }
                { turnOnButton }
            </RoundedCornerShadowView>
    );
  }
}

const styles = StyleSheet.create({
	container: {
		flex: 7,
		height: 32,
		justifyContent: 'center',
		alignItems: 'center',
	},
	turnOffButtonContainer: {
		flex: 1,
		alignItems: 'stretch',
		borderTopLeftRadius: 7,
		borderBottomLeftRadius: 7,
	},
	turnOnButtonContainer: {
		flex: 1,
		alignItems: 'stretch',
		borderTopRightRadius: 7,
		borderBottomRightRadius: 7,
	},
	button: {
		flex: 1,
		justifyContent: 'center',
	},
	buttonText: {
		fontSize: 12,
		textAlign: 'center',
		textAlignVertical: 'center',
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

ToggleButton.propTypes = {
  onTurnOn: PropTypes.func,
  onTurnOff: PropTypes.func,
  device: PropTypes.object,
  enabled: PropTypes.bool,
};

ToggleButton.defaultProps = {
  enabled: true,
};
module.exports = ToggleButton;
