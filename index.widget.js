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

import React, { Component } from 'react';
import {
	AppRegistry,
	Platform,
	Text,
	View,
	TouchableOpacity,
	NativeModules,
} from 'react-native';
import SInfo from 'react-native-sensitive-info';

import { DevMenu } from './js/WidgetiOS';

type State = {
	email: string,
};
class DeviceWidget extends Component<null, State> {
	state: State;
	constructor() {
		super();
		this.state = {
			email: 'Not logged in',
		};

		SInfo.getItem('widgetData', {
			keychainService: 'TelldusKeychain',
		}).then((values: any) => {
			if (values) {
				const { email } = JSON.parse(values);
				this.setState({
					email,
				});
			}
		});

		// Calculate max list length and set here, to be able to show all items when expanded.
		NativeModules.DisplayMode.setExpandable(true, 500);
	}

	openApp = () => {
		NativeModules.DisplayMode.openURLString('telldus://');
	}

	render(): Object {
		const { txtNotLogin, btnContainer } = styles;
		const { email } = this.state;
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<Text style={txtNotLogin}>
					{email}
				</Text>
				<TouchableOpacity
					 style={btnContainer}
					 onPress={this.openApp}
				>
					<Text style={txtNotLogin}>LOG IN</Text>
				</TouchableOpacity>
				{(__DEV__ && <DevMenu/>)}
			</View>
		);
	}
}
if (Platform.OS === 'ios') {
	AppRegistry.registerComponent('Widget', (): Object => DeviceWidget);
}

const styles = {
	txtNotLogin: {
		color: '#FFF',
		fontSize: 18,
		fontWeight: '700',
		marginTop: 5,
	},
	btnContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 20,
		width: 200,
		height: 50,
		borderRadius: 25,
		backgroundColor: '#F05201',
	},
};
