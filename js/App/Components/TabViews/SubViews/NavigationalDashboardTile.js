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
import i18n from '../../../Translations/common';
import { deviceSetState, requestDeviceAction } from 'Actions_Devices';
import { getLabelDevice } from 'Accessibility';
import Theme from 'Theme';

type Props = {
	item: Object,
	tileWidth: number,
	onUp: number => void,
	onDown: number => void,
	onStop: number => void,
	style: Object,
	commandUp: number,
	commandDown: number,
	commandStop: number,
	deviceSetState: (id: number, command: number, value?: number) => void,
	requestDeviceAction: (id: number, command: number) => void,
	intl: Object,
	isGatewayActive: boolean,
};

class NavigationalDashboardTile extends View {
	props: Props;

	onUp: (number) => void;
	onDown: (number) => void;
	onStop: (number) => void;

	constructor(props: Props) {
		super(props);

		this.onUp = this.onUp.bind(this);
		this.onDown = this.onDown.bind(this);
		this.onStop = this.onStop.bind(this);

		let { formatMessage } = props.intl;

		this.labelUpButton = `${formatMessage(i18n.up)} ${formatMessage(i18n.button)}`;
		this.labelDownButton = `${formatMessage(i18n.down)} ${formatMessage(i18n.button)}`;
		this.labelStopButton = `${formatMessage(i18n.stop)} ${formatMessage(i18n.button)}`;
	}

	onUp() {
		this.props.requestDeviceAction(this.props.item.id, this.props.commandUp);
		this.props.deviceSetState(this.props.item.id, this.props.commandUp);
	}
	onDown() {
		this.props.requestDeviceAction(this.props.item.id, this.props.commandDown);
		this.props.deviceSetState(this.props.item.id, this.props.commandDown);
	}
	onStop() {
		this.props.requestDeviceAction(this.props.item.id, this.props.commandStop);
		this.props.deviceSetState(this.props.item.id, this.props.commandStop);
	}

	render() {
		const { item, tileWidth, intl, isGatewayActive } = this.props;
		const { name, supportedMethods, isInState } = item;
		const { UP, DOWN, STOP } = supportedMethods;
		const upButton = UP ? <UpButton isEnabled={true} onPress={this.onUp}
			methodRequested={item.methodRequested} iconSize={30}
			accessibilityLabel={`${this.labelUpButton}, ${name}`} isGatewayActive={isGatewayActive}
			intl={intl} isInState={isInState} supportedMethod={UP} id={item.id}/> : null;
		const downButton = DOWN ? <DownButton isEnabled={true} onPress={this.onDown}
			methodRequested={item.methodRequested} iconSize={30}
			accessibilityLabel={`${this.labelDownButton}, ${name}`} isGatewayActive={isGatewayActive}
			intl={intl} isInState={isInState} supportedMethod={DOWN} id={item.id}/> : null;
		const stopButton = STOP ? <StopButton isEnabled={true} onPress={this.onStop}
			methodRequested={item.methodRequested} iconSize={20}
			accessibilityLabel={`${this.labelStopButton}, ${name}`} isGatewayActive={isGatewayActive}
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
	commandUp: 128,
	commandDown: 256,
	commandStop: 512,
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

function mapDispatchToProps(dispatch) {
	return {
		deviceSetState: (id: number, command: number, value?: number) => dispatch(deviceSetState(id, command, value)),
		requestDeviceAction: (id: number, command: number) => dispatch(requestDeviceAction(id, command)),
	};
}

module.exports = connect(null, mapDispatchToProps)(NavigationalDashboardTile);
