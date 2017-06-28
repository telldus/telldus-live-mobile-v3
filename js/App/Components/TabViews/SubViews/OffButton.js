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
import { turnOff, requestTurnOff } from 'Actions_Devices';

class OffButton extends View {
	constructor(props) {
		super(props);
		this.state = {
			blinkAnim: new Animated.Value(1),
		};
		this.onPress = this.onPress.bind(this);
		this.animationInterval = null;
	}

	onPress() {
		this.props.requestTurnOff(this.props.id);
		this.props.onTurnOff(this.props.id, this.props.isInState);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.methodRequested === 'TURNOFF') {
			let that = this;
			this.animationInterval = setInterval(() => {
				Animated.timing( that.state.blinkAnim, {
					toValue: that.state.blinkAnim._value === 0 ? 1 : 0,
					duration: 300,
				}).start();
			}, 400);
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
			<View style={[this.props.style, isInState === 'TURNOFF' ? styles.enabled : styles.disabled]}>
				<TouchableOpacity disabled={!enabled} onPress={this.onPress} style={styles.button} >
					<Text ellipsizeMode="middle" numberOfLines={1}
						style = {[styles.buttonText, isInState === 'TURNOFF' || methodRequested === 'TURNOFF' ? styles.textEnabled : styles.textDisabled, { fontSize: (fontSize ? fontSize : 12) } ]}>
						{'Off'}
					</Text>
				</TouchableOpacity>
				{
					methodRequested === 'TURNOFF' ?
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
		color: 'red',
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

OffButton.propTypes = {
	id: PropTypes.number,
	isInState: PropTypes.string,
	enabled: PropTypes.bool,
	fontSize: PropTypes.number,
	methodRequested: PropTypes.string,
};

OffButton.defaultProps = {
	enabled: true,
};

function mapDispatchToProps(dispatch) {
	return {
		onTurnOff: (id, isInState) => dispatch(turnOff(id, isInState)),
		requestTurnOff: id => dispatch(requestTurnOff(id)),
		dispatch,
	};
}

module.exports = connect(null, mapDispatchToProps)(OffButton);
