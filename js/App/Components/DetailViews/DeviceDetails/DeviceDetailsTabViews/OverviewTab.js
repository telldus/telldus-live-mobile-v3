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

import { View } from 'BaseComponents';
import { StyleSheet } from 'react-native';

import getDeviceType from '../../../../Lib/getDeviceType';
import getLocationImageUrl from '../../../../Lib/getLocationImageUrl';
import {
	ToggleDeviceDetailModal,
	BellDeviceDetailModal,
	DimmerDeviceDetailModal,
	NavigationalDeviceDetailModal,
} from 'DetailViews';

type Props = {
  device: Object,
  devices: Object,
  gateway: Object,
};

type State = {
};

class OverviewTab extends View {
	props: Props;
	state: State;
	constructor(props: Props) {
		super(props);
		this.state = {
		};
	}

	getType(deviceId) {
		const filteredItem = this.props.devices.byId[deviceId];
		if (!filteredItem) {
			return null;
		}

		const supportedMethods = filteredItem.supportedMethods;
		return getDeviceType(supportedMethods);
	}

	render() {
		let deviceId = this.props.device.id;
		let deviceDetail = null;
		let device = this.props.device;
		if (deviceId && Number.isInteger(deviceId) && deviceId > 0) {
			const deviceType = this.getType(deviceId);
			const locationImageUrl = getLocationImageUrl(this.props.gateway.type);
			const locationData = { locationImageUrl, locationType: this.props.gateway.type, locationName: this.props.gateway.name };
			if (deviceType === 'TOGGLE') {
				deviceDetail = <ToggleDeviceDetailModal device={device} locationData={locationData} />;
			} else if (deviceType === 'DIMMER') {
				deviceDetail = <DimmerDeviceDetailModal device={device} locationData={locationData} />;
			} else if (deviceType === 'BELL') {
				deviceDetail = <BellDeviceDetailModal device={device} locationData={locationData} />;
			} else if (deviceType === 'NAVIGATIONAL') {
				deviceDetail = <NavigationalDeviceDetailModal device={device} locationData={locationData} />;
			} else {
				deviceDetail = <View style={{ height: 0 }}/>;
			}
		}
		return (
			<View style={styles.container}>
				{deviceDetail}
			</View>
		);
	}

}

OverviewTab.propTypes = {
	device: React.PropTypes.object.isRequired,
	devices: React.PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
	container: {
		flex: 0,
	},
});

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

function mapStateToProps(state, ownProps) {
	return {
		device: ownProps.screenProps.device,
		devices: ownProps.screenProps.devices,
		gateway: state.gateways.byId[ownProps.screenProps.device.clientId],
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(OverviewTab);
