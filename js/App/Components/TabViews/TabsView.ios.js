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
import EventEmitter from 'EventEmitter';

import {
	I18n,
	Icon,
	NavigatorIOS,
	TabBarIOS,
	View,
} from 'BaseComponents';

import { switchTab, toggleEditMode } from 'Actions';
import DetailViews from 'DetailViews';
import TabViews from 'TabViews';

import { getUserProfile } from '../../Reducers/User';

class TabsView extends View {
  constructor(props) {
    super(props);
    this.eventEmitter = new EventEmitter();
    this.onTabSelect = this.onTabSelect.bind(this);
    this.onDashboardTabSelect = this.onDashboardTabSelect.bind(this);
    this.onDevicesTabSelect = this.onDevicesTabSelect.bind(this);
    this.onSensorsTabSelect = this.onSensorsTabSelect.bind(this);
    this.onSchedulerTabSelect = this.onSchedulerTabSelect.bind(this);
    this.onGatewaysTabSelect = this.onGatewaysTabSelect.bind(this);
    this.toggleSensorTabEditMode = this.toggleSensorTabEditMode.bind(this);
    this.toggleDevicesTabEditMode = this.toggleDevicesTabEditMode.bind(this);
  }

  componentDidMount() {
    Icon.getImageSource('gear', 22, 'white').then((source) => this.setState({ settingIcon: source }));
    Icon.getImageSource('star', 22, 'yellow').then((source) => this.setState({ starIcon: source }));

    if (this.props.dashboard.deviceIds.length > 0 || this.props.dashboard.sensorIds.length > 0) {
      if (this.props.tab !== 'dashboardTab') {
        this.onTabSelect('dashboardTab');
      }
    } else {
      this.onTabSelect('devicesTab');
    }
  }

  onDashboardTabSelect() {
    this.onTabSelect('dashboardTab');
  }

  onDevicesTabSelect() {
    this.onTabSelect('devicesTab');
  }

  onSensorsTabSelect() {
    this.onTabSelect('sensorsTab');
  }

  onSchedulerTabSelect() {
    this.onTabSelect('schedulerTab');
  }

  onGatewaysTabSelect() {
    this.onTabSelect('gatewaysTab');
  }

  onTabSelect(tab) {
    if (this.props.tab !== tab) {
      this.props.onTabSelect(tab);
    }
  }

  render() {
    if (!this.state || !this.state.settingIcon || !this.state.starIcon) {
      return false;
    }
    return (
			<TabBarIOS tintColor = {this.getTheme().brandPrimary} >
				<TabBarIOS.Item
					title = {I18n.t('pages.dashboard')}
					selected = {this.props.tab === 'dashboardTab'}
					onPress = {this.onDashboardTabSelect}
					icon = {require('./img/tabIcons/dashboard-inactive.png')}
					selectedIcon = {require('./img/tabIcons/dashboard-active.png')}
				>
					<NavigatorIOS
						ref = "dashboardNavigator"
						initialRoute = {{
  title: 'Telldus Live!',
  component: TabViews.Dashboard,
  rightButtonIcon: this.state.settingIcon,
  passProps: {
    events: this.eventEmitter,
  },
  onRightButtonPress: () => {
    this.eventEmitter.emit('onSetting');
  },
}}
					/>
				</TabBarIOS.Item>
				<TabBarIOS.Item
					title = {I18n.t('pages.devices')}
					selected = {this.props.tab === 'devicesTab'}
					onPress = {this.onDevicesTabSelect}
					icon = {require('./img/tabIcons/devices-inactive.png')}
					selectedIcon = {require('./img/tabIcons/devices-active.png')}
				>
					<NavigatorIOS
						initialRoute = {{
  title: I18n.t('pages.devices'),
  component: TabViews.Devices,
  rightButtonIcon: this.state.starIcon,
  onRightButtonPress: this.toggleDevicesTabEditMode,
}}
					/>
				</TabBarIOS.Item>
				<TabBarIOS.Item
					title = {I18n.t('pages.sensors')}
					selected = {this.props.tab === 'sensorsTab'}
					onPress = {this.onSensorsTabSelect}
					icon = {require('./img/tabIcons/sensors-inactive.png')}
					selectedIcon = {require('./img/tabIcons/sensors-active.png')}>
					<NavigatorIOS
						initialRoute = {{
  title: I18n.t('pages.sensors'),
  component: TabViews.Sensors,
  rightButtonIcon: this.state.starIcon,
  onRightButtonPress: this.toggleSensorTabEditMode,
}}
					/>
				</TabBarIOS.Item>
				<TabBarIOS.Item
					title={I18n.t('pages.scheduler')}
					selected={this.props.tab === 'schedulerTab'}
					onPress={this.onSchedulerTabSelect}
					badge={this.props.notificationsBadge || null}
					icon={require('./img/tabIcons/scheduler-inactive.png')}
					selectedIcon={require('./img/tabIcons/scheduler-active.png')}>
					<NavigatorIOS
						initialRoute = {{
  title: I18n.t('pages.scheduler'),
  component: TabViews.Scheduler,
}}
					/>
				</TabBarIOS.Item>
				<TabBarIOS.Item
					title={I18n.t('pages.gateways')}
					selected={this.props.tab === 'gatewaysTab'}
					onPress={this.onGatewaysTabSelect}
					badge={this.props.notificationsBadge || null}
					icon={require('./img/tabIcons/gateways-inactive.png')}
					selectedIcon={require('./img/tabIcons/gateways-active.png')}>
					<NavigatorIOS
						initialRoute = {{
  title: I18n.t('pages.gateways'),
  component: TabViews.Gateways,
}}
					/>
				</TabBarIOS.Item>
			</TabBarIOS>
    );
  }

  _openUserDetailView() {
    this.refs.dashboardNavigator.push({
      component: DetailViews.User,
      title: I18n.t('pages.profile'),
      passProps: { user: this.props.userProfile },
    });
  }

  toggleSensorTabEditMode() {
    this.props.onToggleEditMode('sensorsTab');
  }

  toggleDevicesTabEditMode() {
    this.props.onToggleEditMode('devicesTab');
  }
}

function mapStateToProps(store) {
  return {
    tab: store.navigation.tab,
    userIcon: false,
    userProfile: getUserProfile(store),
    dashboard: store.dashboard,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onTabSelect: (tab) => dispatch(switchTab(tab)),
    onToggleEditMode: (tab) => dispatch(toggleEditMode(tab)),
    dispatch,
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(TabsView);
