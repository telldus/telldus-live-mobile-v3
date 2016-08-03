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

import {
	Icon,
	NavigatorIOS,
	PixelRatio,
	StatusBar,
	StyleSheet,
	TabBarIOS,
	Text,
	View
} from 'BaseComponents';

import { switchTab } from 'Actions';
import DetailViews from 'DetailViews';
import TabViews from 'TabViews';
import Theme from 'Theme';


class TabsView extends View {

	props: {
		tab: Tab;
		onTabSelect: (tab: Tab) => void;
	};

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		Icon.getImageSource('user', 22, 'white').then((source) => this.setState({ userIcon: source }));
	}

	onTabSelect(tab: Tab) {
		if (this.props.tab !== tab) {
			this.props.onTabSelect(tab);
		}
	}

	render() {
		if (!this.state || !this.state.userIcon) {
			return false;
		}
		return (
				<TabBarIOS tintColor = { this.getTheme().brandPrimary } >
					<TabBarIOS.Item
						title = "Dashboard"
						selected = { this.props.tab === 'dashboardTab' }
						onPress = { this.onTabSelect.bind(this, 'dashboardTab') }
						icon = { require('./img/dashboard-inactive-icon.png') }
						selectedIcon = { require('./img/dashboard-active-icon.png')}
					>
						<NavigatorIOS
							ref = "dashboardNavigator"
							style = { styles.container }
							barTintColor = { Theme.Core.brandPrimary }
							tintColor = { Theme.Core.inverseTextColor }
							titleTextColor = { Theme.Core.inverseTextColor }
							initialRoute = {{
								title: 'Telldus Live!',
								component: TabViews.Dashboard,
								rightButtonIcon: this.state.userIcon,
								onRightButtonPress: this._openUserDetailView.bind(this)
							}}
						/>
					</TabBarIOS.Item>
					<TabBarIOS.Item
						title = "Devices"
						selected = { this.props.tab === 'devicesTab' }
						onPress = { this.onTabSelect.bind(this, 'devicesTab') }
						icon = { require('./img/devices-inactive-icon.png') }
						selectedIcon = {require('./img/devices-active-icon.png') }
					>
						<NavigatorIOS
							style = { styles.container }
							barTintColor = { Theme.Core.brandPrimary }
							tintColor = { Theme.Core.inverseTextColor }
							titleTextColor = { Theme.Core.inverseTextColor }
							initialRoute = {{
								title: 'Devices',
								component: TabViews.Devices,
							}}
						/>
					</TabBarIOS.Item>
					<TabBarIOS.Item
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
								component: TabViews.Sensors,
							}}
						/>
					</TabBarIOS.Item>
					<TabBarIOS.Item
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
								component: TabViews.Scheduler,
							}}
						/>
					</TabBarIOS.Item>
					<TabBarIOS.Item
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
								component: TabViews.Gateways,
							}}
						/>
					</TabBarIOS.Item>
				</TabBarIOS>
		);
	}

	_openUserDetailView () {
		this.refs.dashboardNavigator.push({
			component: DetailViews.User,
			title: 'User Profile',
			passProps: { user: this.props.userProfile }
		});
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
		userIcon: false,
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
