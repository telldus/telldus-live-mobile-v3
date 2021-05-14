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
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

import {
	View,
	NavigationHeader,
	PosterWithText,
} from '../../../BaseComponents';
import HeatControlWheelModes from './HeatControlWheelModes';
import { deviceSetStateThermostat, requestDeviceAction } from '../../Actions/Devices';

import {
	shouldUpdate,
	getSupportedModes,
	getLastUpdated,
	getThermostatValue,
	getSetPoints,
	getCurrentSetPoint,
	shouldHaveMode,
} from '../../Lib';

type Props = {
	device: Object,
	appLayout: Object,
	lastUpdated: number,
	currentTemp: string,
	gatewayTimezone: string,
	route: Object,

	navigation: Object,
	intl: Object,
	deviceSetStateThermostat: (deviceId: number, mode: string, temperature?: number, scale?: 0 | 1, changeMode?: 0 | 1, requestedState: number) => Promise<any>,
};

class ThermostatFullControl extends View<Props, null> {
props: Props;

constructor(props: Props) {
	super(props);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {

	const propsChange = shouldUpdate(this.props, nextProps, [
		'device', 'appLayout', 'lastUpdated', 'currentTemp', 'gatewayTimezone']);
	if (propsChange) {
		return true;
	}

	return false;
}

_deviceSetStateThermostat = (deviceId: number, mode: string, temp: number, scale: 0 | 1 = 0, changeMode: 1 | 0, requestedState: number) => {
	const {
		deviceSetStateThermostat: dSetState,
		route,
	} = this.props;

	const { onPressOverride } = route.params || {};
	if (onPressOverride) {
		onPressOverride({
			deviceId,
			method: 2048,
			changeMode,
			scale,
			mode,
			temp,
			stateValues: {
				[2048]: {
					mode,
					setpoint: {
						[mode]: typeof temp === 'number' ? temp.toString() : temp,
					},
				},
			},
		});
		return;
	}
	dSetState(deviceId, mode, temp, scale, changeMode, requestedState);
}

render(): Object | null {
	const {
		navigation,
		appLayout,
		device,
		lastUpdated,
		intl,
		currentTemp,
		gatewayTimezone,
		route,
	} = this.props;

	if (!device || !device.id) {
		return null;
	}

	const {
		name,
		parameter = [],
		stateValues,
		actionsQueueThermostat = {},
	} = device;

	let supportResume = false;
	parameter.map((param: Object) => {
		if (param.name && param.name === 'thermostat') {
			const { modes = [] } = param.value;
			modes.map((mode: string) => {
				if (mode.toLowerCase().trim() === 'resume') {
					supportResume = true;
				}
			});
		}
	});

	const { THERMOSTAT: { setpoint = {}, mode } } = stateValues;
	let activeMode = mode;

	let supportedModes = getSupportedModes(parameter, setpoint, intl);

	const { timeoutPlusMinus } = route.params || {};

	let currentSetPoint;
	let _shouldHaveMode = shouldHaveMode(device);
	if (!_shouldHaveMode) {
		supportedModes = getSetPoints(parameter, setpoint, intl);
		if (supportedModes) {
			currentSetPoint = getCurrentSetPoint(supportedModes, mode);
			if (currentSetPoint) {
				activeMode = currentSetPoint.mode;
			}
		}
	}

	return (
		<View
			level={3}
			style={{
				flex: 1,
			}}>
			<NavigationHeader
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}/>
			<KeyboardAvoidingView
				behavior="padding"
				style={{flex: 1}}
				contentContainerStyle={{ justifyContent: 'center'}}
				enabled
				keyboardVerticalOffset={Platform.OS === 'android' ? -500 : 0}>
				<ScrollView
					style={{flex: 1}}
					contentContainerStyle={{
						flexGrow: 1,
						alignItems: 'stretch',
					}}
					keyboardShouldPersistTaps={'always'}>
					<PosterWithText
						appLayout={appLayout}
						align={'center'}
						icon={'thermostat'}
						h2={name}
						navigation={navigation}/>
					<HeatControlWheelModes
						appLayout={appLayout}
						modes={supportedModes}
						device={device}
						activeMode={activeMode}
						lastUpdated={lastUpdated}
						currentTemp={currentTemp}
						deviceSetStateThermostat={this._deviceSetStateThermostat}
						supportResume={supportResume}
						gatewayTimezone={gatewayTimezone}
						intl={intl}
						source="ThermostatFullControl"
						timeoutPlusMinus={timeoutPlusMinus}
						shouldHaveMode={_shouldHaveMode}
						actionsQueueThermostat={actionsQueueThermostat}/>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		deviceSetStateThermostat: (deviceId: number, mode: string, temperature?: number, scale?: 0 | 1, changeMode?: 0 | 1, requestedState: number): Promise<any> =>{
			dispatch(requestDeviceAction(deviceId, 2048, false));
			return dispatch(deviceSetStateThermostat(deviceId, mode, temperature, scale, changeMode, requestedState));
		},
	};
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	const { screenProps, route } = ownProps;
	const { id = null } = route.params || {};

	const device = store.devices.byId[id];
	const { clientDeviceId, clientId } = device ? device : {};

	const { timezone: gatewayTimezone } = store.gateways.byId[clientId] || {};


	return {
		...screenProps,
		device,
		lastUpdated: getLastUpdated(store.sensors.byId, clientDeviceId, clientId),
		currentTemp: getThermostatValue(store.sensors.byId, clientDeviceId, clientId),
		gatewayTimezone,
	};
}

module.exports = (connect(mapStateToProps, mapDispatchToProps)(ThermostatFullControl): Object);
