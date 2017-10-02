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

// @flow

'use strict';

import React, { PropTypes } from 'react';
import { View, FormattedMessage } from 'BaseComponents';
import { StyleSheet, Animated } from 'react-native';
import ButtonLoadingIndicator from './ButtonLoadingIndicator';

import i18n from '../../../Translations/common';
let AnimatedFormattedMessage = Animated.createAnimatedComponent(FormattedMessage);

type Props = {
	isInState: string,
	enabled: boolean,
	fontSize: number,
	style: Object,
	methodRequested: string,
};

class DimmerOffButton extends View {
	props: Props;

	fadeIn: () => void;
	fadeOut: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			fadeAnim: new Animated.Value(1),
		};
		this.fadeIn = this.fadeIn.bind(this);
		this.fadeOut = this.fadeOut.bind(this);
	}

	render(): React$Element<any> {
		let { isInState, enabled, fontSize, style, methodRequested } = this.props;

		return (
			<View style={[style, isInState === 'TURNOFF' && enabled ? styles.enabled : styles.disabled]}>
				<AnimatedFormattedMessage
					{...i18n.off}
					style = {[(isInState === 'TURNOFF' || methodRequested === 'TURNOFF') && enabled ? styles.textEnabled : styles.textDisabled, { opacity: this.state.fadeAnim, fontSize: fontSize ? fontSize : 12 }]}
				/>
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
		backgroundColor: '#fafafa',
	},
	disabled: {
		backgroundColor: '#eeeeee',
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
