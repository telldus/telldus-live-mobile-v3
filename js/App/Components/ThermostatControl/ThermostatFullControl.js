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
import HeatControlWheel from './HeatControlWheel';
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
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {

	const propsChange = shouldUpdate(this.props, nextProps, ['device']);
	if (propsChange) {
		return true;
	}

	return false;
}

render(): Object {
	const {
		navigation,
		appLayout,
	} = this.props;

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
				}}>
				<PosterWithText
					appLayout={appLayout}
					align={'center'}
					icon={'thermostat'}
					h2={'Thermostat'}/>
				<HeatControlWheel appLayout={appLayout}/>
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
