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
import { TouchableOpacity } from 'react-native';
import { deviceSetState } from '../../../Actions/Devices';
import ButtonLoadingIndicator from './ButtonLoadingIndicator';

import {
	withTheme,
} from '../../HOC/withTheme';

import { shouldUpdate } from '../../../Lib';
import i18n from '../../../Translations/common';

type Props = {
	command: number,

	device: Object,
	isOpen: boolean,
	iconColor?: string,

	colors: Object,
	colorScheme: string,
	themeInApp: string,

	isGatewayActive: boolean,
	intl: Object,
	style: Object,
	bellButtonStyle: Array<any> | Object,
	closeSwipeRow: () => void,
	deviceSetState: (id: number, command: number, value?: number) => void,
	onPressDeviceAction?: () => void,
	onPressOverride?: (Object) => void,
	disableActionIndicator?: boolean,
};

class BellButton extends View {
	props: Props;

	onBell: () => void;

	constructor(props: Props) {
		super(props);

		this.onBell = this.onBell.bind(this);
		this.labelBellButton = `${props.intl.formatMessage(i18n.bell)} ${props.intl.formatMessage(i18n.button)}`;
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {

		const { isOpen, ...others } = this.props;
		const { isOpenN, ...othersN } = nextProps;
		if (isOpen !== isOpenN) {
			return true;
		}

		const propsChange = shouldUpdate(others, othersN, [
			'device',
			'onPressOverride',
			'iconColor',
			'colorScheme',
			'themeInApp',
			'selectedThemeSet',
		]);
		if (propsChange) {
			return true;
		}

		return false;
	}

	onBell() {
		const {
			command,
			device,
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
		this.props.deviceSetState(device.id, command);
	}

	render(): Object {
		let { device, isGatewayActive, bellButtonStyle, disableActionIndicator = false, iconColor, colors } = this.props;
		let { methodRequested, name, local } = device;

		const styles = getStyles({colors});

		let accessibilityLabel = `${this.labelBellButton}, ${name}`;
		let _iconColor = iconColor || (!isGatewayActive ? '#a2a2a2' : colors.colorOnInActiveIcon);
		let dotColor = local ? colors.colorOffActiveBg : colors.colorOnActiveBg;

		return (
			<TouchableOpacity onPress={this.onBell} style={[styles.bell, this.props.style, bellButtonStyle]} accessibilityLabel={accessibilityLabel}>
				<IconTelldus icon="bell" size={22} color={_iconColor} />

				{
					!disableActionIndicator && methodRequested === 'BELL' ?
						<ButtonLoadingIndicator style={styles.dot} color={dotColor}/>
						:
						null
				}
			</TouchableOpacity>
		);
	}
}

BellButton.defaultProps = {
	command: 4,
	disableActionIndicator: false,
};

const getStyles = ({colors}: Object): Object => {

	const {
		colorOnInActiveBg,
	} = colors;

	return {
		bell: {
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: colorOnInActiveBg,
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
		deviceSetState: (id: number, command: number, value?: number) =>{
			dispatch(deviceSetState(id, command, value));
		},
	};
}

module.exports = (connect(null, mapDispatchToProps)(withTheme(BellButton)): Object);
