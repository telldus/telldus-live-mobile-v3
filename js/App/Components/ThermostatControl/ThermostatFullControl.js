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
import { ScrollView, KeyboardAvoidingView } from 'react-native';

import {
	View,
	NavigationHeader,
	PosterWithText,
} from '../../../BaseComponents';
import HeatControlWheelModes from './HeatControlWheelModes';
import { deviceSetStateThermostat, requestDeviceAction } from '../../Actions/Devices';

import {
	shouldUpdate,
	getKnownModes,
	getLastUpdated,
} from '../../Lib';
import Theme from '../../Theme';

type Props = {
	device: Object,
	appLayout: Object,
	lastUpdated: number,

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

	const propsChange = shouldUpdate(this.props, nextProps, ['device', 'appLayout', 'lastUpdated']);
	if (propsChange) {
		return true;
	}

	return false;
}

render(): Object | null {
	const {
		navigation,
		appLayout,
		device,
		lastUpdated,
		intl,
	} = this.props;

	if (!device || !device.id) {
		return null;
	}

	const {
		name,
		parameter,
		stateValues,
	} = device;

	const { THERMOSTAT: { setpoint = {} } } = stateValues;

	let modes = {};
	parameter.map((param: Object) => {
		if (param.name && param.name === 'thermostat') {
			const { modes: MODES, setpoints = {} } = param.value;
			if (!MODES && Object.keys(setpoints).length > 0) {
				Object.keys(setpoints).map((key: string) => {
					const minMax = setpoints[key];
					if (minMax) {
						modes[key] = {
							...minMax,
						};
					} else {
						modes[key] = {};
					}
				});
			} else {
				MODES.map((mode: string) => {
					const minMax = setpoints[mode];
					if (minMax) {
						modes[mode] = {
							...minMax,
						};
					} else {
						modes[mode] = {};
					}
				});
			}
		}
	});

	let supportedModes = [];
	getKnownModes(intl.formatMessage).map((modeInfo: Object) => {
		const { mode } = modeInfo;
		if (modes[mode]) {
			modeInfo = {
				...modeInfo,
				value: setpoint[mode],
				minVal: modes[mode].min,
				maxVal: modes[mode].max,
			};
			supportedModes.push(modeInfo);
		}
	});

	return (
		<View style={{
			flex: 1,
			backgroundColor: Theme.Core.appBackground,
		}}>
			<NavigationHeader
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}/>
			<KeyboardAvoidingView
				behavior="padding"
				style={{flex: 1}}
				contentContainerStyle={{ justifyContent: 'center'}}
				enabled>
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
						h2={name}/>
					<HeatControlWheelModes
						appLayout={appLayout}
						modes={supportedModes}
						device={device}
						lastUpdated={lastUpdated}
						deviceSetStateThermostat={this.props.deviceSetStateThermostat}/>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		deviceSetStateThermostat: (deviceId: number, mode: string, temperature?: number, scale?: 0 | 1, changeMode?: 0 | 1, requestedState: number) =>{
			dispatch(requestDeviceAction(deviceId, 2048, false));
			dispatch(deviceSetStateThermostat(deviceId, mode, temperature, scale, changeMode, requestedState));
		},
	};
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	const { screenProps, navigation } = ownProps;
	const id = navigation.getParam('id', null);

	const device = store.devices.byId[id];
	const { clientDeviceId, clientId } = device ? device : {};


	return {
		...screenProps,
		device,
		lastUpdated: getLastUpdated(store.sensors.byId, clientDeviceId, clientId),
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ThermostatFullControl);
