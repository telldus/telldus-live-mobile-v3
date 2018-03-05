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
import { intlShape, injectIntl } from 'react-intl';

import { View, Header, SafeAreaView } from 'BaseComponents';
import getTabBarIcon from '../../Lib/getTabBarIcon';

import { toggleEditMode, syncWithServer, switchTab } from 'Actions';
import TabViews from 'TabViews';

import { getUserProfile } from '../../Reducers/User';
import { TabNavigator } from 'react-navigation';
import { SettingsDetailModal } from 'DetailViews';

import i18n from '../../Translations/common';

const renderContainer = (navigation, screenProps) => Component => (
	<SafeAreaView>
		<Header rightButton={screenProps.rightButton}/>
		<Component navigation={navigation} screenProps={screenProps}/>
	</SafeAreaView>
);

const RouteConfigs = {
	Dashboard: {
		screen: ({ navigation, screenProps }) => renderContainer(navigation, screenProps)(TabViews.Dashboard),
		navigationOptions: ({navigation, screenProps}) => ({
			title: screenProps.intl.formatMessage(i18n.dashboard),
			tabBarIcon: ({ focused, tintColor }) => getTabBarIcon(focused, tintColor, 'dashboard'),
		}),
	},
	Devices: {
		screen: ({ navigation, screenProps }) => renderContainer(navigation, screenProps)(TabViews.Devices),
		navigationOptions: ({navigation, screenProps}) => ({
			title: screenProps.intl.formatMessage(i18n.devices),
			tabBarIcon: ({ focused, tintColor }) => getTabBarIcon(focused, tintColor, 'devices'),
		}),
	},
	Sensors: {
		screen: ({ navigation, screenProps }) => renderContainer(navigation, screenProps)(TabViews.Sensors),
		navigationOptions: ({navigation, screenProps}) => ({
			title: screenProps.intl.formatMessage(i18n.sensors),
			tabBarIcon: ({ focused, tintColor }) => getTabBarIcon(focused, tintColor, 'sensors'),
		}),
	},
	Scheduler: {
		screen: ({ navigation, screenProps }) => renderContainer(navigation, screenProps)(TabViews.Scheduler),
		navigationOptions: ({navigation, screenProps}) => ({
			title: screenProps.intl.formatMessage(i18n.scheduler),
			tabBarIcon: ({ focused, tintColor }) => getTabBarIcon(focused, tintColor, 'scheduler'),
		}),
	},
	Gateways: {
		screen: ({ navigation, screenProps }) => renderContainer(navigation, screenProps)(TabViews.Gateways),
		navigationOptions: ({navigation, screenProps}) => ({
			title: screenProps.intl.formatMessage(i18n.gateways),
			tabBarIcon: ({ focused, tintColor }) => getTabBarIcon(focused, tintColor, 'gateways'),
		}),
	},
};

const TabNavigatorConfig = {
	initialRouteName: 'Dashboard',
	swipeEnabled: false,
	lazy: true,
	animationEnabled: false,
	tabBarOptions: {
		activeTintColor: '#e26901',
		style: {
			justifyContent: 'center',
			alignItens: 'center',
		},
		tabStyle: {
			justifyContent: 'center',
			alignItens: 'center',
		},
		labelStyle: {
			fontSize: 13,
		},
	},
};

const Tabs = TabNavigator(RouteConfigs, TabNavigatorConfig);

type Props = {
	intl: intlShape.isRequired,
	tab: string,
	userIcon: boolean,
	userProfile: Object,
	dashboard: Object,
	onTabSelect: (string) => void,
	onToggleEditMode: (string) => void,
	dispatch: Function,
	stackNavigator: Object,
};

type Tab = {
	index: number,
	routeName: string,
};

type State = {
	tab: Tab,
	settings: boolean,
};

class TabsView extends View {
	props: Props;
	state: State;

	onNavigationStateChange: (Object, Object) => void;
	onOpenSetting: () => void;
	onCloseSetting: () => void;
	onToggleEditMode: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			tab: {
				index: 0,
				routeName: 'Dashboard',
			},
			settings: false,
		};

		this.tabNames = ['dashboardTab', 'devicesTab', 'sensorsTab', 'schedulerTab', 'gatewaysTab'];

		this.settingsButton = {
			icon: {
				name: 'gear',
				size: 22,
				color: '#fff',
			},
			onPress: this.onOpenSetting,
		};

		this.starButton = {
			icon: {
				name: 'star',
				size: 22,
				color: '#fff',
			},
			onPress: this.onToggleEditMode,
		};
	}

	onNavigationStateChange = (prevState, newState) => {
		const index = newState.index;

		const tab = {
			index,
			routeName: newState.routes[index].routeName,
		};

		this.setState({ tab });
		this.props.onTabSelect(this.tabNames[index]);
	};

	onOpenSetting = () => {
		this.setState({ settings: true });
	};

	onCloseSetting = () => {
		this.setState({ settings: false });
	};

	onToggleEditMode = () => {
		const tab = this.tabNames[this.state.tab.index];
		this.props.onToggleEditMode(tab);
	};

	render() {
		const { routeName } = this.state.tab;

		let rightButton;

		if (routeName === 'Dashboard') {
			rightButton = this.settingsButton;
		} else if (routeName === 'Devices' || routeName === 'Sensors') {
			rightButton = this.starButton;
		} else {
			rightButton = null;
		}

		let screenProps = {
			stackNavigator: this.props.stackNavigator,
			rightButton: rightButton,
		};

		return (
			<View style={{flex: 1}}>
				<Tabs screenProps={{...screenProps, intl: this.props.intl}} onNavigationStateChange={this.onNavigationStateChange}/>
				{
					this.state.settings ? (
						<SettingsDetailModal isVisible={true} onClose={this.onCloseSetting}/>
					) : null
				}
			</View>
		);
	}
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	return {
		stackNavigator: ownProps.navigation,
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

module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(TabsView));
