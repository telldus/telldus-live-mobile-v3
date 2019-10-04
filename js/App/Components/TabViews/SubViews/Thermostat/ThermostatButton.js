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
import MoreButtonsBlock from './MoreButtonsBlock';
import HeatInfoBlock from './HeatInfoBlock';

import { shouldUpdate } from '../../../../Lib';

import Theme from '../../../../Theme';

type Props = {
	device: Object,
	tileWidth: number,
	showStopButton?: boolean,
	isOpen: boolean,

	style: Object,
	intl: Object,
	isGatewayActive: boolean,
	style?: number | Object | Array<any>,
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

class ThermostatButton extends View<Props, State> {
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

		const propsChange = shouldUpdate(others, othersN, ['device', 'tileWidth', 'isOpen']);
		if (propsChange) {
			return true;
		}

		return false;
	}

	onPressMoreButtons = () => {
		const { device, isOpen, closeSwipeRow, onPressDeviceAction, openThermostatControl } = this.props;
		if (isOpen && closeSwipeRow) {
			closeSwipeRow();
			return;
		}
		if (onPressDeviceAction) {
			onPressDeviceAction();
		}
		if (openThermostatControl) {
			openThermostatControl(device.id);
		}
	}

	render(): Object {
		const {
			device,
			intl,
			isGatewayActive,
			infoBlockStyle,
			moreActionsStyle,
			style,
		} = this.props;

		const { stateValues = {} } = device;
		const { THERMOSTAT: { setpoint = {}, mode } } = stateValues;

		let currentModeValue = setpoint[mode];
		currentModeValue = isNaN(currentModeValue) ? -100.0 : currentModeValue;

		const buttonTwo = <HeatInfoBlock
			isEnabled={true}
			style={[styles.buttonCommon, infoBlockStyle, {flex: 1, justifyContent: 'flex-start'}]}
			device={device}
			iconSize={30}
			isGatewayActive={isGatewayActive}
			intl={intl}
			currentValue={currentModeValue}
			currentMode={mode}
			iconStyle={styles.iconStyle}
			textOneStyle={styles.textOneStyle}
			textTwoStyle={styles.textTwoStyle}
			textThreeStyle={styles.textThreeStyle}/>;
		const buttonThree = <MoreButtonsBlock
			isEnabled={true}
			style={[styles.buttonCommon, moreActionsStyle, {flex: 0}]}
			device={device}
			iconSize={16}
			isGatewayActive={isGatewayActive}
			intl={intl}
			currentMode={mode}
			iconStyle={styles.actionIconStyle}/>;

		const bGColor = !isGatewayActive ? Theme.Core.gatewayInactive :
			mode === 'off' ? Theme.Core.brandPrimary : Theme.Core.brandSecondary;

		return (
			<View style={style}>
				<TouchableOpacity onPress={this.onPressMoreButtons}>
					<View style={[styles.buttonsCover, {backgroundColor: bGColor }]}>
						{buttonTwo}
						{buttonThree}
					</View>
				</TouchableOpacity>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	buttonsCover: {
		width: Theme.Core.buttonWidth * 2,
		padding: 3,
		flexDirection: 'row',
		justifyContent: 'flex-start',
		backgroundColor: Theme.Core.brandSecondary,
	},
	buttonCommon: {
		height: Theme.Core.rowHeight,
		justifyContent: 'center',
		alignItems: 'center',
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
	iconStyle: {
		fontSize: 30,
		color: '#fff',
	},
	textOneStyle: {
		textAlign: 'left',
		fontSize: 18,
		color: '#fff',
	},
	actionIconStyle: {
		fontSize: 27,
		color: '#fff',
		paddingLeft: 3,
	},
	textTwoStyle: {
		fontSize: 11,
		color: '#fff',
	},
	textThreeStyle: {
		textAlign: 'left',
		fontSize: 9,
		color: '#fff',
	},
});

export default ThermostatButton;
