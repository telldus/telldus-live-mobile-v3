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
import { connect } from 'react-redux';

import { View, Icon } from 'BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';
import DashboardShadowTile from './DashboardShadowTile';
import { deviceSetState, requestDeviceAction } from 'Actions_Devices';
import ButtonLoadingIndicator from './ButtonLoadingIndicator';
import i18n from '../../../Translations/common';
import { getLabelDevice } from 'Accessibility';

type Props = {
	deviceSetState: (id: number, command: number, value?: number) => void,
	requestDeviceAction: (id: number, command: number) => void,
	item: Object,
	tileWidth: number,
	style: Object,
	command: number,
	intl: Object,
};

class BellDashboardTile extends View {
	props: Props;

	onBell: () => void;

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
		const { item, tileWidth, intl } = this.props;
		let {methodRequested} = this.props.item;

		const accessibilityLabelButton = this.labelBellButton;
		const accessibilityLabel = getLabelDevice(intl.formatMessage, item);

		return (
			<DashboardShadowTile
				item={item}
				isEnabled={true}
				name={item.name}
				type={'device'}
				tileWidth={tileWidth}
				accessibilityLabel={accessibilityLabel}
				style={[
					this.props.style, {
						width: tileWidth,
						height: tileWidth,
					}]
				}>
				<TouchableOpacity
					onPress={this.onBell}
					style={styles.container}
					accessibilityLabel={accessibilityLabelButton}>
					<View style={styles.body}>
					  <Icon name="bell" size={44} color="orange" />
					</View>
				</TouchableOpacity>
				{
					methodRequested === 'BELL' ?
						<ButtonLoadingIndicator style={styles.dot} />
						:
						null
				}
			</DashboardShadowTile>
		);
	}
}

BellDashboardTile.defaultProps = {
	command: 4,
};

const styles = StyleSheet.create({
	container: {
		flex: 30,
		justifyContent: 'center',
	},
	body: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
		borderTopLeftRadius: 7,
		borderTopRightRadius: 7,
	},
	dot: {
		position: 'absolute',
		top: 3,
		left: 3,
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

module.exports = connect(null, mapDispatchToProps)(BellDashboardTile);
