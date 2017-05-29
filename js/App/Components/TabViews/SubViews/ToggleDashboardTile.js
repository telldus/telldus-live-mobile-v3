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
import { Text, View, Icon } from 'BaseComponents';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import DashboardShadowTile from './DashboardShadowTile';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const OffButton = ({ isInState, tileWidth, enabled, onPress, request, fadeAnim }) => {
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
		<View style={[styles.turnOffButtonContainer, isInState === 'TURNOFF' ? styles.buttonBackgroundEnabled : styles.buttonBackgroundDisabled ]}>
			<TouchableOpacity
				disabled={!enabled}
				onPress={onPress}
				style={styles.button} >
				<Text
					ellipsizeMode="middle"
					numberOfLines={1}
					style = {[styles.buttonText, isInState === 'TURNOFF' ? styles.buttonOffEnabled : styles.buttonOffDisabled,
					{ fontSize: Math.floor(tileWidth / 8) }]}>
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

const OnButton = ({ isInState, tileWidth, enabled, onPress, request, fadeAnim }) => {
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
		<View style={[styles.turnOnButtonContainer, isInState === 'TURNON' ? styles.buttonBackgroundEnabled : styles.buttonBackgroundDisabled ]}>
			<TouchableOpacity
				disabled={!enabled}
				onPress={onPress}
				style={styles.button} >
				<Text
					ellipsizeMode="middle"
					numberOfLines={1}
					style = {[styles.buttonText, isInState === 'TURNON' ? styles.buttonOnEnabled : styles.buttonOnDisabled,
						{ fontSize: Math.floor(tileWidth / 8) }]}>
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

class ToggleDashboardTile extends View {
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
    const { item, tileWidth } = this.props;
    const { name, isInState, supportedMethods } = item;
    const { TURNON, TURNOFF } = supportedMethods;

		const turnOnButton = <OnButton isInState={isInState} onPress={this.onTurnOn} tileWidth={tileWidth} enabled={!!TURNON} request={this.state.request} fadeAnim={this.state.fadeAnimRight}/>;
		const turnOffButton = <OffButton isInState={isInState} onPress={this.onTurnOff} tileWidth={tileWidth} enabled={!!TURNOFF} request={this.state.request} fadeAnim={this.state.fadeAnimLeft} />;

		let style = { ...this.props.style };
		style.width = tileWidth;
		style.height = tileWidth;

    return (
			<DashboardShadowTile
				item={item}
				isEnabled={isInState === 'TURNON'}
				name={name}
				tileWidth={tileWidth}
				hasShadow={!!TURNON || !!TURNOFF}
				style={style}>
				<View style={{ flexDirection: 'row', flex: 30 }}>
					{ turnOffButton }
					{ turnOnButton }
				</View>
			</DashboardShadowTile>
    );
  }
}

const styles = StyleSheet.create({
	turnOffButtonContainer: {
		flex: 1,
		alignItems: 'stretch',
		borderTopLeftRadius: 7,
	},
	turnOnButtonContainer: {
		flex: 1,
		alignItems: 'stretch',
		borderTopRightRadius: 7,
	},
	button: {
		flex: 1,
		justifyContent: 'center',
	},
	buttonText: {
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	buttonBackgroundEnabled: {
		backgroundColor: 'white',
	},
	buttonBackgroundDisabled: {
		backgroundColor: '#eeeeee',
	},
	buttonOnEnabled: {
		color: 'green',
	},
	buttonOnDisabled: {
		color: '#a0a0a0',
	},
	buttonOffEnabled: {
		color: 'red',
	},
	buttonOffDisabled: {
		color: '#a0a0a0',
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

ToggleDashboardTile.propTypes = {
  onTurnOn: PropTypes.func,
  onTurnOff: PropTypes.func,
  item: PropTypes.object,
  enabled: PropTypes.bool,
};

module.exports = ToggleDashboardTile;
