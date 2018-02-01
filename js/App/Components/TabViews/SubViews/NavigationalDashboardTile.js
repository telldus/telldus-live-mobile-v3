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

'use strict';

import React from 'react';
import { connect } from 'react-redux';

import { StyleSheet } from 'react-native';

import { View } from 'BaseComponents';
import DashboardShadowTile from './DashboardShadowTile';
import StopButton from './Navigational/StopButton';
import UpButton from './Navigational/UpButton';
import DownButton from './Navigational/DownButton';
import { getLabelDevice } from 'Accessibility';
import Theme from 'Theme';

type Props = {
	item: Object,
	tileWidth: number,
	style: Object,
	intl: Object,
	isGatewayActive: boolean,
};

class NavigationalDashboardTile extends View {
	props: Props;

	constructor(props: Props) {
		super(props);
	}

	render() {
		const { item, tileWidth, intl, isGatewayActive } = this.props;
		const { name, supportedMethods, isInState } = item;
		const { UP, DOWN, STOP } = supportedMethods;
		const upButton = UP ? <UpButton isEnabled={true}
			methodRequested={item.methodRequested} iconSize={30} isGatewayActive={isGatewayActive}
			intl={intl} isInState={isInState} supportedMethod={UP} id={item.id}/> : null;
		const downButton = DOWN ? <DownButton isEnabled={true}
			methodRequested={item.methodRequested} iconSize={30} isGatewayActive={isGatewayActive}
			intl={intl} isInState={isInState} supportedMethod={DOWN} id={item.id}/> : null;
		const stopButton = STOP ? <StopButton isEnabled={true}
			methodRequested={item.methodRequested} iconSize={20} isGatewayActive={isGatewayActive}
			intl={intl} isInState={isInState} supportedMethod={STOP} id={item.id}/> : null;

		const accessibilityLabel = getLabelDevice(intl.formatMessage, item);

		let iconContainerStyle = !isGatewayActive ? styles.itemIconContainerOffline :
			(isInState === 'TURNOFF' ? styles.itemIconContainerOff : styles.itemIconContainerOn);

		return (
			<DashboardShadowTile
				item={item}
				isEnabled={true}
				name={name}
				icon={'curtain'}
				iconStyle={{
					color: '#fff',
					fontSize: tileWidth / 4.5,
				}}
				iconContainerStyle={[iconContainerStyle, {
					width: tileWidth / 4,
					height: tileWidth / 4,
					borderRadius: tileWidth / 8,
					alignItems: 'center',
					justifyContent: 'center',
				}]}
				type={'device'}
				tileWidth={tileWidth}
				accessibilityLabel={accessibilityLabel}
				style={[this.props.style, { width: tileWidth, height: tileWidth }]}>
				<View style={{
					width: tileWidth - 4,
					height: tileWidth * 0.4,
					flexDirection: 'row',
				}}>
					{ upButton }
					{ downButton }
					{ stopButton }
				</View>
			</DashboardShadowTile>
		);
	}
}

NavigationalDashboardTile.defaultProps = {
};

const styles = StyleSheet.create({
	navigationButton: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	buttonEnabled: {
		color: '#1a355b',
	},
	buttonDisabled: {
		color: '#eeeeee',
	},
	dot: {
		position: 'absolute',
		top: 3,
		left: 3,
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

module.exports = connect(null, null)(NavigationalDashboardTile);
