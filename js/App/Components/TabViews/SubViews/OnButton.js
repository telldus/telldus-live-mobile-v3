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
import { TouchableOpacity, StyleSheet } from 'react-native';
import Toast from 'react-native-root-toast';
import ButtonLoadingIndicator from './ButtonLoadingIndicator';
import { turnOn, requestTurnOn } from 'Actions_Devices';

class OnButton extends View {
	constructor(props) {
		super(props);
		this.onPress = this.onPress.bind(this);
		this.showToast = this.showToast.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if ((nextProps.isErrorMessage) && (nextProps.methodRequested === 'TURNON')) {
			this.showToast(nextProps.isErrorMessage);
		}
	}

	showToast(message) {
		// Add a Toast on screen.
		Toast.show(message, {
			duration: Toast.durations.SHORT,
			position: 60,
			shadow: false,
			animation: true,
			hideOnPress: true,
			backgroundColor: '#fff',
			textColor: '#1a355b',
			delay: 0,
			onShow: () => {
				// calls on toast\`s appear animation start
			},
			onShown: () => {
				// calls on toast\`s appear animation end.
			},
			onHide: () => {
				// calls on toast\`s hide animation start.
				this.props.dispatch({
					type: 'RESET_DEVICE_STATE',
					deviceId: this.props.id,
				});
			},
			onHidden: () => {
				// calls on toast\`s hide animation end.
			},
		});
	}

	onPress() {
		this.props.onTurnOn(this.props.id);
		this.props.requestTurnOn(this.props.id);
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
					<ButtonLoadingIndicator style={styles.dot} />
					: null
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
		right: 3,
	},
});

OnButton.propTypes = {
	id: PropTypes.number,
	isInState: PropTypes.string,
	enabled: PropTypes.bool,
	fontSize: PropTypes.number,
	methodRequested: PropTypes.string,
	isErrorMessage: PropTypes.any,
};

OnButton.defaultProps = {
	enabled: true,
};

function mapDispatchToProps(dispatch) {
	return {
		onTurnOn: id => dispatch(turnOn(id)),
		requestTurnOn: id => dispatch(requestTurnOn(id)),
		dispatch,
	};
}

module.exports = connect(null, mapDispatchToProps)(OnButton);
