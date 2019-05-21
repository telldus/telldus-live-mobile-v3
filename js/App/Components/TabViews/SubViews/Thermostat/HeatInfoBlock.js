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

import { View, Text } from '../../../../../BaseComponents';
import { StyleSheet } from 'react-native';
import ButtonLoadingIndicator from '../ButtonLoadingIndicator';

import { shouldUpdate } from '../../../../Lib';
import i18n from '../../../../Translations/common';
import Theme from '../../../../Theme';

type Props = {
	command: number,

	device: Object,
	isOpen: boolean,

	isGatewayActive: boolean,
	intl: Object,
	style: Object,
	heatInfoBlockStyle: number | Object,
	closeSwipeRow: () => void,
	deviceSetState: (id: number, command: number, value?: number) => void,
	onPressDeviceAction?: () => void,
};

class HeatInfoBlock extends View {
	props: Props;

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

	render(): Object {
		let { device, heatInfoBlockStyle } = this.props;
		let { methodRequested, name, local } = device;
		let accessibilityLabel = `${this.labelBellButton}, ${name}`;
		let dotColor = local ? Theme.Core.brandPrimary : Theme.Core.brandSecondary;

		return (
			<View style={[styles.button, this.props.style, heatInfoBlockStyle]} accessibilityLabel={accessibilityLabel}>
				<View style={{justifyContent: 'flex-start'}}>
					<Text>
						<Text style={{textAlign: 'left', fontSize: 13, color: '#fff'}}>23</Text>
						<Text style={{fontSize: 8, color: '#fff'}}>°C</Text>
					</Text>
					<Text style={{textAlign: 'left', fontSize: 8, color: '#fff'}}>
                HEAT
					</Text>
				</View>
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
});

module.exports = HeatInfoBlock;
