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
import { ScrollView } from 'react-native';
import { connect } from 'react-redux';
const isEqual = require('react-fast-compare');

import { View, TabBar, LocationDetails } from '../../../../BaseComponents';

import {
	getDeviceManufacturerInfo,
	deviceZWaveInfo,
	requestDeviceAction,
	deviceSetStateThermostat,
	getDeviceInfoCommon,
} from '../../../Actions/Devices';
import { requestNodeInfo } from '../../../Actions/Websockets';
import getDeviceType from '../../../Lib/getDeviceType';
import getLocationImageUrl from '../../../Lib/getLocationImageUrl';
import { getLastUpdated, getThermostatValue } from '../../../Lib/SensorUtils';
import {
	DeviceActionDetails,
} from './SubViews';
import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	device: Object,
	gatewayType: string,
	gatewayName: string,
	isGatewayActive: boolean,
	zwaveInfo: Object,
	lastUpdated?: number,
	currentTemp?: string,
	gatewayTimezone: string,

	screenProps: Object,
	dispatch: Function,
	deviceSetStateThermostat: (deviceId: number, mode: string, temperature?: number, scale?: 0 | 1, changeMode?: 0 | 1, requestedState: number) => Promise<any>,
};

class OverviewTab extends View<Props, null> {
	props: Props;

	static navigationOptions = ({ navigation }: Object): Object => ({
		tabBarLabel: ({ tintColor }: Object): Object => (
			<TabBar
				icon="home"
				tintColor={tintColor}
				label={i18n.overviewHeader}
				accessibilityLabel={i18n.deviceOverviewTab}/>
		),
		tabBarOnPress: ({scene, jumpToIndex}: Object) => {
			navigation.navigate({
				routeName: 'Overview',
				key: 'Overview',
			});
		},
	});

	constructor(props: Props) {
		super(props);

		this.boxTitle = `${props.screenProps.intl.formatMessage(i18n.location)}:`;
	}

	componentDidMount() {
		const { dispatch, device } = this.props;
		const { nodeInfo, id, clientId, clientDeviceId } = device;
		dispatch(getDeviceInfoCommon(id));
		if (nodeInfo) {
			const {
				manufacturerId,
				productId,
				productTypeId,
			} = nodeInfo;
			dispatch(getDeviceManufacturerInfo(manufacturerId, productTypeId, productId))
				.then((res: Object) => {
					if (res && res.Name) {
						const { Image, Name, Brand } = res;
						const payload = {
							Image,
							Name,
							Brand,
							deviceId: id,
						};
						dispatch(deviceZWaveInfo(payload));
					}
				});
		}
		dispatch(requestNodeInfo(clientId, clientDeviceId));
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const {
			screenProps: screenPropsN,
			gatewayName: gatewayNameN,
			isGatewayActive: isGatewayActiveN,
			device: deviceN,
			lastUpdated: lastUpdatedN,
			currentTemp: currentTempN,
		} = nextProps;
		const { currentScreen, appLayout } = screenPropsN;
		if (currentScreen === 'Overview') {

			const { screenProps, gatewayName, isGatewayActive, device, lastUpdated, currentTemp } = this.props;
			if ((screenProps.appLayout.width !== appLayout.width) ||
			(gatewayName !== gatewayNameN) ||
			(isGatewayActive !== isGatewayActiveN) ||
			(lastUpdated !== lastUpdatedN) ||
			(currentTemp !== currentTempN)) {
				return true;
			}

			if (!isEqual(deviceN, device)) {
				return true;
			}

			if (currentScreen !== screenProps.currentScreen) {
				return true;
			}

			return false;
		}

		return false;
	}

	getType(device: Object): string | null {
		if (!device) {
			return null;
		}

		const {supportedMethods = {}} = device;
		return getDeviceType(supportedMethods);
	}

	render(): Object | null {
		const {
			device,
			screenProps,
			gatewayName,
			gatewayType,
			isGatewayActive,
			lastUpdated,
			currentTemp,
			gatewayTimezone,
		} = this.props;
		const { appLayout, intl } = screenProps;

		if (!device || !device.id) {
			return null;
		}

		const locationImageUrl = getLocationImageUrl(gatewayType);
		const locationData = {
			title: this.boxTitle,
			image: locationImageUrl,
			H1: gatewayName,
			H2: gatewayType,
		};

		const { zwaveInfo = {} } = device;
		const {
			Image,
			Name,
			Brand,
		} = zwaveInfo;
		const locationDataZWave = {
			image: Image,
			H1: Name,
			H2: Brand,
		};
		const styles = this.getStyles(appLayout);

		return (
			<ScrollView
				style={{
					flex: 1,
					backgroundColor: Theme.Core.appBackground,
				}}
				contentContainerStyle={styles.itemsContainer}>
				<DeviceActionDetails
					device={device}
					intl={intl}
					appLayout={appLayout}
					isGatewayActive={isGatewayActive}
					containerStyle={styles.actionDetails}
					lastUpdated={lastUpdated}
					deviceSetStateThermostat={this.props.deviceSetStateThermostat}
					currentTemp={currentTemp}
					gatewayTimezone={gatewayTimezone}/>
				{Name && <LocationDetails {...locationDataZWave} isStatic={false} style={styles.LocationDetail}/>}
				<LocationDetails {...locationData} isStatic={true} style={[styles.LocationDetail, {
					marginBottom: styles.padding * 2,
				}]}/>
			</ScrollView>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const padding = deviceWidth * Theme.Core.paddingFactor;

		return {
			padding,
			itemsContainer: {
				flexGrow: 1,
				marginTop: padding,
			},
			LocationDetail: {
				flex: 0,
				marginTop: (padding / 2),
				marginHorizontal: padding,
			},
			actionDetails: {
				flex: 0,
				marginTop: 0,
				marginHorizontal: padding,
			},
		};
	}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
		deviceSetStateThermostat: (deviceId: number, mode: string, temperature?: number, scale?: 0 | 1, changeMode?: 0 | 1, requestedState: number) =>{
			dispatch(requestDeviceAction(deviceId, 2048, false));
			dispatch(deviceSetStateThermostat(deviceId, mode, temperature, scale, changeMode, requestedState));
		},
	};
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	const id = ownProps.navigation.getParam('id', null);
	const device = state.devices.byId[id];
	const { clientId, clientDeviceId } = device ? device : {};

	const gateway = state.gateways.byId[clientId];
	const {
		name: gatewayName,
		type: gatewayType,
		online: isGatewayActive,
		timezone: gatewayTimezone,
	} = gateway ? gateway : {};

	return {
		device,
		gatewayType,
		gatewayName,
		isGatewayActive,
		lastUpdated: getLastUpdated(state.sensors.byId, clientDeviceId, clientId),
		currentTemp: getThermostatValue(state.sensors.byId, clientDeviceId, clientId),
		gatewayTimezone,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(OverviewTab);
