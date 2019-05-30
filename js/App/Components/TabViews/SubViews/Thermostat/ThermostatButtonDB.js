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
import { StyleSheet, LayoutAnimation } from 'react-native';
const isEqual = require('react-fast-compare');

import { View } from '../../../../../BaseComponents';
import MoreButtonsBlock from './MoreButtonsBlock';
import HeatInfoBlock from './HeatInfoBlock';

import { shouldUpdate, LayoutAnimations } from '../../../../Lib';

import Theme from '../../../../Theme';

type Props = {
	item: Object,
	tileWidth: number,
	showStopButton?: boolean,

	style: Object,
	intl: Object,
	isGatewayActive: boolean,
	containerStyle?: number | Object | Array<any>,
	controlButtonStyle?: number | Object | Array<any>,
	infoBlockStyle?: number | Object | Array<any>,
	moreActionsStyle?: number | Object | Array<any>,
	openThermostatControl: (number) => void,
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

		const propsChange = shouldUpdate(others, othersN, ['item', 'tileWidth']);
		if (propsChange) {
			return true;
		}

		return false;
	}

	onPressChangeMode = (i: number) => {
		const nextMode = this.state.currentModeIndex + i;

		const { item } = this.props;
		const { stateValues = {} } = item;
		const { THERMOSTAT: { setpoint = {}} } = stateValues;
		const numOfModes = Object.keys(setpoint);
		if (nextMode >= numOfModes.length || nextMode < 0) {
			return;
		}
		this.setState({
			currentModeIndex: nextMode,
		});
		LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
	}

	render(): Object {
		const {
			item,
			intl,
			isGatewayActive,
			containerStyle,
			infoBlockStyle,
			moreActionsStyle,
			openThermostatControl,
		} = this.props;

		const { stateValues = {} } = item;
		const { THERMOSTAT: { setpoint = {}, mode } } = stateValues;

		let currentModeValue = setpoint[mode];
		currentModeValue = typeof currentModeValue === 'undefined' ? -100.0 : currentModeValue;

		const buttonTwo = <HeatInfoBlock
			isEnabled={true}
			style={[styles.navigationButton, infoBlockStyle, {justifyContent: 'flex-start'}]}
			device={item}
			iconSize={30}
			isGatewayActive={isGatewayActive}
			intl={intl}
			currentValue={currentModeValue}
			currentMode={mode}/>;
		const buttonThree = <MoreButtonsBlock
			isEnabled={true}
			style={[styles.navigationButton, moreActionsStyle, {flex: 0}]}
			device={item}
			iconSize={16}
			isGatewayActive={isGatewayActive}
			intl={intl}
			onPressMoreButtons={openThermostatControl}/>;

		return (
			<View style={containerStyle}>
				<View style={{
					flex: 1,
					flexDirection: 'row',
					backgroundColor: Theme.Core.brandSecondary,
					paddingHorizontal: 3,
				}}>
					{buttonTwo}
					{buttonThree}
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	navigationButton: {
		flex: 1,
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
});

export default ThermostatButtonDB;
