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

import React from 'react';
import { View, IconTelldus } from '../../../../BaseComponents';
import { StyleSheet, Animated } from 'react-native';
import ButtonLoadingIndicator from './ButtonLoadingIndicator';
const isEqual = require('react-fast-compare');

import {
	withTheme,
} from '../../HOC/withTheme';

import shouldUpdate from '../../../Lib/shouldUpdate';

import i18n from '../../../Translations/common';
import Theme from '../../../Theme';

type Props = {
	isInState: string,
	methodRequested: string,
	name: string,
	isGatewayActive: boolean,
	enabled: boolean,
	local: boolean,
	offButtonColor?: string,
	iconOffColor?: string,
	colors: Object,
	colorScheme: string,
	themeInApp: string,

	style: Array<any> | Object,
	onPress: () => void,
	intl: Object,
	iconStyle: Object | Array<any>,
	disableActionIndicator?: boolean,
};

type State = {
	fadeAnim: Object,
};

class DimmerOffButton extends View {
	props: Props;
	state: State;

	onPress: () => void;
	fadeIn: () => void;
	fadeOut: () => void;

	constructor(props: Props) {
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

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const isStateEqual = isEqual(this.state, nextState);
		if (!isStateEqual) {
			return true;
		}
		const propsChange = shouldUpdate(this.props, nextProps, [
			'isInState',
			'methodRequested',
			'name',
			'isGatewayActive',
			'enabled',
			'local',
			'offButtonColor',
			'iconOffColor',
			'themeInApp',
			'colorScheme',
			'selectedThemeSet',
		]);
		if (propsChange) {
			return true;
		}

		return false;
	}

	render(): Object {
		let {
			isInState,
			style,
			methodRequested,
			name,
			isGatewayActive,
			iconStyle,
			local,
			offButtonColor,
			iconOffColor,
			disableActionIndicator,
			colors,
		} = this.props;

		const styles = getStyles({colors});

		let accessibilityLabel = `${this.labelOffButton}, ${name}`;
		let buttonStyle = !isGatewayActive ?
			(isInState === 'TURNOFF' ? styles.offline : styles.disabled) :
			offButtonColor ? { backgroundColor: offButtonColor } :
				(isInState === 'TURNOFF' ? styles.enabled : styles.disabled);
		let iconColor = !isGatewayActive ?
			(isInState === 'TURNOFF' ? colors.colorOffActiveIcon : '#a2a2a2') :
			iconOffColor ? iconOffColor : (isInState === 'TURNOFF' ? colors.colorOffActiveIcon : colors.colorOffInActiveIcon);
		let dotColor = isInState === methodRequested ? '#fff' : local ? colors.colorOffActiveBg : colors.colorOnActiveBg;

		return (
			<View
				style={[styles.styleDef, style, buttonStyle]}
				accessible={true}
				accessibilityLabel={accessibilityLabel}>
				<IconTelldus icon="off" style={StyleSheet.flatten([Theme.Styles.deviceActionIcon, iconStyle])} color={iconColor}/>
				{
					!disableActionIndicator && methodRequested === 'TURNOFF' ?
						<ButtonLoadingIndicator style={styles.dot} color={dotColor}/>
						: null
				}
			</View>
		);
	}

	fadeIn() {
		Animated.timing(this.state.fadeAnim, { toValue: 1, duration: 100, useNativeDriver: true }).start();
	}

	fadeOut() {
		Animated.timing(this.state.fadeAnim, { toValue: 0.5, duration: 100, useNativeDriver: true }).start();
	}
}

const getStyles = ({
	colors,
}: Object): Object => {

	const {
		colorOffActiveBg,
		colorOffInActiveBg,
		buttonSeparatorColor,
	} = colors;

	return {
		styleDef: {
			borderLeftWidth: 1,
			borderLeftColor: buttonSeparatorColor,
		},
		enabled: {
			backgroundColor: colorOffActiveBg,
		},
		disabled: {
			backgroundColor: colorOffInActiveBg,
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
	};
};

DimmerOffButton.defaultProps = {
	enabled: true,
	disableActionIndicator: false,
};

module.exports = (withTheme(DimmerOffButton): Object);
