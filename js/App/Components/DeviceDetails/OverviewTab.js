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

import { View, TabBar } from '../../../BaseComponents';
import { StyleSheet, Dimensions, ScrollView } from 'react-native';
const deviceWidth = Dimensions.get('window').width;
import { defineMessages } from 'react-intl';

import getDeviceType from '../../Lib/getDeviceType';
import getLocationImageUrl from '../../Lib/getLocationImageUrl';
import {
	DeviceLocationDetail,
	ToggleDeviceDetail,
	BellDeviceDetail,
	DimmerDeviceDetail,
	NavigationalDeviceDetail,
} from './SubViews';
import i18n from '../../Translations/common';

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

	static navigationOptions = ({ navigation }: Object): Object => ({
		tabBarLabel: ({ tintColor }: Object): Object => (
			<TabBar
				icon="icon_home"
				tintColor={tintColor}
				label={messages.overviewHeader}
				accessibilityLabel={i18n.deviceOverviewTab}/>
		),
		tabBarOnPress: ({scene, jumpToIndex}: Object) => {
			navigation.navigate('Overview');
		},
	});

	getType(device: Object): string | null {
		if (!device) {
			return null;
		}

		const supportedMethods = device.supportedMethods;
		return getDeviceType(supportedMethods);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.screenProps.currentTab === 'Overview';
	}

	render(): Object {
		let { device, screenProps, gateway } = this.props;
		let deviceId = device.id;
		let deviceDetail = null;
		const locationImageUrl = getLocationImageUrl(gateway.type);
		const locationData = {
			title: this.boxTitle,
			image: locationImageUrl,
			H1: gateway.name,
			H2: gateway.type,
		};
		const isGatewayActive = gateway && gateway.online;

		if (deviceId && Number.isInteger(deviceId) && deviceId > 0) {
			const deviceType = this.getType(device);
			if (deviceType === 'TOGGLE') {
				deviceDetail = <ToggleDeviceDetail device={device} intl={screenProps.intl} isGatewayActive={isGatewayActive}/>;
			} else if (deviceType === 'DIMMER') {
				deviceDetail = <DimmerDeviceDetail device={device} intl={screenProps.intl} isGatewayActive={isGatewayActive}/>;
			} else if (deviceType === 'BELL') {
				deviceDetail = <BellDeviceDetail device={device} intl={screenProps.intl} isGatewayActive={isGatewayActive}/>;
			} else if (deviceType === 'NAVIGATIONAL') {
				deviceDetail = <NavigationalDeviceDetail device={device} intl={screenProps.intl} isGatewayActive={isGatewayActive}/>;
			} else {
				deviceDetail = <View style={{ height: 0 }} />;
			}
		}
		return (
			<ScrollView contentContainerStyle={styles.itemsContainer}>
				{deviceDetail}
				<DeviceLocationDetail {...locationData} style={{marginTop: 10}}/>
			</ScrollView>
		);
	}

}

OverviewTab.propTypes = {
	device: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
	container: {
		flex: 0,
		alignItems: 'center',
		justifyContent: 'center',
	},
	itemsContainer: {
		justifyContent: 'center',
		marginHorizontal: deviceWidth * 0.02233,
	},
});

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	return {
		device: state.devices.byId[ownProps.screenProps.device.id],
		gateway: state.gateways.byId[ownProps.screenProps.device.clientId],
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(OverviewTab);
