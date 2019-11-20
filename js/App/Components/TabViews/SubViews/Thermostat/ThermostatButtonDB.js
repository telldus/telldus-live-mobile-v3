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
import { StyleSheet, TouchableOpacity } from 'react-native';
const isEqual = require('react-fast-compare');

import { View } from '../../../../../BaseComponents';
import HeatInfoBlock from './HeatInfoBlock';

import {
	shouldUpdate,
} from '../../../../Lib';

import Theme from '../../../../Theme';

type Props = {
	item: Object,
	tileWidth: number,
	showStopButton?: boolean,
	isOpen?: boolean,
	currentTemp?: number,

	style: Object,
	intl: Object,
	isGatewayActive: boolean,
	containerStyle?: number | Object | Array<any>,
	controlButtonStyle?: number | Object | Array<any>,
	infoBlockStyle?: number | Object | Array<any>,
	moreActionsStyle?: number | Object | Array<any>,
	openThermostatControl: (number) => void,
	closeSwipeRow: () => void,
	onPressDeviceAction?: () => void,
};

type DefaultProps = {
	showStopButton: boolean,
};

type State = {
	currentModeIndex: number,
};

class ThermostatButtonDB extends View<Props, State> {
	props: Props;

	static defaultProps: DefaultProps = {
		showStopButton: true,
	};

	constructor(props: Props) {
		super(props);

		this.state = {
			currentModeIndex: 0,
		};
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		if (!isEqual(this.state, nextState)) {
			return true;
		}

		const { showStopButton, ...others } = this.props;
		const { showStopButton: showStopButtonN, ...othersN } = nextProps;
		if (showStopButton !== showStopButtonN) {
			return true;
		}

		const propsChange = shouldUpdate(others, othersN, ['item', 'tileWidth', 'isOpen', 'currentTemp']);
		if (propsChange) {
			return true;
		}

		return false;
	}

	onPressMoreButtons = () => {
		const { item, isOpen, closeSwipeRow, onPressDeviceAction, openThermostatControl } = this.props;
		if (isOpen && closeSwipeRow) {
			closeSwipeRow();
			return;
		}
		if (onPressDeviceAction) {
			onPressDeviceAction();
		}
		if (openThermostatControl) {
			openThermostatControl(item.id);
		}
	}

	render(): Object {
		const {
			item,
			intl,
			isGatewayActive,
			containerStyle,
			infoBlockStyle,
		} = this.props;

		const { stateValues = {} } = item;
		const { THERMOSTAT: { mode, setpoint = {} } } = stateValues;

		let currentModeValue = setpoint[mode];
		if (!mode && Object.keys(setpoint).length === 0) {
			currentModeValue = setpoint[Object.keys(setpoint)[0]];
		}
		currentModeValue = isNaN(currentModeValue) ? -100.0 : currentModeValue;

		const buttonTwo = <HeatInfoBlock
			isEnabled={true}
			style={[styles.buttonCommon, infoBlockStyle, {justifyContent: 'flex-start'}]}
			device={item}
			iconSize={30}
			isGatewayActive={isGatewayActive}
			intl={intl}
			currentValue={currentModeValue}
			currentMode={mode}
			iconStyle={styles.iconStyle}
			textOneStyle={styles.textOneStyle}
			textTwoStyle={styles.textTwoStyle}
			textThreeStyle={styles.textThreeStyle}/>;

		const bGColor = !isGatewayActive ? Theme.Core.gatewayInactive :
			mode === 'off' ? Theme.Core.brandPrimary : Theme.Core.brandSecondary;

		return (
			<TouchableOpacity onPress={this.onPressMoreButtons} style={containerStyle}>
				<View style={[styles.buttonsCover, {backgroundColor: bGColor }]}>
					{buttonTwo}
				</View>
			</TouchableOpacity>
		);
	}
}

const styles = StyleSheet.create({
	buttonsCover: {
		flex: 1,
		flexDirection: 'row',
		paddingHorizontal: 3,
	},
	buttonCommon: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	iconStyle: {
		fontSize: 24,
		color: '#fff',
	},
	textOneStyle: {
		textAlign: 'left',
		fontSize: 13,
		color: '#fff',
	},
	textTwoStyle: {
		fontSize: 8,
		color: '#fff',
	},
	textThreeStyle: {
		textAlign: 'left',
		fontSize: 7,
		color: '#fff',
	},
	actionIconStyle: {
		fontSize: 22,
		color: '#fff',
		paddingLeft: 3,
	},
	itemIconContainerOn: {
		backgroundColor: Theme.Core.brandSecondary,
	},
	itemIconContainerOff: {
		backgroundColor: Theme.Core.brandPrimary,
	},
	itemIconContainerOffline: {
		backgroundColor: Theme.Core.offlineColor,
	},
});

export default ThermostatButtonDB;
