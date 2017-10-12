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
import { Dimensions } from 'react-native';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';

import { View, Icon } from 'BaseComponents';

import Theme from 'Theme';

import { SettingsDetailModal } from 'DetailViews';

import { getUserProfile } from '../../Reducers/User';
import { syncWithServer, switchTab, toggleEditMode } from 'Actions';
import TabViews from 'TabViews';
import { TabNavigator } from 'react-navigation';

const RouteConfigs = {
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
};

const TabNavigatorConfig = {
	initialRouteName: 'Dashboard',
	swipeEnabled: true,
	lazy: true,
	animationEnabled: true,
	tabBarOptions: {
		activeTintColor: '#fff',
		indicatorStyle: {
			backgroundColor: '#fff',
		},
		scrollEnabled: true,
		labelStyle: {
			fontSize: Dimensions.get('window').width / 35,
		},
		tabStyle: {
			width: Dimensions.get('window').width / 2.8,
		},
		style: {
			backgroundColor: Theme.Core.brandPrimary,
		},
	},
};

const Tabs = TabNavigator(RouteConfigs, TabNavigatorConfig);

type Props = {
	intl: intlShape.isRequired,
	dashboard: Object,
	tab: string,
	userProfile: Object,
	gateways: Object,
	syncGateways: () => void,
	onTabSelect: (string) => void,
	dispatch: Function,
	stackNavigator: Object,
};

type State = {
	settings: boolean,
	starIcon: Object,
};

class TabsView extends View {
	props: Props;
	state: State;

	onOpenSetting: () => void;
	onCloseSetting: () => void;
	onTabSelect: (string) => void;
	onRequestChangeTab: (number) => void;
	toggleEditMode: (number) => void;
	onNavigationStateChange: (Object, Object) => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			settings: false,
			routeName: '',
		};
		this.onTabSelect = this.onTabSelect.bind(this);
		this.onRequestChangeTab = this.onRequestChangeTab.bind(this);
		this.toggleEditMode = this.toggleEditMode.bind(this);
		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
	}

	componentDidMount() {
		Icon.getImageSource('star', 22, 'white').then((source: string): void => this.setState({ starIcon: source }));
		let {setParams} = this.props.stackNavigator;
		setParams({
			openDrawer: this.props.screenProps.openDrawer,
			toggleEditMode: this.toggleEditMode,
		});
	}

	toggleEditMode() {
		let {state} = this.props.stackNavigator;
		this.props.dispatch(toggleEditMode(state.params.currentTab));
	}

	onTabSelect(tab: string) {
		if (this.props.tab !== tab) {
			this.props.onTabSelect(tab);
		}
	}

	onRequestChangeTab(index: number) {
		this.setState({ index });
		const tabNames = ['dashboardTab', 'devicesTab', 'sensorsTab', 'schedulerTab'];
		let {setParams} = this.props.stackNavigator;
		setParams({
			currentTab: tabNames[index],
		});
		this.onTabSelect(tabNames[index]);
	}

	onNavigationStateChange(prevState: Object, currentState: Object) {
		const index = currentState.index;

		this.setState({ routeName: currentState.routes[index].routeName });
		this.onRequestChangeTab(index);
	}

	makeRightButton = (routeName: string): any => {
		return (routeName === 'Devices' || routeName === 'Sensors') ? this.starButton : null;
	};

	render(): React$Element<any> {
		if (!this.state || !this.state.starIcon) {
			return false;
		}

		let screenProps = {
			stackNavigator: this.props.stackNavigator,
		};
		// TODO: Refactor: Split this code to smaller components
		return (
			<View style={{ flex: 1 }}>
				<View>
					<Tabs screenProps={{...screenProps, intl: this.props.intl}} onNavigationStateChange={this.onNavigationStateChange}/>
					{
						this.state.settings ? (
							<SettingsDetailModal isVisible={true} onClose={this.onCloseSetting}/>
						) : null
					}
				</View>
			</View>
		);
	}

}

function mapStateToProps(store: Object, ownProps: Object): Object {
	return {
		stackNavigator: ownProps.navigation,
		tab: store.navigation.tab,
		userProfile: getUserProfile(store),
		dashboard: store.dashboard,
		gateways: store.gateways,
		store,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		syncGateways: (): void => dispatch(syncWithServer('gatewaysTab')),
		onTabSelect: (tab: string) => {
			dispatch(syncWithServer(tab));
			dispatch(switchTab(tab));
		},
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(TabsView));
