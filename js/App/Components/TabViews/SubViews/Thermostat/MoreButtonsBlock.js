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
import { TouchableOpacity, StyleSheet } from 'react-native';

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
	moreButtonsBlockStyle: number | Object,
	closeSwipeRow: () => void,
	onPressMoreButtons: (id: number) => void,
	onPressDeviceAction?: () => void,
};

class MoreButtonsBlock extends View {
	props: Props;

	onPressMoreButtons: () => void;

	constructor(props: Props) {
		super(props);

		this.onPressMoreButtons = this.onPressMoreButtons.bind(this);
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

	onPressMoreButtons() {
		const { device, isOpen, closeSwipeRow, onPressDeviceAction, onPressMoreButtons } = this.props;
		if (isOpen && closeSwipeRow) {
			closeSwipeRow();
			return;
		}
		if (onPressDeviceAction) {
			onPressDeviceAction();
		}
		if (onPressMoreButtons) {
			onPressMoreButtons(device.id);
		}
	}

	render(): Object {
		let { device, moreButtonsBlockStyle } = this.props;
		let { name } = device;
		let accessibilityLabel = `${this.labelBellButton}, ${name}`;
		// let iconColor = !isGatewayActive ? '#a2a2a2' : Theme.Core.brandSecondary;

		return (
			<TouchableOpacity onPress={this.onPressMoreButtons} style={[styles.button, this.props.style, moreButtonsBlockStyle]} accessibilityLabel={accessibilityLabel}>
				<IconTelldus icon="settings" size={22} color={'#fff'} style={{marginRight: 3}}/>
			</TouchableOpacity>
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

module.exports = MoreButtonsBlock;
