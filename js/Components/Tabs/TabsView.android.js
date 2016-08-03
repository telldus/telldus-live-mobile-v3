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
import DrawerLayoutAndroid from 'DrawerLayoutAndroid';
import Navigator from 'Navigator';
import Theme from 'Theme';

import DashboardTab from './DashboardTab';
import DevicesTab from './DevicesTab';
import GatewaysTab from './GatewaysTab';
import SchedulerTab from './SchedulerTab';
import SensorsTab from './SensorsTab';

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
		this.refs.drawer.closeDrawer();
		if (this.props.tab !== tab) {
			this.props.onTabSelect(tab);
		}
	}

	navigationView() {
		return (
			<View style={{flex: 1, backgroundColor: '#fff', paddingTop: 120 }}>
				<List>
					<ListItem>
						<Button
							name = "sign-out"
							backgroundColor = { this.getTheme().btnPrimaryBg }
							style = {{ padding: 6, minWidth: 100 }}
							onPress={ this.onTabSelect.bind(this, 'dashboardTab') }
						>Dashboard</Button>
					</ListItem>
					<ListItem>
						<Button
							name = "sign-out"
							backgroundColor = { this.getTheme().btnPrimaryBg }
							style = {{ padding: 6, minWidth: 100 }}
							onPress={ this.onTabSelect.bind(this, 'devicesTab') }
						>Devices</Button>
					</ListItem>
					<ListItem>
						<Button
							name = "sign-out"
							backgroundColor = { this.getTheme().btnPrimaryBg }
							style = {{ padding: 6, minWidth: 100 }}
							onPress={ this.onTabSelect.bind(this, 'sensorsTab') }
						>Sensors</Button>
					</ListItem>
					<ListItem>
						<Button
							name = "sign-out"
							backgroundColor = { this.getTheme().btnPrimaryBg }
							style = {{ padding: 6, minWidth: 100 }}
							onPress={ this.onTabSelect.bind(this, 'schedulerTab') }
						>Scheduler</Button>
					</ListItem>
					<ListItem>
						<Button
							name = "sign-out"
							backgroundColor = { this.getTheme().btnPrimaryBg }
							style = {{ padding: 6, minWidth: 100 }}
							onPress={ this.onTabSelect.bind(this, 'gatewaysTab') }
						>Gateways</Button>
					</ListItem>
				</List>
			</View>
		)
	}

	renderContent() {
		switch (this.props.tab) {
			case 'dashboardTab':
				return <DashboardTab />
			case 'devicesTab':
				return <DevicesTab />
			case 'sensorsTab':
				return <SensorsTab />
			case 'schedulerTab':
				return <SchedulerTab />
			case 'gatewaysTab':
				return <GatewaysTab />
			}
		return <DashboardTab />
	}

	render() {
		return (
			<DrawerLayoutAndroid
				ref="drawer"
				drawerWidth={300}
				drawerPosition={DrawerLayoutAndroid.positions.Left}
				renderNavigationView={() => this.navigationView()}
			>
				<View style={{flex:1}}>
					<ToolbarAndroid
						style = {{ height: 56, backgroundColor: Theme.Core.brandPrimary }}
						titleColor = { Theme.Core.inverseTextColor }
						navIcon = { require('./img/dashboard-active-icon.png') }
						title = "Telldus Live!"
						actions = {[{ title: 'Settings', icon: require('image!ic_launcher'), show: 'never'}]}
						onActionSelected = { this.onActionSelected }
					/>
					<View key={this.props.tab}>
						{this.renderContent()}
					</View>
				</View>
			</DrawerLayoutAndroid>
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
