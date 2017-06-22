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

import { Icon, View, Header } from 'BaseComponents';

import { toggleEditMode, syncWithServer, switchTab } from 'Actions';
import TabViews from 'TabViews';

import { getUserProfile } from '../../Reducers/User';
import { TabNavigator } from 'react-navigation';
import { SettingsDetailModal } from 'DetailViews';

type Props = {
	tab: string,
	userIcon: boolean,
	userProfile: Object,
	dashboard: Object,
	onTabSelect: (string) => void,
	onToggleEditMode: (string) => void,
	dispatch: Function,
};

type State = {
	index: number,
	settings: boolean,
};

class TabsView extends View {
	props: Props;
	state: State;

	toggleSensorTabEditMode: () => void;
	toggleDevicesTabEditMode: () => void;
	onNavigationStateChange: (Object, Object) => void;
	onOpenSetting: () => void;
	onCloseSetting: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			index: 0,
			settings: false,
		};

		this.tabNames = ['dashboardTab', 'devicesTab', 'sensorsTab', 'schedulerTab', 'gatewaysTab'];

		this.settingsButton = {
			icon: {
				name: 'gear',
				size: 22,
				color: '#fff',
			},
			onPress: this.onOpenSetting.bind(this),
		};

		this.starButton = {
			icon: {
				name: 'star',
				size: 22,
				color: '#fff',
			},
			onPress: this.onToggleEditMode.bind(this),
		};

		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
		this.onCloseSetting = this.onCloseSetting.bind(this);
	}

	onTabSelect(tab) {
		this.props.onTabSelect(tab);
	}

	onNavigationStateChange(prevState, currentState) {
		const index = currentState.index;
		this.onTabSelect(this.tabNames[index]);
		this.setState({ index });
	}

	onOpenSetting() {
		this.setState({ settings: true });
	}

	onCloseSetting() {
		this.setState({ settings: false });
	}

	onToggleEditMode() {
		const tab = this.tabNames[this.state.index];
		this.props.onToggleEditMode(tab);
	}

	render() {
		const { index } = this.state;

		let rightButton;

		if (index === 0) {
			rightButton = this.settingsButton;
		} else if (index === 1 || index === 2) {
			rightButton = this.starButton;
		} else {
			rightButton = null;
		}

		return (
			<View>
				<Header rightButton={rightButton}/>
				<Tabs onNavigationStateChange={this.onNavigationStateChange}/>
				{
					this.state.settings ? (
						<SettingsDetailModal isVisible={true} onClose={this.onCloseSetting}/>
					) : null
				}
			</View>
		);
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
		onTabSelect: (tab) => {
			dispatch(syncWithServer(tab));
			dispatch(switchTab(tab));
		},
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
