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
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';

import { View } from '../../../../BaseComponents';
import OnButton from './OnButton';
import OffButton from './OffButton';

import { shouldUpdate } from '../../../Lib';
import Theme from '../../../Theme';

type Props = {
	device: Object,
	enabled: boolean,
	isGatewayActive: boolean,
	isOpen: boolean,
	actionIcons?: Object,

	intl: Object,
	style?: Object | number,
	offButtonStyle?: number | Object | Array<any>,
	onButtonStyle?: number | Object | Array<any>,
	closeSwipeRow: () => void,
	onTurnOff: number => void,
	onTurnOn: number => void,
};

class ToggleButton extends View {
	props: Props;

	constructor(props: Props) {
		super(props);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {

		const { enabled, isOpen, ...others } = this.props;
		const { enabled: enabledN, isOpen: isOpenN, ...othersN } = nextProps;
		if (enabled !== enabledN || isOpen !== isOpenN) {
			return true;
		}

		const propsChange = shouldUpdate(others, othersN, ['actionIcons', 'device']);
		if (propsChange) {
			return true;
		}

		return false;
	}

	render(): Object {
		const {
			intl,
			device,
			isGatewayActive,
			style,
			onButtonStyle,
			offButtonStyle,
			isOpen,
			closeSwipeRow,
			actionIcons = {},
		} = this.props;
		const { id, isInState, methodRequested, name, local, supportedMethods = {} } = device;
		const { TURNON, TURNOFF } = supportedMethods;
		const width = Theme.Core.buttonWidth;

		const sharedProps = {
			id,
			name,
			isInState,
			methodRequested,
			isGatewayActive,
			local,
			isOpen,
			closeSwipeRow,
			intl,
		};

		const onButton = <OnButton
			{...sharedProps}
			enabled={isOpen || !!TURNON}
			style={[styles.turnOn, TURNON ? {width} : {width: width * 2}, onButtonStyle]}
			actionIcon={actionIcons.TURNON}
		/>;
		const offButton = <OffButton
			{...sharedProps}
			enabled={isOpen || !!TURNOFF}
			style={[styles.turnOff, TURNOFF ? {width} : {width: width * 2}, offButtonStyle]}
			actionIcon={actionIcons.TURNOFF}
		/>;

		return (
			<View style={style}>
				{(!!TURNOFF || (!TURNOFF && isInState === 'TURNOFF')) && offButton }
				{(!!TURNON || (!TURNON && isInState === 'TURNON')) && onButton }
			</View>
		);
	}
}

const styles = StyleSheet.create({
	turnOff: {
		height: Theme.Core.rowHeight,
		borderLeftWidth: 1,
		borderLeftColor: '#ddd',
		justifyContent: 'center',
		alignItems: 'center',
	},
	turnOn: {
		height: Theme.Core.rowHeight,
		justifyContent: 'center',
		alignItems: 'center',
	},
	iconStyleLarge: {
		fontSize: 38,
	},
});

ToggleButton.propTypes = {
	device: PropTypes.object,
	enabled: PropTypes.bool,
};

ToggleButton.defaultProps = {
	enabled: true,
};

module.exports = ToggleButton;
