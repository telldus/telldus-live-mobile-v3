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

import { View, Text, IconTelldus, FormattedNumber } from '../../../../../BaseComponents';
import { StyleSheet } from 'react-native';
import ButtonLoadingIndicator from '../ButtonLoadingIndicator';

import { shouldUpdate, formatModeValue } from '../../../../Lib';
import i18n from '../../../../Translations/common';
import Theme from '../../../../Theme';

type Props = {
	command: number,

	device: Object,
	isOpen: boolean,
	currentMode: string,
	currentValue: string,

	isGatewayActive: boolean,
	intl: Object,
	style: Object,
	heatInfoBlockStyle: number | Object,
	iconStyle: number | Object,
	textOneStyle: number | Object,
	textTwoStyle: number | Object,
	textThreeStyle: number | Object,
	closeSwipeRow: () => void,
	deviceSetState: (id: number, command: number, value?: number) => void,
	onPressDeviceAction?: () => void,
};

class HeatInfoBlock extends View {
	props: Props;

	constructor(props: Props) {
		super(props);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {

		const { isOpen, ...others } = this.props;
		const { isOpenN, ...othersN } = nextProps;
		if (isOpen !== isOpenN) {
			return true;
		}

		const propsChange = shouldUpdate(others, othersN, ['device', 'currentMode', 'currentValue']);
		if (propsChange) {
			return true;
		}

		return false;
	}

	formatterFunction = (value: number): string | number => {
		return formatModeValue(value, this.props.intl.formatNumber);
	}

	render(): Object {
		let {
			device,
			heatInfoBlockStyle,
			currentMode,
			currentValue,
			iconStyle,
			textOneStyle,
			textTwoStyle,
			textThreeStyle,
			intl,
		} = this.props;
		const { formatMessage } = intl;
		let { methodRequested, name, local } = device;
		const labelValue = currentValue ? `${formatMessage(i18n.currentValue)} ${currentValue} °C` : '';
		const labelCMode = currentMode ? `${formatMessage(i18n.currentMode)} ${currentMode}` : '';
		let accessibilityLabel = `${formatMessage(i18n.thermostat)} ${name}, ${labelCMode}, ${labelValue}`;
		let dotColor = local ? Theme.Core.brandPrimary : Theme.Core.brandSecondary;

		return (
			<View style={[styles.button, this.props.style, heatInfoBlockStyle]} accessibilityLabel={accessibilityLabel}>
				<IconTelldus icon="temperature" style={iconStyle}/>
				<View style={{alignItems: 'flex-start', marginLeft: 2}}>
					<Text style={{textAlign: 'left'}}>
						<FormattedNumber
							formatterFunction={this.formatterFunction}
							style={textOneStyle}
							value={currentValue}
							minimumFractionDigits={1}/>
						<Text style={textTwoStyle}>°C</Text>
					</Text>
					<Text style={textThreeStyle}>
						{!!currentMode && currentMode.toUpperCase()}
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
		justifyContent: 'flex-start',
		alignItems: 'center',
		flexDirection: 'row',
	},
	dot: {
		position: 'absolute',
		top: 3,
		left: 3,
	},
});

module.exports = HeatInfoBlock;
