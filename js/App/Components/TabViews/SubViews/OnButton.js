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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, FormattedMessage } from 'BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { deviceSetState, requestDeviceAction } from 'Actions_Devices';
import ButtonLoadingIndicator from './ButtonLoadingIndicator';

import i18n from '../../../Translations/common';

type Props = {
	deviceSetState: (id: number, command: number, value?: number) => void,
	requestDeviceAction: (id: number, command: number) => void,
};

class OnButton extends View {
	props: Props;

	constructor(props) {
		super(props);
		this.onPress = this.onPress.bind(this);
	}

	onPress() {
		this.props.requestDeviceAction(this.props.id, this.props.command);
		this.props.deviceSetState(this.props.id, this.props.command);
	}

	render() {
		let { isInState, enabled, fontSize, methodRequested } = this.props;

		return (
			<View style={[this.props.style, isInState !== 'TURNOFF' ? styles.enabled : styles.disabled]}>
				<TouchableOpacity disabled={!enabled} onPress={this.onPress} style={styles.button} >
					<FormattedMessage {...i18n.on} style = {[styles.buttonText, isInState !== 'TURNOFF' || methodRequested === 'TURNON' ? styles.textEnabled : styles.textDisabled, { fontSize: (fontSize ? fontSize : 12) } ]}/>
				</TouchableOpacity>
				{
					methodRequested === 'TURNON' ?
						<ButtonLoadingIndicator style={styles.dot} />
						:
						null
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
	command: PropTypes.number,
};

OnButton.defaultProps = {
	enabled: true,
	command: 1,
};

function mapDispatchToProps(dispatch) {
	return {
		deviceSetState: (id: number, command: number, value?: number) => dispatch(deviceSetState(id, command, value)),
		requestDeviceAction: (id: number, command: number) => dispatch(requestDeviceAction(id, command)),
	};
}

module.exports = connect(null, mapDispatchToProps)(OnButton);
