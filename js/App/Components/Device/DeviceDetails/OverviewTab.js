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
import isEmpty from 'lodash/isEmpty';
import { utils } from 'live-shared-data';

const { images: {DEVICES} } = utils;

import {
	SupportedCommandClasses,
	BatteryFunctions,
	BasicSettings,
	TelldusInfo,
	NodeRelations,
} from '../ZWave';
import {
	ThemedScrollView,
	View,
	LocationDetails,
} from '../../../../BaseComponents';

import {
	getDeviceManufacturerInfo,
	deviceZWaveInfo,
	requestDeviceAction,
	deviceSetStateThermostat,
	getDeviceInfoCommon,
} from '../../../Actions/Devices';
import {
	requestNodeInfo,
	sendSocketMessage,
} from '../../../Actions/Websockets';
import getDeviceType from '../../../Lib/getDeviceType';
import getLocationImageUrl from '../../../Lib/getLocationImageUrl';
import { getLastUpdated, getThermostatValue } from '../../../Lib/SensorUtils';
import {
	is433MHzTransport,
	getDeviceVendorInfo433MHz,
	shouldUpdate,
	prepare433ModelName,
} from '../../../Lib';
import ZWaveFunctions from '../../../Lib/ZWaveFunctions';

import {
	DeviceActionDetails,
	DeviceManualUI,
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
	locale: string,
	currentScreen: string,
	nodeList: Object,

	screenProps: Object,
	dispatch: Function,
	deviceSetStateThermostat: (deviceId: number, mode: string, temperature?: number, scale?: 0 | 1, changeMode?: 0 | 1, requestedState: number) => Promise<any>,
};

class OverviewTab extends View<Props, null> {
	props: Props;

	constructor(props: Props) {
		super(props);

		this.boxTitle = `${props.screenProps.intl.formatMessage(i18n.location)}:`;
		this.getRoutingInfoTimeout = null;
	}

	componentDidMount() {
		const {
			dispatch,
			device,
		} = this.props;
		if (!device) {
			return;
		}
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
						const {
							Image,
							Name,
							Brand,
							ManualUrl,
							ConfigurationParameters,
							AssociationGroups,
						} = res;
						const payload = {
							Image,
							Name,
							Brand,
							deviceId: id,
							ManualUrl,
							ConfigurationParameters,
							AssociationGroups,
						};
						dispatch(deviceZWaveInfo(payload));
					}
				});
			dispatch(sendSocketMessage(clientId, 'client', 'forward', {
				'module': 'zwave',
				'action': 'getRoutingInfo',
				'nodeId': parseInt(nodeInfo.nodeId, 10),
			}));
		}
		dispatch(requestNodeInfo(clientId, clientDeviceId));
		dispatch(sendSocketMessage(clientId, 'client', 'forward', {
			'module': 'zwave',
			'action': 'nodeList',
		}));
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const {
			currentScreen,
		} = nextProps;
		if (currentScreen === 'Overview') {
			return shouldUpdate(this.props, nextProps, [
				'screenProps',
				'gatewayName',
				'isGatewayActive',
				'device',
				'lastUpdated',
				'currentTemp',
				'nodeList',
			]);
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

	getDeviceInfo = (device: Object): Object => {
		const { protocol, model, transport, zwaveInfo = {} } = device;

		if (is433MHzTransport(transport)) {
			let info = getDeviceVendorInfo433MHz(protocol, model);
			if (!info || isEmpty(info)) {
				return {};
			}
			const {
				deviceInfo: {
					image,
					lang,
					modelName,
					manual,
				},
				vendorInfo: {
					name,
				},
			} = info;
			return {
				image: DEVICES[`d_${image.replace(/-/g, '_')}`],
				H1: prepare433ModelName(this.props.locale, lang, modelName),
				H2: name,
				fromJS: true,
				manual,
				is433: true,
			};
		}
		const {
			Image,
			Name,
			Brand,
			ManualUrl,
		} = zwaveInfo;
		return {
			image: Image,
			H1: Name,
			H2: Brand,
			fromJS: false,
			manual: ManualUrl,
			is433: false,
		};
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
			nodeList = {},
		} = this.props;
		const { appLayout, intl } = screenProps;

		if (!device || !device.id) {
			return null;
		}

		const {
			nodeInfo = {},
			clientId,
			clientDeviceId,
		} = device;

		const locationImageUrl = getLocationImageUrl(gatewayType);
		const locationData = {
			title: this.boxTitle,
			image: locationImageUrl,
			H1: gatewayName,
			H2: gatewayType,
		};

		const deviceInfo = this.getDeviceInfo(device);
		const {
			manual,
			is433,
		} = deviceInfo;

		const styles = this.getStyles(appLayout);

		const supportsWakeup = nodeInfo.cmdClasses ? nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_WAKEUP] : false;
		const showBatteryFunctions = nodeInfo.cmdClasses ? (nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_BATTERY] ||
		supportsWakeup) : false;

		let nodesRelation;
		if (nodeInfo.nodeId !== undefined) {
			nodesRelation = nodeList[nodeInfo.nodeId];
		}

		return (
			<ThemedScrollView
				level={3}
				style={{
					flex: 1,
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
				{(deviceInfo && deviceInfo.H1) && <LocationDetails
					{...deviceInfo}
					style={styles.LocationDetail}/>}
				<LocationDetails {...locationData}
					fromJS={false}
					style={[styles.LocationDetail, {
						marginBottom: styles.padding * 2,
					}]}/>
				{!!nodeInfo.cmdClasses && (
					<BasicSettings
						id={device.id}
						clientDeviceId={device.clientDeviceId}
						clientId={device.clientId}/>
				)}
				{!!nodeInfo.cmdClasses && (
					<SupportedCommandClasses
						id={device.id}
						clientDeviceId={device.clientDeviceId}
						clientId={device.clientId}/>
				)}
				{!!showBatteryFunctions && (
					<BatteryFunctions
						id={device.id}
						clientId={clientId}
						gatewayTimezone={gatewayTimezone}/>
				)}
				{!!nodeInfo.cmdClasses && manual && !is433 && (
					<TelldusInfo
						manualUrl={manual}/>
				)}
				{!!manual && is433 && (
					<DeviceManualUI
						manualUrl={deviceInfo.manual}
						fileName={deviceInfo.manual}
					/>
				)}
				{!!nodesRelation && (
					<NodeRelations
						id={device.id}
						clientId={clientId}
						gatewayTimezone={gatewayTimezone}
						clientDeviceId={clientDeviceId}
						nodesRelation={nodesRelation}
						nodeId={nodeInfo.nodeId}
						nodeList={nodeList}/>
				)}
			</ThemedScrollView>
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
				paddingBottom: padding * 2,
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
	const { route } = ownProps;
	const { id } = route.params || {};
	const device = state.devices.byId[id] || {};
	const { clientId, clientDeviceId } = device;

	const gateway = state.gateways.byId[clientId];
	const {
		name: gatewayName,
		type: gatewayType,
		online: isGatewayActive,
		timezone: gatewayTimezone,
		nodeList,
	} = gateway ? gateway : {};

	const { defaultSettings } = state.app;
	const { language = {} } = defaultSettings || {};
	const locale = language.code;

	const {
		screen: currentScreen,
	} = state.navigation;

	return {
		device,
		gatewayType,
		gatewayName,
		isGatewayActive,
		lastUpdated: getLastUpdated(state.sensors.byId, clientDeviceId, clientId),
		currentTemp: getThermostatValue(state.sensors.byId, clientDeviceId, clientId),
		gatewayTimezone,
		locale,
		currentScreen,
		nodeList,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(OverviewTab);
