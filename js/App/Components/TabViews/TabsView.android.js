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
import { StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { connect } from 'react-redux';

import { Text, View, Icon, Image } from 'BaseComponents';

import DrawerLayoutAndroid from 'DrawerLayoutAndroid';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import Theme from 'Theme';

import DashboardTab from './DashboardTab';
import DevicesTab from './DevicesTab';
import SchedulerTab from './SchedulerTab';
import SensorsTab from './SensorsTab';
import { SettingsDetailModal } from 'DetailViews';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';

import { switchTab, toggleEditMode } from 'Actions';

const TabHeader = ({ fontSize, ...props }) => {
	return <TabBar {...props} style={{ backgroundColor: Theme.Core.brandPrimary }} labelStyle={{ fontSize }} />;
};

const Gateway = ({ name, status }) => (
	<View style={styles.gatewayContainer}>
		<Image style={styles.gatewayIcon} source={require('./img/tabIcons/location.png')} />
		<Text style={styles.gateway} ellipsizeMode="middle" numberOfLines={1}>{name}</Text>
	</View>
);

const NavigationHeader = ({ firstName, lastName }) => (
	<View style = {styles.navigationHeader}>
		<Image style={styles.navigationHeaderImage}
			source={require('./img/telldus.png')}
			resizeMode={'contain'} />
		<Text style={styles.navigationHeaderText}>
			{firstName} {lastName}
		</Text>
	</View>
);

const ConnectedLocations = () => (
	<View style={styles.navigationTitle}>
		<Image source={require('./img/tabIcons/router.png')} resizeMode={'contain'} style={styles.navigationTitleImage}/>
		<Text style={styles.navigationTextTitle}>Connected Locations</Text>
	</View>
);

const SettingsButton = ({ onPress }) => (
	<TouchableOpacity onPress={onPress} style={styles.navigationTitle}>
		<Image source={require('./img/tabIcons/gear.png')} resizeMode={'contain'} style={styles.navigationTitleImage}/>
		<Text style={styles.navigationTextTitle}>Settings</Text>
	</TouchableOpacity>
);

const NavigationView = ({ props, onOpenSetting }) => {
	let gateways = [];

	if (props.store.gateways) {
		props.store.gateways.forEach((item, index) => {
			gateways.push(<Gateway name={item.name} key={index} />);
		});
	}

	return (
		<View style = {{ flex: 1, backgroundColor: 'rgba(26,53,92,255)' }}>
			<NavigationHeader firstName={props.userProfile.firstname} lastName={props.userProfile.lastname} />
			<View style = {{ flex: 1, backgroundColor: 'white' }}>
				<ConnectedLocations />
				{gateways}
				<SettingsButton onPress={onOpenSetting} />
			</View>
		</View>
	);
};

class TabsView extends View {
	constructor(props) {
		super(props);

		this.state = {
			settings: false,
			index: 0,
			routes: [
				{ key: '1', title: 'Dashboard' },
				{ key: '2', title: 'Devices' },
				{ key: '3', title: 'Sensors' },
				{ key: '4', title: 'Scheduler' },
			],
		};

		this.deviceWidth = Dimensions.get('window').width;
		this.deviceHeight = Dimensions.get('window').height;

		this.renderScene = SceneMap({
			'1': () => <DashboardTab />,
			'2': () => <DevicesTab />,
			'3': () => <SensorsTab />,
			'4': () => <SchedulerTab />,
		});

		this.renderHeader = this.renderHeader.bind(this);
		this.renderContent = this.renderContent.bind(this);
		this.renderNavigationView = this.renderNavigationView.bind(this);
		this.onOpenSetting = this.onOpenSetting.bind(this);
		this.onCloseSetting = this.onCloseSetting.bind(this);
		this.onTabSelect = this.onTabSelect.bind(this);
		this.onRequestChangeTab = this.onRequestChangeTab.bind(this);
		this.toggleEditMode = this.toggleEditMode.bind(this);
	}

	componentDidMount() {
		Icon.getImageSource('star', 22, 'white').then((source) => this.setState({ starIcon: source }));

		if (this.props.dashboard.devices.length > 0 || this.props.dashboard.sensors.length > 0) {
			if (this.props.tab !== 'dashboardTab') {
				this.onRequestChangeTab(0);
			}
		} else {
			this.onRequestChangeTab(1);
		}
	}

	onTabSelect(tab) {

		if (this.props.tab !== tab) {
			this.props.onTabSelect(tab);
			if (this.refs.drawer) {
				this.refs.drawer.closeDrawer();
			}
		}
	}

	onOpenSetting() {
		this.setState({ settings: true });
	}

	onCloseSetting() {
		this.setState({ settings: false });
	}

	onRequestChangeTab(index) {
		this.setState({ index });
		const tabNames = ['dashboardTab', 'devicesTab', 'sensorsTab', 'schedulerTab'];
		this.onTabSelect(tabNames[index]);
	}

	renderHeader(props) {
		return <TabHeader {...props} fontSize={this.deviceWidth / 35} />;
	}

	renderContent() {
		return <TabViewAnimated style={{ flex: 1 }}
			navigationState={this.state}
			renderScene = {this.renderScene}
			renderHeader = {this.renderHeader}
			onRequestChangeTab = {this.onRequestChangeTab}
			/>;
	}

	renderNavigationView() {
		return <NavigationView props={this.props} theme={this.getTheme()} onOpenSetting={this.onOpenSetting}/>;
	}

	render() {
		if (!this.state || !this.state.starIcon) {
			return false;
		}

		// TODO: Refactor: Split this code to smaller components
		return (
			<DrawerLayoutAndroid
				ref = "drawer"
				drawerWidth = {250}
				drawerPosition = {DrawerLayoutAndroid.positions.Left}
				renderNavigationView = {this.renderNavigationView}
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
								onActionSelected = {this.toggleEditMode}
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

					<View>
						{this.renderContent()}
						{
							this.state.settings ?
								<SettingsDetailModal isVisible={true} onClose={this.onCloseSetting} /> :
								null
						}
					</View>
				</View>
			</DrawerLayoutAndroid>
		);
	}

	toggleEditMode(position) {
		this.props.onToggleEditMode(this.props.tab);
	}
}

const styles = StyleSheet.create({
	navigationHeader: {
		height: 60,
		marginTop: ExtraDimensions.get('STATUS_BAR_HEIGHT'),
		marginBottom: ExtraDimensions.get('STATUS_BAR_HEIGHT'),
		padding: 5,
		flexDirection: 'row',
	},
	navigationHeaderImage: {
		width: 46,
		height: 46,
	},
	navigationHeaderText: {
		flex: 1,
		color: '#e26901',
		fontSize: 24,
		textAlignVertical: 'center',
		marginLeft: 20,
	},
	navigationTitle: {
		flexDirection: 'row',
		height: 30,
		marginLeft: 10,
		marginTop: 20,
		marginBottom: 10,
	},
	navigationTextTitle: {
		color: 'rgba(26,53,92,255)',
		fontSize: 18,
		marginLeft: 10,
	},
	navigationTitleImage: {
		width: 28,
		height: 28,
	},
	settingsButton: {
		padding: 6,
		minWidth: 100,
	},
	settingsText: {
		color: 'white',
		fontSize: 18,
	},
	gatewayContainer: {
		marginLeft: 10,
		height: 20,
		flexDirection: 'row',
		marginTop: 10,
		marginBottom: 10,
	},
	gateway: {
		fontSize: 14,
		color: 'rgba(110,110,110,255)',
		marginLeft: 10,
		maxWidth: 220,
	},
	gatewayIcon: {
		width: 20,
		height: 20,
	},
});

function select(store) {
	return {
		tab: store.navigation.tab,
		userProfile: store.user.userProfile || { firstname: '', lastname: '', email: '' },
		dashboard: store.dashboard,
		store,
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
