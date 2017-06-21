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

// @flow

'use strict';

import React from 'react';
import { connect } from 'react-redux';

import { Icon, View } from 'BaseComponents';

import { toggleEditMode } from 'Actions';
import TabViews from 'TabViews';

import { getUserProfile } from '../../Reducers/User';
import { TabNavigator } from 'react-navigation';

type Props = {
  tab: string,
  userIcon: boolean,
  userProfile: Object,
  dashboard: Object,
  onTabSelect: string => void,
  onToggleEditMode: string => void,
  dispatch: Function,
};

class TabsView extends View {
	props: Props;
	eventEmitter: Object;
	onTabSelect: string => void;
	onDashboardTabSelect: () => void;
	onDevicesTabSelect: () => void;
	onSensorsTabSelect: () => void;
	onSchedulerTabSelect: () => void;
	onGatewaysTabSelect: () => void;
	toggleSensorTabEditMode: () => void;
	toggleDevicesTabEditMode: () => void;

	constructor(props: Props) {
		super(props);
		this.toggleSensorTabEditMode = this.toggleSensorTabEditMode.bind(this);
		this.toggleDevicesTabEditMode = this.toggleDevicesTabEditMode.bind(this);
	}

	componentDidMount() {
		// TODO: move to the device component
		//Icon.getImageSource('star', 22, 'yellow').then((source) => this.setState({ starIcon: source }));
	}

	render() {
		return (
			<Tabs/>
		);
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
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onToggleEditMode: (tab) => dispatch(toggleEditMode(tab)),
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(TabsView);

const Tabs = TabNavigator(
	{
		Dashboard: {
			screen: TabViews.Dashboard,
		},
		Devices: {
			screen: TabViews.Devices,
		},
		Sensors: {
			screen: TabViews.Sensors,
		},
		Scheduler: {
			screen: TabViews.Scheduler,
		},
		Gateways: {
			screen: TabViews.Gateways,
		},
	},
	{
		initialRouteName: 'Dashboard',
		swipeEnabled: false,
		lazy: true,
		animationEnabled: false,
		tabBarOptions: {
			activeTintColor: '#e26901',
		},
	}
);
