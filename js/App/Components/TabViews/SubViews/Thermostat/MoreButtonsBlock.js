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

import { View, IconTelldus } from '../../../../../BaseComponents';
import { StyleSheet } from 'react-native';

import { shouldUpdate, getKnownModes } from '../../../../Lib';
import i18n from '../../../../Translations/common';

type Props = {
	command: number,

	device: Object,
	currentMode: string,

	isGatewayActive: boolean,
	intl: Object,
	style: Object,
	moreButtonsBlockStyle: number | Object,

	iconStyle: number | Object,
};

class MoreButtonsBlock extends View {
	props: Props;

	constructor(props: Props) {
		super(props);

		this.thermostatMoreActions = props.intl.formatMessage(i18n.thermostatMoreActions);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {

		const propsChange = shouldUpdate(this.props, nextProps, ['device']);
		if (propsChange) {
			return true;
		}

		return false;
	}

	render(): Object {
		let { device, moreButtonsBlockStyle, iconStyle, currentMode, intl, iconSize } = this.props;
		let { name } = device;
		let accessibilityLabel = `${this.thermostatMoreActions}, ${name}`;

		const knownModes = getKnownModes(intl.formatMessage);
		let IconActive, icon;
		knownModes.map((item: Object) => {
			if (currentMode === item.mode) {
				IconActive = item.IconActive;
				icon = item.icon;
			}
		});
		return (
			<View style={[styles.button, this.props.style, moreButtonsBlockStyle]} accessibilityLabel={accessibilityLabel}>
				{IconActive ?
					<IconActive height={iconSize} width={iconSize}/>
					:
					<IconTelldus icon={icon} style={iconStyle}/>
				}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	button: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	dot: {
		position: 'absolute',
		top: 3,
		left: 3,
	},
});

module.exports = MoreButtonsBlock;
