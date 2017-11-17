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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { FormattedMessage, View } from 'BaseComponents';
import { StyleSheet, Dimensions } from 'react-native';
const deviceWidth = Dimensions.get('window').width;
import { defineMessages } from 'react-intl';

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icon_home from './../../../TabViews/img/selection.json';
const Icon = createIconSetFromIcoMoon(icon_home);

import getDeviceType from '../../../../Lib/getDeviceType';
import getLocationImageUrl from '../../../../Lib/getLocationImageUrl';
import {
	DeviceLocationDetail,
	ToggleDeviceDetail,
	BellDeviceDetail,
	DimmerDeviceDetail,
	NavigationalDeviceDetail,
} from 'DeviceDetailsSubView';

const messages = defineMessages({
	overviewHeader: {
		id: 'deviceSettings.overviewHeader',
		defaultMessage: 'Overview',
	},
	location: {
		id: 'deviceSettings.location',
		defaultMessage: 'Location',
		description: 'Header for which location a device belongs to',
	},
});

type Props = {
	device: Object,
	devices: Object,
	gateway: Object,
	screenProps: Object,
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

		this.boxTitle = `${props.screenProps.intl.formatMessage(messages.location)}:`;
	}

	static navigationOptions = ({ navigation }) => ({
		tabBarLabel: ({ tintColor }) => (<FormattedMessage {...messages.overviewHeader} style={{color: tintColor}}/>),
		tabBarIcon: ({ tintColor }) => (
			<Icon name="icon_home" size={24} color={tintColor}/>
		),
		tabBarOnPress: (scene: Object, jumpToIndex: Function) => {
			jumpToIndex(scene.index);
		},
	});

	getType(deviceId) {
		const filteredItem = this.props.devices.byId[deviceId];
		if (!filteredItem) {
			return null;
		}

		const supportedMethods = filteredItem.supportedMethods;
		return getDeviceType(supportedMethods);
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.screenProps.currentTab !== 'Overview') {
			return false;
		}
		return true;
	}

	render() {
		let deviceId = this.props.device.id;
		let deviceDetail = null;
		let device = this.props.device;
		const locationImageUrl = getLocationImageUrl(this.props.gateway.type);
		const locationData = {
			title: this.boxTitle,
			image: locationImageUrl,
			H1: this.props.gateway.name,
			H2: this.props.gateway.type,
		};
		if (deviceId && Number.isInteger(deviceId) && deviceId > 0) {
			const deviceType = this.getType(deviceId);
			if (deviceType === 'TOGGLE') {
				deviceDetail = <ToggleDeviceDetail device={device} />;
			} else if (deviceType === 'DIMMER') {
				deviceDetail = <DimmerDeviceDetail device={device} />;
			} else if (deviceType === 'BELL') {
				deviceDetail = <BellDeviceDetail device={device} />;
			} else if (deviceType === 'NAVIGATIONAL') {
				deviceDetail = <NavigationalDeviceDetail device={device} />;
			} else {
				deviceDetail = <View style={{ height: 0 }} />;
			}
		}
		return (
			<View style={styles.container}>
				<View style={styles.itemsContainer}>
					{deviceDetail}
					<DeviceLocationDetail {...locationData} style={{marginTop: 10}}/>
				</View>
			</View>
		);
	}

}

OverviewTab.propTypes = {
	device: PropTypes.object.isRequired,
	devices: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
	container: {
		flex: 0,
		alignItems: 'center',
		justifyContent: 'center',
	},
	itemsContainer: {
		width: (deviceWidth - 20),
		justifyContent: 'center',
	},
});

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

function mapStateToProps(state, ownProps) {
	return {
		device: state.devices.byId[ownProps.screenProps.device.id],
		devices: state.devices,
		gateway: state.gateways.byId[ownProps.screenProps.device.clientId],
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(OverviewTab);
