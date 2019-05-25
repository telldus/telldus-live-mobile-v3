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

import { View, IconTelldus } from '../../../../../BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { deviceSetState } from '../../../../Actions/Devices';
import ButtonLoadingIndicator from '../ButtonLoadingIndicator';

import { shouldUpdate } from '../../../../Lib';
import i18n from '../../../../Translations/common';
import Theme from '../../../../Theme';

type Props = {
	device: Object,
	isOpen: boolean,

	command: number,
	isGatewayActive: boolean,
	intl: Object,
	style: Object,
	controlHeatBlockStyle: number | Object,
	closeSwipeRow: () => void,
	deviceSetState: (id: number, command: number, value?: number) => void,
	onPressDeviceAction?: () => void,
	onPressChangeMode: (number) => void,
};

type DefaultProps = {
    command: number,
};

class ChangeModesBlock extends View<Props, null> {
props: Props;
static defaultProps: DefaultProps = {
	command: 2048,
};

constructor(props: Props) {
	super(props);
	// TODO: update accessibility label.
	this.labelBellButton = `${props.intl.formatMessage(i18n.bell)} ${props.intl.formatMessage(i18n.button)}`;
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {

	const { isOpen, ...others } = this.props;
	const { isOpenN, ...othersN } = nextProps;
	if (isOpen !== isOpenN) {
		return true;
	}

	const propsChange = shouldUpdate(others, othersN, ['device']);
	if (propsChange) {
		return true;
	}

	return false;
}

	onPressUp = () => {
		const { onPressChangeMode } = this.props;
		onPressChangeMode(1);
	}

	onPressDown = () => {
		const { onPressChangeMode } = this.props;
		onPressChangeMode(-1);
	}

	render(): Object {
		let { device, controlHeatBlockStyle } = this.props;
		let { methodRequested, name, local } = device;
		let accessibilityLabel = `${this.labelBellButton}, ${name}`;
		// let iconColor = !isGatewayActive ? '#a2a2a2' : Theme.Core.brandSecondary;
		let dotColor = local ? Theme.Core.brandPrimary : '#fff';

		return (
			<View style={[styles.button, this.props.style, controlHeatBlockStyle]} accessibilityLabel={accessibilityLabel}>
				<TouchableOpacity onPress={this.onPressUp} >
					<IconTelldus icon="up" size={18} color={'#fff'} style={styles.upIconStyle}/>
				</TouchableOpacity>
				<TouchableOpacity onPress={this.onPressDown} >
					<IconTelldus icon="down" size={18} color={'#fff'} style={styles.downIconStyle}/>
				</TouchableOpacity>

				{
					methodRequested === 'THERMOSTAT' ?
						<ButtonLoadingIndicator style={styles.dot} color={dotColor}/>
						:
						null
				}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	button: {
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Theme.Core.brandSecondary,
	},
	dot: {
		position: 'absolute',
		top: 3,
		left: 3,
	},
	upIconStyle: {
		textAlignVertical: 'bottom',
	},
	downIconStyle: {
		textAlignVertical: 'top',
	},
});

function mapDispatchToProps(dispatch: Function): Object {
	return {
		deviceSetState: (id: number, command: number, value?: number) =>{
			dispatch(deviceSetState(id, command, value));
		},
	};
}

module.exports = connect(null, mapDispatchToProps)(ChangeModesBlock);
