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
import { connect } from 'react-redux';
import { Text, View } from 'BaseComponents';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { turnOn, requestTurnOn } from 'Actions_Devices';

class OnButton extends View {
	constructor(props) {
		super(props);
		this.state = {
			blinkAnim: new Animated.Value(1),
		};
		this.onPress = this.onPress.bind(this);
		this.animationInterval = null;
	}

	onPress() {
		this.props.requestTurnOn(this.props.id);
		this.props.onTurnOn(this.props.id, this.props.isInState);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.methodRequested === 'TURNON') {
			let that = this;
			this.animationInterval = setInterval(() => {
				Animated.timing( that.state.blinkAnim, {
					toValue: that.state.blinkAnim._value === 0 ? 1 : 0,
					duration: 300,
				}).start();
			}, 350);
		} else {
			clearInterval(this.animationInterval);
		}
	}

	componentWillUnmount() {
		clearInterval(this.animationInterval);
	}

	render() {
		let { isInState, enabled, fontSize, methodRequested } = this.props;

		return (
			<View style={[this.props.style, isInState !== 'TURNOFF' ? styles.enabled : styles.disabled]}>
				<TouchableOpacity disabled={!enabled} onPress={this.onPress} style={styles.button} >
					<Text ellipsizeMode="middle" numberOfLines={1}
						style = {[styles.buttonText, isInState !== 'TURNOFF' || methodRequested === 'TURNON' ? styles.textEnabled : styles.textDisabled, { fontSize: (fontSize ? fontSize : 12) } ]}>
						{'On'}
					</Text>
				</TouchableOpacity>
				{
					methodRequested === 'TURNON' ?
						<Animated.View style={[styles.dot, {opacity: this.state.blinkAnim}]} />
						:
						<View style={{height: 0, width: 0}}/>
				}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	enabled: {
		backgroundColor: '#fafafa',
	},
	disabled: {
		backgroundColor: '#eeeeee',
	},
	textEnabled: {
		color: 'green',
	},
	textDisabled: {
		color: '#a2a2a2',
	},
	button: {
		flex: 1,
		justifyContent: 'center',
	},
	buttonText: {
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	dot: {
		position: 'absolute',
		top: 3,
		left: 3,
		height: 8,
		width: 8,
		borderRadius: 8,
		backgroundColor: 'orange',
	},
});

OnButton.propTypes = {
	id: PropTypes.number,
	isInState: PropTypes.string,
	enabled: PropTypes.bool,
	fontSize: PropTypes.number,
	methodRequested: PropTypes.string,
};

OnButton.defaultProps = {
	enabled: true,
};

function mapDispatchToProps(dispatch) {
	return {
		onTurnOn: (id, isInState) => dispatch(turnOn(id, isInState)),
		requestTurnOn: id => dispatch(requestTurnOn(id)),
		dispatch,
	};
}

module.exports = connect(null, mapDispatchToProps)(OnButton);
