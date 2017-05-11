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

import { Button, Icon, Text, View, Image } from 'BaseComponents';
import DrawerLayoutAndroid from 'DrawerLayoutAndroid';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import Theme from 'Theme';

import DashboardTab from './DashboardTab';
import DevicesTab from './DevicesTab';
import GatewaysTab from './GatewaysTab';
import SchedulerTab from './SchedulerTab';
import SensorsTab from './SensorsTab';

import { switchTab, toggleEditMode, logoutFromTelldus } from 'Actions';

class TabsView extends View {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		Icon.getImageSource('star', 22, 'white').then((source) => this.setState({ starIcon: source }));
	}

	onTabSelect(tab) {
		this.refs.drawer.closeDrawer();
		if (this.props.tab !== tab) {
			this.props.onTabSelect(tab);
		}
	}

	navigationView() {
		return (
			<View style = {{ flex: 1, backgroundColor: this.getTheme().btnSecondaryBg }}>
				<View style = {{ height: 60, marginTop: ExtraDimensions.get('STATUS_BAR_HEIGHT'), marginBottom: ExtraDimensions.get('STATUS_BAR_HEIGHT'), padding: 5, backgroundColor: this.getTheme().btnSecondaryBg, flexDirection: 'row' }}>
					<Image style={{ width: 50, height: 50 }}
						source={require('./img/telldus.png')}
						resizeMode={'contain'} />
					<Text style={{ flex: 1, color: '#e26901', fontSize: 24, textAlignVertical: 'bottom', marginLeft: 20 }}>
						{this.props.userProfile.firstname} {this.props.userProfile.lastname}
					</Text>
				</View>
				<View style = {{ flex: 1, backgroundColor: this.getTheme().btnSecondaryBg }}>
					<Button name = "dashboard"
						backgroundColor = {this.getTheme().btnSecondaryBg}
						size={26}
						style = {{ padding: 6, minWidth: 100 }}
						onPress={this.onTabSelect.bind(this, 'dashboardTab')}>
						<Text style={{ color: 'white', fontSize: 18 }}>Dashboard</Text>
					</Button>
					<Button name = "toggle-on"
						backgroundColor = {this.getTheme().btnSecondaryBg}
						size={26}
						style = {{ padding: 6, minWidth: 100 }}
						onPress={this.onTabSelect.bind(this, 'devicesTab')}>
						<Text style={{ color: 'white', fontSize: 18 }}>Devices</Text>
					</Button>
					<Button name = "wifi"
						backgroundColor = {this.getTheme().btnSecondaryBg}
						size={26}
						style = {{ padding: 6, minWidth: 100 }}
						onPress={this.onTabSelect.bind(this, 'sensorsTab')}>
						<Text style={{ color: 'white', fontSize: 18 }}>Sensors</Text>
					</Button>
					<Button name = "clock-o"
						backgroundColor = {this.getTheme().btnSecondaryBg}
						size={26}
						style = {{ padding: 6, minWidth: 100 }}
						onPress={this.onTabSelect.bind(this, 'schedulerTab')}>
						<Text style={{ color: 'white', fontSize: 18 }}>Scheduler</Text>
					</Button>
					<Button name = "home"
						backgroundColor = {this.getTheme().btnSecondaryBg}
						size={26}
						style = {{ padding: 6, minWidth: 100 }}
						onPress={this.onTabSelect.bind(this, 'gatewaysTab')}>
						<Text style={{ color: 'white', fontSize: 18 }}>Connected Locations</Text>
					</Button>
					<Button name = "sign-out"
						backgroundColor = {this.getTheme().btnSecondaryBg}
						size={26}
						style = {{ padding: 6, minWidth: 100 }}
						onPress = {() => this.props.dispatch(logoutFromTelldus())}>
						<Text style={{ color: 'white', fontSize: 18 }}>Logout</Text>
					</Button>
				</View>
			</View>
		);
	}

	renderContent() {
		switch (this.props.tab) {
			case 'dashboardTab':
				return <DashboardTab />;
			case 'devicesTab':
				return <DevicesTab />;
			case 'sensorsTab':
				return <SensorsTab />;
			case 'schedulerTab':
				return <SchedulerTab />;
			case 'gatewaysTab':
				return <GatewaysTab />;
			default:
				return <DashboardTab />;
		}
	}

	render() {
		if (!this.state || !this.state.starIcon) {
			return false;
		}

		return (
			<DrawerLayoutAndroid
				ref = "drawer"
				drawerWidth = {280}
				drawerPosition = {DrawerLayoutAndroid.positions.Left}
				renderNavigationView = {() => this.navigationView()}
			>
				<View style = {{ flex: 1 }} >
					<View style = {{
						height: ExtraDimensions.get('STATUS_BAR_HEIGHT'),
						backgroundColor: Theme.Core.brandPrimary }}
					/>
					{
						this.props.tab === 'devicesTab' || this.props.tab === 'sensorsTab' ?
						(
							<Icon.ToolbarAndroid
								style = {{ height: 56, backgroundColor: Theme.Core.brandPrimary }}
								titleColor = {Theme.Core.inverseTextColor}
								navIconName = "bars"
								overflowIconName = "star"
								iconColor = {Theme.Core.inverseTextColor}
								title = "Telldus Live!"
								actions = {[{ title: 'Settings', icon: this.state.starIcon, show: 'always' }]}
								onActionSelected = {this._toggleEditMode.bind(this)}
								onIconClicked = {() => this.refs.drawer.openDrawer()}
							/>
						) :
						(
							<Icon.ToolbarAndroid
								style = {{ height: 56, backgroundColor: Theme.Core.brandPrimary }}
								titleColor = {Theme.Core.inverseTextColor}
								navIconName = "bars"
								overflowIconName = "star"
								iconColor = {Theme.Core.inverseTextColor}
								title = "Telldus Live!"
								onIconClicked = {() => this.refs.drawer.openDrawer()}
							/>
						)
					}

					<View key={this.props.tab}>
						{this.renderContent()}
					</View>
				</View>
			</DrawerLayoutAndroid>
		);
	}

	_toggleEditMode(position) {
		this.props.onToggleEditMode(this.props.tab);
	}
}

function select(store) {
	return {
		tab: store.navigation.tab,
		devices: store.devices.devices,
		gateways: store.gateways.gateways,
		sensors: store.sensors.sensors,
		userProfile: store.user.userProfile || { firstname: '', lastname: '', email: '' },
	};
}

function actions(dispatch) {
	return {
		onTabSelect: (tab) => dispatch(switchTab(tab)),
		onToggleEditMode: (tab) => dispatch(toggleEditMode(tab)),
		dispatch,
	};
}

module.exports = connect(select, actions)(TabsView);
