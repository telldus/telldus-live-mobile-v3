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

import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import { View } from '../../../../BaseComponents';
import StopButton from './Navigational/StopButton';
import UpButton from './Navigational/UpButton';
import DownButton from './Navigational/DownButton';

import Theme from '../../../Theme';

type Props = {
	item: Object,
	tileWidth: number,
	style: Object,
	intl: Object,
	isGatewayActive: boolean,
	containerStyle?: number | Object | Array<any>,
	showStopButton?: boolean,
	upButtonStyle?: number | Object | Array<any>,
	downButtonStyle?: number | Object | Array<any>,
	stopButtonStyle?: number | Object | Array<any>,
};

type DefaultProps = {
	showStopButton: boolean,
};

class NavigationalDashboardTile extends PureComponent<Props, null> {
	props: Props;

	static defaultProps: DefaultProps = {
		showStopButton: true,
	};

	constructor(props: Props) {
		super(props);
	}

	render(): Object {
		const { item, intl, isGatewayActive, containerStyle, upButtonStyle,
			downButtonStyle, stopButtonStyle, showStopButton } = this.props;
		const { name, supportedMethods, isInState, local } = item;
		const { UP, DOWN, STOP } = supportedMethods;

		const upButton = UP ? <UpButton isEnabled={true} style={[styles.navigationButton, {borderLeftWidth: 0}, upButtonStyle]}
			methodRequested={item.methodRequested} iconSize={30} isGatewayActive={isGatewayActive}
			intl={intl} isInState={isInState} supportedMethod={UP} id={item.id} name={name} local={local}/> : null;
		const downButton = DOWN ? <DownButton isEnabled={true} style={[styles.navigationButton, downButtonStyle]}
			methodRequested={item.methodRequested} iconSize={30} isGatewayActive={isGatewayActive}
			intl={intl} isInState={isInState} supportedMethod={DOWN} id={item.id} name={name} local={local}/> : null;
		const stopButton = STOP ? <StopButton isEnabled={true} style={[styles.navigationButton, stopButtonStyle]}
			methodRequested={item.methodRequested} iconSize={16} isGatewayActive={isGatewayActive}
			intl={intl} isInState={isInState} supportedMethod={STOP} id={item.id} name={name} local={local}/> : null;

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
		borderLeftWidth: 1,
		borderLeftColor: '#ddd',
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

module.exports = NavigationalDashboardTile;
