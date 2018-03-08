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
import { View, IconTelldus } from '../../../../BaseComponents';
import { StyleSheet, Animated, TouchableOpacity } from 'react-native';
import ButtonLoadingIndicator from './ButtonLoadingIndicator';

import i18n from '../../../Translations/common';
import Theme from '../../../Theme';

class DimmerOffButton extends View {
	constructor(props) {
		super(props);
		this.state = {
			fadeAnim: new Animated.Value(1),
		};
		this.fadeIn = this.fadeIn.bind(this);
		this.fadeOut = this.fadeOut.bind(this);

		this.onPress = this.onPress.bind(this);

		this.labelOffButton = `${props.intl.formatMessage(i18n.off)} ${props.intl.formatMessage(i18n.button)}`;
	}

	onPress() {
		let { onPress } = this.props;
		if (onPress) {
			onPress();
		}
	}

	render() {
		let { isInState, style, methodRequested, name, isGatewayActive, enabled } = this.props;
		let accessibilityLabel = `${this.labelOffButton}, ${name}`;
		let buttonStyle = !isGatewayActive ?
			(isInState === 'TURNOFF' ? styles.offline : styles.disabled) : (isInState === 'TURNOFF' ? styles.enabled : styles.disabled);
		let iconColor = !isGatewayActive ?
			(isInState === 'TURNOFF' ? '#fff' : '#a2a2a2') : (isInState === 'TURNOFF' ? '#fff' : Theme.Core.brandPrimary);

		return (
			<View style={[style, buttonStyle]}>
				<TouchableOpacity
					disabled={!enabled}
					onPress={this.onPress}
					style={styles.button}
					accessibilityLabel={accessibilityLabel}>
					<IconTelldus icon="off" style={Theme.Styles.deviceActionIcon} color={iconColor}/>
				</TouchableOpacity>
				{
					methodRequested === 'TURNOFF' ?
						<ButtonLoadingIndicator style={styles.dot} />
						: null
				}
			</View>
		);
	}

	fadeIn() {
		Animated.timing(this.state.fadeAnim, { toValue: 1, duration: 100 }).start();
	}

	fadeOut() {
		Animated.timing(this.state.fadeAnim, { toValue: 0.5, duration: 100 }).start();
	}
}

const styles = StyleSheet.create({
	enabled: {
		backgroundColor: Theme.Core.brandPrimary,
	},
	disabled: {
		backgroundColor: '#eeeeee',
	},
	offline: {
		backgroundColor: '#a2a2a2',
	},
	textEnabled: {
		textAlign: 'center',
		textAlignVertical: 'center',
		color: 'red',
	},
	textDisabled: {
		textAlign: 'center',
		textAlignVertical: 'center',
		color: '#a0a0a0',
	},
	dot: {
		position: 'absolute',
		top: 3,
		left: 3,
	},
	button: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

DimmerOffButton.propTypes = {
	isInState: PropTypes.string,
	enabled: PropTypes.bool,
	fontSize: PropTypes.number,
	methodRequested: PropTypes.string,
};

DimmerOffButton.defaultProps = {
	enabled: true,
};

module.exports = DimmerOffButton;
