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

import {
	shouldUpdate,
	formatModeValue,
	getKnownModes,
} from '../../../../Lib';
import i18n from '../../../../Translations/common';
import Theme from '../../../../Theme';

type Props = {
	command: number,

	device: Object,
	isOpen: boolean,
	currentMode: string,
	currentValue: string,

	iconSize: number,
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
	disableActionIndicator?: boolean,
};

class HeatInfoBlock extends View {
	props: Props;

	constructor(props: Props) {
		super(props);

		this.thermostatMoreActions = props.intl.formatMessage(i18n.thermostatMoreActions);
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
			iconSize,
			disableActionIndicator,
		} = this.props;
		let { methodRequested, name, local } = device;

		let dotColor = local ? Theme.Core.brandPrimary : Theme.Core.brandSecondary;

		let accessibilityLabel = `${this.thermostatMoreActions}, ${name}`;

		const knownModes = getKnownModes(intl.formatMessage);
		let IconActive, icon = '', currentModeLabel = '';
		knownModes.map((item: Object) => {
			if (currentMode === item.mode) {
				IconActive = item.IconActive;
				icon = item.icon;
				currentModeLabel = item.label;
			}
		});

		const showValue = currentMode !== 'off' && currentMode !== 'fan' && currentValue;

		const showModelabel = currentMode !== 'off';

		return (
			<View style={[styles.button, this.props.style, heatInfoBlockStyle, {
				paddingLeft: showValue ? 0 : 3,
				justifyContent: showModelabel ? 'flex-start' : 'center',
			}]} accessibilityLabel={accessibilityLabel}>
				{IconActive ?
					<IconActive height={iconSize} width={iconSize} style={iconStyle}/>
					:
					<IconTelldus icon={icon} size={iconSize} style={iconStyle}/>
				}
				<View style={{alignItems: 'flex-start', marginLeft: 2}}>
					{showValue && <Text style={{textAlign: 'left'}}>
						<FormattedNumber
							formatterFunction={this.formatterFunction}
							style={textOneStyle}
							value={currentValue}
							minimumFractionDigits={1}/>

						<Text style={textTwoStyle}>°C</Text>
					</Text>
					}
					{showModelabel && <Text style={textThreeStyle}>
						{!!currentModeLabel && currentModeLabel.toUpperCase()}
					</Text>
					}
				</View>
				{
					!disableActionIndicator && methodRequested === 'THERMOSTAT' ?
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
