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
import { connect } from 'react-redux';
import { View, IconTelldus } from '../../../../BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { deviceSetState } from '../../../Actions/Devices';
import ButtonLoadingIndicator from './ButtonLoadingIndicator';

import {
	withTheme,
} from '../../HOC/withTheme';

import i18n from '../../../Translations/common';

import Theme from '../../../Theme';

type Props = {
	deviceSetState: (id: number, command: number, value?: number) => void,
	intl: Object,
	name: string,
	isGatewayActive: boolean,
	style: Object | Array<any>,
	iconStyle: Object | Array<any>,
	methodRequested: string,
	isInState: string,
	enabled: boolean,
	command: number,
	id: number,
	local: boolean,
	isOpen: boolean,
	closeSwipeRow: () => void,
	actionIcon?: string,
	onPressDeviceAction?: () => void,
	onPressOverride?: (Object) => void,
	disableActionIndicator?: boolean,
	colors: Object,
	colorScheme: string,
	themeInApp: string,
};

class OnButton extends View {
	props: Props;

	onPress: () => void;

	constructor(props: Props) {
		super(props);
		this.onPress = this.onPress.bind(this);

		this.labelOnButton = `${props.intl.formatMessage(i18n.on)} ${props.intl.formatMessage(i18n.button)}`;
	}

	onPress() {
		const {
			command,
			id,
			isOpen,
			closeSwipeRow,
			onPressDeviceAction,
			onPressOverride,
		} = this.props;

		if (onPressOverride) {
			onPressOverride({
				method: command,
			});
			return;
		}
		if (isOpen && closeSwipeRow) {
			closeSwipeRow();
			return;
		}
		if (onPressDeviceAction) {
			onPressDeviceAction();
		}
		this.props.deviceSetState(id, command);
	}

	render(): Object {
		let {
			isInState,
			enabled,
			methodRequested,
			name,
			isGatewayActive,
			iconStyle,
			local,
			actionIcon,
			disableActionIndicator,
			colors,
		} = this.props;

		const styles = getStyles({colors});

		let accessibilityLabel = `${this.labelOnButton}, ${name}`;
		let buttonStyle = !isGatewayActive ?
			(isInState !== 'TURNOFF' ? styles.offline : styles.disabled) : (isInState !== 'TURNOFF' ? styles.enabled : styles.disabled);
		let iconColor = !isGatewayActive ?
			(isInState !== 'TURNOFF' ? '#fff' : '#a2a2a2') : (isInState !== 'TURNOFF' ? '#fff' : colors.colorOnActiveBg);
		let dotColor = isInState === methodRequested ? '#fff' : local ? colors.colorOffActiveBg : colors.colorOnActiveBg;

		const iconName = actionIcon ? actionIcon : 'on';

		return (
			<TouchableOpacity
				disabled={!enabled}
				onPress={this.onPress}
				style={[this.props.style, buttonStyle]}
				accessibilityLabel={accessibilityLabel}>
				<IconTelldus icon={iconName} style={StyleSheet.flatten([Theme.Styles.deviceActionIcon, iconStyle])} color={iconColor}/>
				{
					!disableActionIndicator && methodRequested === 'TURNON' ?
						<ButtonLoadingIndicator style={styles.dot} color={dotColor}/>
						:
						null
				}
			</TouchableOpacity>
		);
	}
}

const getStyles = ({colors}: Object): Object => {

	const {
		colorOnActiveBg,
	} = colors;

	return {
		enabled: {
			backgroundColor: colorOnActiveBg,
		},
		disabled: {
			backgroundColor: '#eeeeee',
		},
		offline: {
			backgroundColor: '#a2a2a2',
		},
		button: {
			alignItems: 'stretch',
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
		},
	};
};
OnButton.defaultProps = {
	enabled: true,
	command: 1,
	disableActionIndicator: false,
};

function mapDispatchToProps(dispatch: Function): Object {
	return {
		deviceSetState: (id: number, command: number, value?: number) => {
			dispatch(deviceSetState(id, command, value));
		},
	};
}

module.exports = connect(null, mapDispatchToProps)(withTheme(OnButton));
