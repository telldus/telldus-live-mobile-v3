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

import { IconTelldus, View } from '../../../../../BaseComponents';
import { TouchableOpacity } from 'react-native';

import ButtonLoadingIndicator from '../ButtonLoadingIndicator';
import i18n from '../../../../Translations/common';
import { deviceSetState } from '../../../../Actions/Devices';

import {
	withTheme,
} from '../../../HOC/withTheme';

type Props = {
	device: Object,
	commandStop: number,
	deviceSetState: (id: number, command: number, value?: number) => void,
	intl: Object,
	isGatewayActive: boolean,
	isInState: boolean,
	name: string,
	methodRequested: string,
	supportedMethod: string,
	id: number,
	iconSize: number,
	style: Object | Array<any>,
	local: boolean,
	isOpen: boolean,
	closeSwipeRow: () => void,
	onPressDeviceAction?: () => void,
	onPressOverride?: (Object) => void,
	disableActionIndicator?: boolean,
	colors: Object,
	colorScheme: string,
	themeInApp: string,
};

class StopButton extends View {
	props: Props;

	onStop: () => void;

	constructor(props: Props) {
		super(props);

		this.onStop = this.onStop.bind(this);

		this.labelStopButton = `${props.intl.formatMessage(i18n.stop)} ${props.intl.formatMessage(i18n.button)}`;
	}

	onStop() {
		const {
			commandStop,
			id,
			isOpen,
			closeSwipeRow,
			onPressDeviceAction,
			onPressOverride,
		} = this.props;

		if (onPressOverride) {
			onPressOverride({
				method: commandStop,
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
		this.props.deviceSetState(id, commandStop);
	}

	render(): Object {
		const noop = function () {
		};

		let {
			isGatewayActive,
			supportedMethod,
			isInState,
			name,
			methodRequested,
			iconSize,
			style,
			local,
			disableActionIndicator,
			colors,
		} = this.props;

		const styles = getStyles({colors});

		let stopButtonStyle = !isGatewayActive ?
			(isInState === 'STOP' ? styles.offlineBackground : styles.disabledBackground) : (isInState === 'STOP' ? styles.enabledBackgroundStop : styles.disabledBackground);
		let stopIconColor = !isGatewayActive ?
			(isInState === 'STOP' ? colors.colorOffActiveIcon : '#a2a2a2') : (isInState === 'STOP' ? colors.colorOffActiveIcon : colors.colorOffInActiveIcon);
		let dotColor = isInState === methodRequested ? '#fff' : local ? colors.colorOffActiveBg : colors.colorOnActiveBg;

		return (
			<TouchableOpacity
				style={[styles.styleDef, stopButtonStyle, style]}
				onPress={supportedMethod ? this.onStop : noop}
				accessibilityLabel={`${this.labelStopButton}, ${name}`}>
				<IconTelldus icon="stop" size={iconSize}
					style={{
						color: supportedMethod ? stopIconColor : colors.colorOffInActiveBg,
					}}
				/>
				{
					!disableActionIndicator && methodRequested === 'STOP' ?
						<ButtonLoadingIndicator style={styles.dot} color={dotColor}/>
						:
						null
				}
			</TouchableOpacity>
		);
	}
}

StopButton.defaultProps = {
	commandUp: 128,
	commandDown: 256,
	commandStop: 512,
	disableActionIndicator: false,
};

const getStyles = ({colors}: Object): Object => {

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
			color: '#1a355b',
		},
		disabledBackground: {
			backgroundColor: colorOffInActiveBg,
		},
		enabledBackgroundStop: {
			backgroundColor: colorOffActiveBg,
		},
		offlineBackground: {
			backgroundColor: '#a2a2a2',
		},
		disabled: {
			color: '#eeeeee',
		},
		dot: {
			position: 'absolute',
			top: 3,
			left: 3,
		},
	};
};

function mapDispatchToProps(dispatch: Function): Object {
	return {
		deviceSetState: (id: number, command: number, value?: number): any => dispatch(deviceSetState(id, command, value)),
	};
}

module.exports = (connect(null, mapDispatchToProps)(withTheme(StopButton)): Object);
