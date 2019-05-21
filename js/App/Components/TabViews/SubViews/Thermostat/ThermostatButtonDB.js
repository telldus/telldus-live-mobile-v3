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
import { StyleSheet } from 'react-native';

import { View } from '../../../../../BaseComponents';
import MoreButtonsBlock from './MoreButtonsBlock';
import ControlHeatBlock from './ControlHeatBlock';
import HeatInfoBlock from './HeatInfoBlock';

import { shouldUpdate } from '../../../../Lib';

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

class ThermostatButtonDB extends View<Props, null> {
	props: Props;

	static defaultProps: DefaultProps = {
		showStopButton: true,
	};

	constructor(props: Props) {
		super(props);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {

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

	render(): Object {
		const {
			item,
			intl,
			isGatewayActive,
			containerStyle,
			controlButtonStyle,
			infoBlockStyle,
			moreActionsStyle,
			showStopButton,
			openThermostatControl,
		} = this.props;

		const upButton = <ControlHeatBlock
			isEnabled={true}
			style={[styles.navigationButton, {borderLeftWidth: 0}, controlButtonStyle]}
			device={item}
			iconSize={30}
			isGatewayActive={isGatewayActive}
			intl={intl}/>;
		const downButton = <HeatInfoBlock
			isEnabled={true}
			style={[styles.navigationButton, infoBlockStyle]}
			device={item}
			iconSize={30}
			isGatewayActive={isGatewayActive}
			intl={intl}/>;
		const stopButton = <MoreButtonsBlock
			isEnabled={true}
			style={[styles.navigationButton, moreActionsStyle]}
			device={item}
			iconSize={16}
			isGatewayActive={isGatewayActive}
			intl={intl}
			onPressMoreButtons={openThermostatControl}/>;

		return (
			<View style={containerStyle}>
				{ upButton }
				{ downButton }
				{!!showStopButton && stopButton }
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
