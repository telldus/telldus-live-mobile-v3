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
	dBTileDisplayMode?: string,

	colors: Object,
	colorScheme: string,
	themeInApp: string,

	style: Object,
	intl: Object,
	isGatewayActive: boolean,
	containerStyle?: Object | Array<any>,
	controlButtonStyle?: Array<any> | Object,
	infoBlockStyle?: Array<any> | Object,
	moreActionsStyle?: Array<any> | Object,
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

		const propsChange = shouldUpdate(others, othersN, [
			'item',
			'tileWidth',
			'isOpen',
			'currentTemp',
			'colorScheme',
			'themeInApp',
			'selectedThemeSet',
			'dBTileDisplayMode',
		]);
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
			tileWidth,
			colors,
		} = this.props;

		const { stateValues = {} } = item;
		let { THERMOSTAT: { mode, setpoint = {} } } = stateValues;

		if (!mode && Object.keys(setpoint).length !== 0) {
			mode = Object.keys(setpoint)[0];
		}
		let currentModeValue = setpoint[mode];
		currentModeValue = isNaN(currentModeValue) ? -100.0 : currentModeValue;

		const buttonTwo = <HeatInfoBlock
			isEnabled={true}
			style={[styles.buttonCommon, infoBlockStyle, {justifyContent: 'flex-start'}]}
			device={item}
			iconSize={tileWidth * 0.28}
			isGatewayActive={isGatewayActive}
			intl={intl}
			currentValue={currentModeValue}
			currentMode={mode}
			iconStyle={styles.iconStyle}
			textOneStyle={[styles.textOneStyle, {
				fontSize: tileWidth * 0.14,
				height: tileWidth * 0.16,
			}]}
			textTwoStyle={[styles.textTwoStyle, {
				fontSize: tileWidth * 0.09,
			}]}
			textThreeStyle={[styles.textThreeStyle, {
				fontSize: tileWidth * 0.09,
				height: tileWidth * 0.12,
			}]}
			infoIconStyle={{
				fontSize: tileWidth * 0.1,
				marginLeft: 2,
				color: '#fff',
			}}/>;

		const bGColor = !isGatewayActive ? Theme.Core.gatewayInactive :
			mode === 'off' ? colors.colorOffActiveBg : colors.colorOnActiveBg;

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
		color: '#fff',
		marginRight: 3,
	},
	textOneStyle: {
		textAlign: 'left',
		color: '#fff',
	},
	textTwoStyle: {
		color: '#fff',
	},
	textThreeStyle: {
		textAlign: 'left',
		color: '#fff',
	},
	actionIconStyle: {
		fontSize: 22,
		color: '#fff',
		paddingLeft: 3,
	},
});

export default (ThermostatButtonDB: Object);
