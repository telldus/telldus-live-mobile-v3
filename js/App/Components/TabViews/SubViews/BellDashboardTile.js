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
import { TouchableOpacity, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import { View, IconTelldus } from '../../../../BaseComponents';
import DashboardShadowTile from './DashboardShadowTile';
import { deviceSetState, requestDeviceAction } from '../../../Actions/Devices';
import ButtonLoadingIndicator from './ButtonLoadingIndicator';

import i18n from '../../../Translations/common';
import { getLabelDevice } from '../../../Lib';
import { getPowerConsumed } from '../../../Lib';

import Theme from '../../../Theme';

type Props = {
	deviceSetState: (id: number, command: number, value?: number) => void,
	requestDeviceAction: (id: number, command: number) => void,
	item: Object,
	tileWidth: number,
	style: Object,
	command: number,
	intl: Object,
	isGatewayActive: boolean,
	powerConsumed: string,
};

type DefaultProps = {
	command: number,
}

class BellDashboardTile extends PureComponent<Props, null> {
	props: Props;

	static defaultProps: DefaultProps = {
		command: 4,
	}

	onBell: () => void;
	labelBellButton: string;

	constructor(props: Props) {
		super(props);

		this.onBell = this.onBell.bind(this);

		let { formatMessage } = props.intl;

		this.labelBellButton = `${formatMessage(i18n.bell)} ${formatMessage(i18n.button)}`;
	}

	onBell() {
		this.props.deviceSetState(this.props.item.id, this.props.command);
		this.props.requestDeviceAction(this.props.item.id, this.props.command);
	}

	render() {
		const { item, tileWidth, intl, isGatewayActive, powerConsumed } = this.props;
		const { methodRequested, name } = this.props.item;

		const info = powerConsumed ? `${powerConsumed} W` : null;

		const accessibilityLabelButton = `${this.labelBellButton}, ${name}`;
		const accessibilityLabel = getLabelDevice(intl.formatMessage, item);

		let iconContainerStyle = !isGatewayActive ? styles.itemIconContainerOffline : styles.itemIconContainerOn;
		let iconColor = isGatewayActive ? Theme.Core.brandSecondary : Theme.Core.offlineColor;

		return (
			<DashboardShadowTile
				item={item}
				isEnabled={true}
				name={name}
				info={info}
				icon={'bell'}
				iconStyle={{
					color: '#fff',
					fontSize: tileWidth / 4.9,
				}}
				iconContainerStyle={[iconContainerStyle, {
					width: tileWidth / 4.5,
					height: tileWidth / 4.5,
					borderRadius: tileWidth / 9,
					alignItems: 'center',
					justifyContent: 'center',
				}]}
				type={'device'}
				tileWidth={tileWidth}
				accessibilityLabel={accessibilityLabel}
				isGatewayActive={isGatewayActive}
				style={[
					this.props.style, {
						width: tileWidth,
						height: tileWidth,
					}]
				}>
				<TouchableOpacity
					onPress={this.onBell}
					style={[styles.container, {
						width: tileWidth,
						height: tileWidth * 0.4,
						justifyContent: 'center',
						alignItems: 'center',
					}]}
					accessibilityLabel={accessibilityLabelButton}>
					<View style={styles.body}>
					  <IconTelldus icon="bell" size={32} color={iconColor} />
					</View>
					{
						methodRequested === 'BELL' ?
							<ButtonLoadingIndicator style={styles.dot} />
							:
							null
					}
				</TouchableOpacity>
			</DashboardShadowTile>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
	},
	body: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#eeeeee',
		borderBottomLeftRadius: 2,
		borderBottomRightRadius: 2,
	},
	dot: {
		position: 'absolute',
		top: 3,
		left: 3,
	},
	itemIconContainerOn: {
		backgroundColor: Theme.Core.brandSecondary,
	},
	itemIconContainerOffline: {
		backgroundColor: Theme.Core.offlineColor,
	},
});

function mapDispatchToProps(dispatch) {
	return {
		deviceSetState: (id: number, command: number, value?: number) =>{
			dispatch(deviceSetState(id, command, value));
		},
		requestDeviceAction: (id: number, command: number) => {
			dispatch(requestDeviceAction(id, command));
		},
	};
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	let powerConsumed = getPowerConsumed(store.sensors.byId, ownProps.item.clientDeviceId);
	return {
		powerConsumed,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(BellDashboardTile);
