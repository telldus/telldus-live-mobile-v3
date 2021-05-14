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
	withTheme,
} from '../../../HOC/withTheme';

import {
	shouldUpdate,
} from '../../../../Lib';

import Theme from '../../../../Theme';

type Props = {
	device: Object,
	tileWidth: number,
	showStopButton?: boolean,
	isOpen: boolean,
	currentTemp?: number,

	colors: Object,
	colorScheme: string,
	themeInApp: string,

	style: Object,
	intl: Object,
	isGatewayActive: boolean,
	style?: Array<any> | Object,
	controlButtonStyle?: Array<any> | Object,
	infoBlockStyle?: Array<any> | Object,
	moreActionsStyle?: Array<any> | Object,
	openThermostatControl: (number) => void,
	closeSwipeRow: () => void,
	onPressDeviceAction?: () => void,
	disableActionIndicator?: boolean,
};

type DefaultProps = {
	showStopButton: boolean,
	disableActionIndicator: boolean,
};

type State = {
	currentModeIndex: number,
};

class ThermostatButton extends View<Props, State> {
	props: Props;

	static defaultProps: DefaultProps = {
		showStopButton: true,
		disableActionIndicator: false,
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

		const propsChange = shouldUpdate(others, othersN, [
			'device',
			'tileWidth',
			'isOpen',
			'currentTemp',
			'onPressOverride',
			'colorScheme',
			'themeInApp',
			'selectedThemeSet',
		]);
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
			style,
			disableActionIndicator,
			colors,
		} = this.props;

		const { stateValues = {} } = device;
		let { THERMOSTAT: { mode, setpoint = {} } } = stateValues;

		if (!mode && Object.keys(setpoint).length !== 0) {
			mode = Object.keys(setpoint)[0];
		}

		let currentModeValue = setpoint[mode];

		currentModeValue = isNaN(currentModeValue) ? -100.0 : currentModeValue;

		const buttonTwo = <HeatInfoBlock
			isEnabled={true}
			style={[styles.buttonCommon, infoBlockStyle, {flex: 1, justifyContent: 'flex-start'}]}
			device={device}
			iconSize={35}
			isGatewayActive={isGatewayActive}
			intl={intl}
			currentValue={currentModeValue}
			currentMode={mode}
			iconStyle={styles.iconStyle}
			textOneStyle={styles.textOneStyle}
			textTwoStyle={styles.textTwoStyle}
			textThreeStyle={styles.textThreeStyle}
			disableActionIndicator={disableActionIndicator}
			infoIconStyle={styles.infoIconStyle}/>;

		const bGColor = !isGatewayActive ? Theme.Core.gatewayInactive :
			mode === 'off' ? colors.colorOffActiveBg : colors.colorOnActiveBg;

		return (
			<View style={style}>
				<TouchableOpacity onPress={this.onPressMoreButtons}>
					<View style={[styles.buttonsCover, {backgroundColor: bGColor }]}>
						{buttonTwo}
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
	},
	buttonCommon: {
		height: Theme.Core.rowHeight,
		justifyContent: 'center',
		alignItems: 'center',
	},
	iconStyle: {
		fontSize: 30,
		color: '#fff',
	},
	textOneStyle: {
		textAlign: 'left',
		color: '#fff',
		fontSize: Theme.Core.rowHeight * 0.33,
		height: Theme.Core.rowHeight * 0.39,
	},
	actionIconStyle: {
		fontSize: 27,
		color: '#fff',
		paddingLeft: 3,
	},
	textTwoStyle: {
		fontSize: Theme.Core.rowHeight * 0.2,
		color: '#fff',
	},
	textThreeStyle: {
		textAlign: 'left',
		fontSize: Theme.Core.rowHeight * 0.19,
		height: Theme.Core.rowHeight * 0.3,
		color: '#fff',
	},
	infoIconStyle: {
		fontSize: Theme.Core.rowHeight * 0.19,
		marginBottom: Theme.Core.rowHeight * 0.06,
		marginLeft: 2,
		color: '#fff',
	},
});

export default (withTheme(ThermostatButton): Object);
