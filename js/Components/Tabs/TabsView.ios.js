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
import StatusBarIOS from 'StatusBarIOS';
import TabBarIOS from 'TabBarIOS';
import TabBarItemIOS from 'TabBarItemIOS';
import Navigator from 'Navigator';
import { switchTab, logoutFromTelldus } from 'Actions';

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
			<TabBarIOS
				tintColor={this.getTheme().brandPrimary}
			>
			<TabBarItemIOS
				title="Dashboard"
				selected={this.props.tab === 'dashboardTab'}
				onPress={this.onTabSelect.bind(this, 'dashboardTab')}
				icon={require('./img/dashboard-inactive-icon.png')}
				selectedIcon={require('./img/dashboard-active-icon.png')}>
				<Container navigator={this.props.navigator} style={{ padding: 10 }}>
					<Content>
						<Text>
							Hello,
							Hej,
							สวัสดี,
							Здравствуйте,
							你好
						</Text>
						<View style = {{ paddingBottom: 10 }} />
						<Text>
							Name: {this.props.userProfile.firstname} {this.props.userProfile.lastname}
						</Text>
						<Text>
							Email: {this.props.userProfile.email}
						</Text>
						<View style = {{ paddingBottom: 10 }} />
						<Button
							name = "sign-out"
							backgroundColor = { this.getTheme().btnPrimaryBg }
							style = {{ padding: 6, minWidth: 100 }}
							onPress={ () => this.props.dispatch(logoutFromTelldus()) }
						>Logout</Button>
					</Content>
				</Container>
			</TabBarItemIOS>
			<TabBarItemIOS
				title="Devices"
				selected={this.props.tab === 'devicesTab'}
				onPress={this.onTabSelect.bind(this, 'devicesTab')}
				icon={require('./img/devices-inactive-icon.png')}
				selectedIcon={require('./img/devices-active-icon.png')}>
				<Container navigator={this.props.navigator} style={{ padding: 10 }}>
					<Content>
						<List
							dataArray={this.props.devices}
							renderRow={(item) =>
								<ListItem>
									<Text>{item.name}</Text>
								</ListItem>
							}
						/>
					</Content>
				</Container>
			</TabBarItemIOS>
			<TabBarItemIOS
				title="Sensors"
				selected={this.props.tab === 'sensorsTab'}
				onPress={this.onTabSelect.bind(this, 'sensorsTab')}
				icon={require('./img/sensors-inactive-icon.png')}
				selectedIcon={require('./img/sensors-active-icon.png')}>
				<Container navigator={this.props.navigator} style={{ padding: 10 }}>
					<Content>
						<List
							dataArray={this.props.sensors}
							renderRow={(item) =>
								<ListItem>
									<Text>{item.name}</Text>
								</ListItem>
							}
						/>
					</Content>
				</Container>
			</TabBarItemIOS>
			<TabBarItemIOS
				title="Scheduler"
				selected={this.props.tab === 'schedulerTab'}
				onPress={this.onTabSelect.bind(this, 'schedulerTab')}
				badge={this.props.notificationsBadge || null}
				icon={require('./img/scheduler-inactive-icon.png')}
				selectedIcon={require('./img/scheduler-active-icon.png')}>
				<Container navigator={this.props.navigator} style={{ padding: 10 }}>
					<Content>
						<Text>
							Scheduler
						</Text>
					</Content>
				</Container>
			</TabBarItemIOS>
			<TabBarItemIOS
				title="Locations"
				selected={this.props.tab === 'locationsTab'}
				onPress={this.onTabSelect.bind(this, 'locationsTab')}
				badge={this.props.notificationsBadge || null}
				icon={require('./img/locations-inactive-icon.png')}
				selectedIcon={require('./img/locations-active-icon.png')}>
				<Container navigator={this.props.navigator} style={{ padding: 10 }}>
					<Content>
						<List
							dataArray={this.props.gateways}
							renderRow={(item) =>
								<ListItem>
									<Text>{item.name}</Text>
								</ListItem>
							}
						/>
					</Content>
				</Container>
			</TabBarItemIOS>
			</TabBarIOS>
		);
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
