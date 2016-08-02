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

import { Container, Content, Button, Header, List, ListItem, Text, Title, View } from 'BaseComponents';
import StatusBar from 'StatusBar';
import StyleSheet from 'StyleSheet';
import TabBarIOS from 'TabBarIOS';
import TabBarItemIOS from 'TabBarItemIOS';
import Navigator from 'Navigator';
import NavigatorIOS from 'NavigatorIOS';
import Theme from 'Theme';

import DashboardTab from './DashboardTab';
import DevicesTab from './DevicesTab';
import GatewaysTab from './GatewaysTab';
import SchedulerTab from './SchedulerTab';
import SensorsTab from './SensorsTab';
import { switchTab } from 'Actions';

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
			<View>
				<TabBarIOS
					tintColor={this.getTheme().brandPrimary}
				>
				<TabBarItemIOS
					title="Dashboard"
					selected={this.props.tab === 'dashboardTab'}
					onPress={this.onTabSelect.bind(this, 'dashboardTab')}
					icon={require('./img/dashboard-inactive-icon.png')}
					selectedIcon={require('./img/dashboard-active-icon.png')}>
					<NavigatorIOS
						style = { styles.container }
						barTintColor = { Theme.Core.brandPrimary }
						tintColor = { Theme.Core.inverseTextColor }
						titleTextColor = { Theme.Core.inverseTextColor }
						initialRoute = {{
							title: 'Telldus Live!',
							component: DashboardTab,
						}}
					/>
				</TabBarItemIOS>
				<TabBarItemIOS
					title="Devices"
					selected={this.props.tab === 'devicesTab'}
					onPress={this.onTabSelect.bind(this, 'devicesTab')}
					icon={require('./img/devices-inactive-icon.png')}
					selectedIcon={require('./img/devices-active-icon.png')}>
					<NavigatorIOS
						style = { styles.container }
						barTintColor = { Theme.Core.brandPrimary }
						tintColor = { Theme.Core.inverseTextColor }
						titleTextColor = { Theme.Core.inverseTextColor }
						initialRoute = {{
							title: 'Devices',
							component: DevicesTab,
						}}
					/>
				</TabBarItemIOS>
				<TabBarItemIOS
					title="Sensors"
					selected={this.props.tab === 'sensorsTab'}
					onPress={this.onTabSelect.bind(this, 'sensorsTab')}
					icon={require('./img/sensors-inactive-icon.png')}
					selectedIcon={require('./img/sensors-active-icon.png')}>
					<NavigatorIOS
						style = { styles.container }
						barTintColor = { Theme.Core.brandPrimary }
						tintColor = { Theme.Core.inverseTextColor }
						titleTextColor = { Theme.Core.inverseTextColor }
						initialRoute = {{
							title: 'Sensors',
							component: SensorsTab,
						}}
					/>
				</TabBarItemIOS>
				<TabBarItemIOS
					title="Scheduler"
					selected={this.props.tab === 'schedulerTab'}
					onPress={this.onTabSelect.bind(this, 'schedulerTab')}
					badge={this.props.notificationsBadge || null}
					icon={require('./img/scheduler-inactive-icon.png')}
					selectedIcon={require('./img/scheduler-active-icon.png')}>
					<NavigatorIOS
						style = { styles.container }
						barTintColor = { Theme.Core.brandPrimary }
						tintColor = { Theme.Core.inverseTextColor }
						titleTextColor = { Theme.Core.inverseTextColor }
						initialRoute = {{
							title: 'Scheduler',
							component: SchedulerTab,
						}}
					/>
				</TabBarItemIOS>
				<TabBarItemIOS
					title="Gateways"
					selected={this.props.tab === 'gatewaysTab'}
					onPress={this.onTabSelect.bind(this, 'gatewaysTab')}
					badge={this.props.notificationsBadge || null}
					icon={require('./img/gateways-inactive-icon.png')}
					selectedIcon={require('./img/gateways-active-icon.png')}>
					<NavigatorIOS
						style = { styles.container }
						barTintColor = { Theme.Core.brandPrimary }
						tintColor = { Theme.Core.inverseTextColor }
						titleTextColor = { Theme.Core.inverseTextColor }
						initialRoute = {{
							title: 'Gateways',
							component: GatewaysTab,
						}}
					/>
				</TabBarItemIOS>
				</TabBarIOS>
			</View>
		);
	}

}

var styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

function select(store) {
	return {
		tab: store.navigation.tab,
	};
}

function actions(dispatch) {
	return {
		onTabSelect: (tab) => dispatch(switchTab(tab)),
		dispatch
	};
}

module.exports = connect(select, actions)(TabsView);
