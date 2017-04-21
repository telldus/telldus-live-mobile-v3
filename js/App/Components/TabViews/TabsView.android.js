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

import { Button, Icon, ListItem, Text, View } from 'BaseComponents';
import DrawerLayoutAndroid from 'DrawerLayoutAndroid';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import Theme from 'Theme';
import Gravatar from 'react-native-avatar-gravatar';

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
			<View style = {{ flex: 1, backgroundColor: this.getTheme().btnPrimaryBg }}>
				<View style = {{ height: 80, marginTop: ExtraDimensions.get('STATUS_BAR_HEIGHT'), padding: 10 }}>
					<Gravatar
						emailAddress = {this.props.userProfile.email}
						size = { 60 }
						mask = "circle"
					/>
					<Text>
						{this.props.userProfile.firstname} {this.props.userProfile.lastname}
					</Text>
				</View>
				<View style = {{ flex: 1, backgroundColor: '#fff' }}>
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
					<ListItem>
						<Button
							name = "sign-out"
							backgroundColor = { this.getTheme().btnPrimaryBg }
							style = {{ padding: 6, minWidth: 100 }}
							onPress = { () => this.props.dispatch(logoutFromTelldus()) }
						>Logout</Button>
					</ListItem>
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
			}
		return <DashboardTab />;
	}

	render() {
		if (!this.state || !this.state.starIcon) {
			return false;
		}

		return (
			<DrawerLayoutAndroid
				ref = "drawer"
				drawerWidth = { 280 }
				drawerPosition = { DrawerLayoutAndroid.positions.Left }
				renderNavigationView = { () => this.navigationView() }
			>
				<View style = {{ flex:1 }} >
					<View style = {{
						height: ExtraDimensions.get('STATUS_BAR_HEIGHT'),
						backgroundColor: Theme.Core.brandPrimary }}
					/>
					{
						this.props.tab === 'devicesTab' || this.props.tab === 'sensorsTab' ?
						(
							<Icon.ToolbarAndroid
								style = {{ height: 56, backgroundColor: Theme.Core.brandPrimary }}
								titleColor = { Theme.Core.inverseTextColor }
								navIconName = "bars"
								overflowIconName = "star"
								iconColor = { Theme.Core.inverseTextColor }
								title = "Telldus Live!"
								actions = {[{ title: 'Settings', icon: this.state.starIcon, show: 'always'}]}
								onActionSelected = { this._toggleEditMode.bind(this) }
								onIconClicked = { () => this.refs.drawer.openDrawer() }
							/>
						) :
						(
							<Icon.ToolbarAndroid
								style = {{ height: 56, backgroundColor: Theme.Core.brandPrimary }}
								titleColor = { Theme.Core.inverseTextColor }
								navIconName = "bars"
								overflowIconName = "star"
								iconColor = { Theme.Core.inverseTextColor }
								title = "Telldus Live!"
								onIconClicked = { () => this.refs.drawer.openDrawer() }
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
		userProfile: store.user.userProfile || {firstname: '', lastname: '', email: ''}
	};
}

function actions(dispatch) {
	return {
		onTabSelect: (tab) => dispatch(switchTab(tab)),
		onToggleEditMode : (tab) => dispatch(toggleEditMode(tab)),
		dispatch
	};
}

module.exports = connect(select, actions)(TabsView);
