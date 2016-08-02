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
 *
 * @providesModule TabsView
 */

'use strict';

import React from 'react';
import { connect } from 'react-redux';

import { Container, Content, Button, List, ListItem, Text, View } from 'BaseComponents';
import {TabLayoutAndroid, TabAndroid} from "react-native-android-kit";
import Navigator from 'Navigator';
import DevicesTab from './DevicesTab';
import Theme from 'Theme';
import { switchTab, logoutFromTelldus } from 'Actions';
import { StyleSheet, ToolbarAndroid } from 'react-native';
import type { Tab } from '../reducers/navigation';

class TabsView extends View {

	props: {
		tab: Tab;
		onTabSelect: (tab: Tab) => void;
		navigator: Navigator;
	};

	constructor(props) {
		super(props);
	}

	onTabSelect(tab: Tab) {
		if (this.props.tab !== tab) {
			this.props.onTabSelect(tab);
		}
	}

	render() {
		return (
			<View style={{flex:1}}>
				<ToolbarAndroid
					style = {{ height: 56, backgroundColor: Theme.Core.brandPrimary }}
					titleColor = { Theme.Core.inverseTextColor }
					navIcon = { require('./img/dashboard-active-icon.png') }
					title = "Telldus Live!"
					actions = {[{ title: 'Settings', icon: require('image!ic_launcher'), show: 'never'}]}
					onActionSelected = { this.onActionSelected }
				/>
				<TabLayoutAndroid
					style = {{ height: 48 }}
					scrollable = {true}
					backgroundColor = { Theme.Core.brandPrimary }
					indicatorTabColor = { Theme.Core.inverseTextColor }
				>
					<TabAndroid text = "Dashboard" textColor = { Theme.Core.fadedInverseTextColor } selectedTextColor = { Theme.Core.inverseTextColor }>
						<Text>
							Dashboard
						</Text>
					</TabAndroid>
					<TabAndroid text = "Devices" textColor = { Theme.Core.fadedInverseTextColor } selectedTextColor = { Theme.Core.inverseTextColor }>
						<DevicesTab />
					</TabAndroid>
					<TabAndroid text = "Sensors" textColor = { Theme.Core.fadedInverseTextColor } selectedTextColor = { Theme.Core.inverseTextColor }>
						<Text>
							Sensors
						</Text>
					</TabAndroid>
					<TabAndroid text = "Scheduler" textColor = { Theme.Core.fadedInverseTextColor } selectedTextColor = { Theme.Core.inverseTextColor }>
						<Text>
							Scheduler
						</Text>
					</TabAndroid>
					<TabAndroid text = "Locations" textColor = { Theme.Core.fadedInverseTextColor } selectedTextColor = { Theme.Core.inverseTextColor }>
						<Text>
							Locations
						</Text>
					</TabAndroid>
				</TabLayoutAndroid>
			</View>
		);
	}

	onActionSelected (position) {
		if (position === 0) { // index of 'Settings'
			console.log("Settings pressed");
		}
	}

}

function select(store) {
	return {
		tab: store.navigation.tab,
		devices: store.devices.devices,
		gateways: store.gateways.gateways,
		sensors: store.sensors.sensors,
		userProfile: store.user.userProfile || {firstname: '', lastname: '', email: ""}
	};
}

function actions(dispatch) {
	return {
		onTabSelect: (tab) => dispatch(switchTab(tab)),
		dispatch
	};
}

module.exports = connect(select, actions)(TabsView);
