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
import { ScrollView } from 'react-native';

import {
	View,
	NavigationHeader,
	PosterWithText,
} from '../../../BaseComponents';
import HeatControlWheelModes from './HeatControlWheelModes';
import { deviceSetState } from '../../Actions/Devices';

import { shouldUpdate } from '../../Lib';
import Theme from '../../Theme';

type Props = {
	device: Object,
	appLayout: Object,

	navigation: Object,
	intl: Object,
	deviceSetState: (id: number, command: number, value?: number) => void,
};

class ThermostatFullControl extends View<Props, null> {
props: Props;

constructor(props: Props) {
	super(props);

	this.modes = [
		{
			label: 'Heat',
			edit: true,
			icon: 'fire',
			value: 23.3,
			scale: 'Temperature',
			unit: '°C',
			startColor: '#FFB741',
			endColor: '#E26901',
			maxVal: 50,
			minVal: 10,
			type: 'heat',
		},
		{
			label: 'Cool',
			edit: true,
			icon: 'fire',
			value: 21.2,
			scale: 'Temperature',
			unit: '°C',
			startColor: '#23C4FA',
			endColor: '#015095',
			maxVal: 30,
			minVal: 0,
			type: 'cool',
		},
		{
			label: 'Heat-cool',
			edit: true,
			icon: 'fire',
			value: 23.3,
			scale: 'Temperature',
			unit: '°C',
			startColor: '#004D92',
			endColor: '#e26901',
			maxVal: 50,
			minVal: 0,
			type: 'heat-cool',
		},
		{
			label: 'Off',
			edit: false,
			icon: 'fire',
			value: null,
			scale: null,
			unit: null,
			startColor: '#cccccc',
			endColor: '#999999',
			maxVal: 50,
			minVal: 0,
			type: 'off',
		},
	];
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {

	const propsChange = shouldUpdate(this.props, nextProps, ['device']);
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
	} = this.props;

	if (!device || !device.id) {
		return null;
	}

	const {
		name,
	} = device;

	return (
		<View style={{
			flex: 1,
			backgroundColor: Theme.Core.appBackground,
		}}>
			<NavigationHeader
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}/>
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
					modes={this.modes}/>
			</ScrollView>
		</View>
	);
}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		deviceSetState: (id: number, command: number, value?: number) =>{
			dispatch(deviceSetState(id, command, value));
		},
	};
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	const { screenProps, navigation } = ownProps;
	const id = navigation.getParam('id', null);
	const device = store.devices.byId[id];

	return {
		...screenProps,
		device,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ThermostatFullControl);
