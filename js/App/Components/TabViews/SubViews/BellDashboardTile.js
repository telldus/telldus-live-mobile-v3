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
import { deviceSetState, requestDeviceAction } from '../../../Actions/Devices';
import ButtonLoadingIndicator from './ButtonLoadingIndicator';

import i18n from '../../../Translations/common';

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
	containerStyle?: number | Object | Array<any>,
	bellButtonStyle?: number | Object | Array<any>,
};

type DefaultProps = {
	command: number,
};

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

	render(): Object {
		const { item, isGatewayActive, containerStyle, bellButtonStyle } = this.props;
		const { methodRequested, name } = item;

		const accessibilityLabelButton = `${this.labelBellButton}, ${name}`;

		let iconColor = isGatewayActive ? Theme.Core.brandSecondary : Theme.Core.offlineColor;

		return (
			<TouchableOpacity
				onPress={this.onBell}
				style={[containerStyle, bellButtonStyle]}
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

function mapDispatchToProps(dispatch: Function): Object {
	return {
		deviceSetState: (id: number, command: number, value?: number) =>{
			dispatch(deviceSetState(id, command, value));
		},
		requestDeviceAction: (id: number, command: number) => {
			dispatch(requestDeviceAction(id, command));
		},
	};
}

module.exports = connect(null, mapDispatchToProps)(BellDashboardTile);
