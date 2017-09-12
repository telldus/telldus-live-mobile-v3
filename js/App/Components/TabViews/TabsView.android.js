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
import { StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import { defineMessages, intlShape, injectIntl } from 'react-intl';

import { FormattedMessage, Text, View, Icon, Image, Header } from 'BaseComponents';
import i18n from '../../Translations/common';

import DrawerLayoutAndroid from 'DrawerLayoutAndroid';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import Theme from 'Theme';

import { SettingsDetailModal } from 'DetailViews';

import { getUserProfile } from '../../Reducers/User';
import { syncWithServer, switchTab, toggleEditMode, addNewGateway } from 'Actions';
import TabViews from 'TabViews';
import { TabNavigator } from 'react-navigation';

const messages = defineMessages({
	connectedLocations: {
		id: 'settings.connectedLocations',
		defaultMessage: 'Connected Locations',
	},
	addNewLocation: {
		id: 'settings.addNewLocation',
		defaultMessage: 'Add New Location',
	},
});

const AddLocation = ({onPress}) => {
	return (
		<View style={styles.addNewLocationContainer}>
			<TouchableOpacity onPress={onPress} style={styles.addNewLocationCover}>
				<Icon name="plus-circle" size={20} color="#e26901"/>
				<FormattedMessage {...messages.addNewLocation} style={styles.addNewLocationText}/>
			</TouchableOpacity>
		</View>
	);
};

const Gateway = ({ name, online, websocketOnline }) => {
	let locationSrc;
	if (!online) {
		locationSrc = require('./img/tabIcons/location-red.png');
	} else if (!websocketOnline) {
		locationSrc = require('./img/tabIcons/location-orange.png');
	} else {
		locationSrc = require('./img/tabIcons/location-green.png');
	}
	return (
		<View style={styles.gatewayContainer}>
			<Image style={styles.gatewayIcon} source={locationSrc}/>
			<Text style={styles.gateway} ellipsizeMode="middle" numberOfLines={1}>{name}</Text>
		</View>
	);
};

const NavigationHeader = ({ firstName, lastName }) => (
	<View style={styles.navigationHeader}>
		<Image style={styles.navigationHeaderImage}
		       source={require('./img/telldus.png')}
		       resizeMode={'contain'}/>
		<View style={styles.navigationHeaderTextCover}>
			<Text numberOfLines={1} style={styles.navigationHeaderText}>
				{firstName}
			</Text>
			{lastName ?
				<Text numberOfLines={1} style={styles.navigationHeaderText}>
					{lastName}
				</Text>
				:
				null
			}
		</View>
	</View>
);

const ConnectedLocations = () => (
	<View style={styles.navigationTitle}>
		<Image source={require('./img/tabIcons/router.png')} resizeMode={'contain'} style={styles.navigationTitleImage}/>
		<Text style={styles.navigationTextTitle}><FormattedMessage {...messages.connectedLocations} style={styles.navigationTextTitle}/></Text>
	</View>
);

const SettingsButton = ({ onPress }) => (
	<TouchableOpacity onPress={onPress} style={styles.navigationTitle}>
		<Image source={require('./img/tabIcons/gear.png')} resizeMode={'contain'} style={styles.navigationTitleImage}/>
		<Text style={styles.navigationTextTitle}><FormattedMessage {...i18n.settingsHeader} style={styles.navigationTextTitle} /></Text>
	</TouchableOpacity>
);

const NavigationView = ({ gateways, userProfile, onOpenSetting, addNewLocation }) => {
	return (
		<View style={{
			flex: 1,
			backgroundColor: 'rgba(26,53,92,255)',
		}}>
			<NavigationHeader firstName={userProfile.firstname} lastName={userProfile.lastname}/>
			<View style={{
				flex: 1,
				backgroundColor: 'white',
			}}>
				<ConnectedLocations />
				{gateways.allIds.map((id, index) => {
					return (<Gateway {...gateways.byId[id]} key={index}/>);
				})}
				<AddLocation onPress={addNewLocation} />
				<SettingsButton onPress={onOpenSetting}/>
			</View>
		</View>
	);
};

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
			width: Dimensions.get('window').width / 3.5,
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
	onToggleEditMode: (string) => void,
	dispatch: Function,
	stackNavigator: Object,
	addNewLocation: () => void,
};

type State = {
	settings: boolean,
	starIcon: Object,
};

class TabsView extends View {
	props: Props;
	state: State;

	renderNavigationView: () => Object;
	onOpenSetting: () => void;
	onCloseSetting: () => void;
	onTabSelect: (string) => void;
	onRequestChangeTab: (number) => void;
	toggleEditMode: (number) => void;
	openDrawer: () => void;
	onNavigationStateChange: (Object, Object) => void;
	addNewLocation: () => void;

	constructor(props: Props) {
		super(props);

		this.starButton = {
			icon: {
				name: 'star',
				size: 22,
				color: '#fff',
			},
			onPress: this.toggleEditMode,
		};

		this.menuButton = {
			icon: {
				name: 'bars',
				size: 22,
				color: '#fff',
			},
			onPress: this.openDrawer,
		};

		this.state = {
			settings: false,
			routeName: '',
		};

		this.renderNavigationView = this.renderNavigationView.bind(this);
		this.onOpenSetting = this.onOpenSetting.bind(this);
		this.onCloseSetting = this.onCloseSetting.bind(this);
		this.onTabSelect = this.onTabSelect.bind(this);
		this.onRequestChangeTab = this.onRequestChangeTab.bind(this);
		this.toggleEditMode = this.toggleEditMode.bind(this);
		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
		this.addNewLocation = this.addNewLocation.bind(this);
	}

	componentDidMount() {
		Icon.getImageSource('star', 22, 'white').then((source) => this.setState({ starIcon: source }));
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

	onNavigationStateChange(prevState, currentState) {
		const index = currentState.index;

		this.setState({ routeName: currentState.routes[index].routeName });
		this.onRequestChangeTab(index);
	}

	openDrawer = () => {
		this.refs.drawer.openDrawer();
		this.props.syncGateways();
	};

	renderNavigationView() {
		return <NavigationView
			gateways={this.props.gateways}
			addNewLocation={this.addNewLocation}
			userProfile={this.props.userProfile}
			theme={this.getTheme()}
			onOpenSetting={this.onOpenSetting}
		/>;
	}

	makeRightButton = routeName => {
		return (routeName === 'Devices' || routeName === 'Sensors') ? this.starButton : null;
	};

	addNewLocation() {
		this.props.addNewLocation();
		this.props.stackNavigator.navigate('LocationDetected');
	}

	render() {
		let screenProps = { stackNavigator: this.props.stackNavigator };
		if (!this.state || !this.state.starIcon) {
			return false;
		}

		const { routeName } = this.state;

		const rightButton = this.makeRightButton(routeName);

		// TODO: Refactor: Split this code to smaller components
		return (
			<DrawerLayoutAndroid
				ref="drawer"
				drawerWidth={250}
				drawerPosition={DrawerLayoutAndroid.positions.Left}
				renderNavigationView={this.renderNavigationView}
			>
				<View style={{ flex: 1 }}>
					<Header leftButton={this.menuButton} rightButton={rightButton}/>
					<View>
						<Tabs screenProps={{...screenProps, intl: this.props.intl}} onNavigationStateChange={this.onNavigationStateChange}/>
						{
							this.state.settings ? (
								<SettingsDetailModal isVisible={true} onClose={this.onCloseSetting}/>
							) : null
						}
					</View>
				</View>
			</DrawerLayoutAndroid>
		);
	}

	toggleEditMode = () => {
		this.props.onToggleEditMode(this.props.tab);
	};
}

const styles = StyleSheet.create({
	navigationHeader: {
		height: 60,
		marginTop: ExtraDimensions.get('STATUS_BAR_HEIGHT'),
		marginBottom: ExtraDimensions.get('STATUS_BAR_HEIGHT'),
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'flex-end',
	},
	navigationHeaderImage: {
		width: 55,
		height: 57,
		padding: 5,
	},
	navigationHeaderText: {
		color: '#e26901',
		fontSize: 22,
		marginLeft: 10,
		marginTop: 4,
		zIndex: 3,
		alignItems: 'flex-end',
	},
	navigationHeaderTextCover: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		height: 64,
		justifyContent: 'flex-start',
		alignItems: 'flex-end',
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
	addNewLocationCover: {
		flexDirection: 'row',
	},
	addNewLocationContainer: {
		borderBottomWidth: 1,
		borderBottomColor: '#eeeeef',
		marginLeft: 10,
		marginRight: 10,
		marginTop: 10,
		height: 40,
		justifyContent: 'flex-start',
	},
	addNewLocationText: {
		fontSize: 14,
		color: '#e26901',
		marginLeft: 10,
	},
});

function mapStateToProps(store, ownprops) {
	return {
		stackNavigator: ownprops.navigation,
		tab: store.navigation.tab,
		userProfile: getUserProfile(store),
		dashboard: store.dashboard,
		gateways: store.gateways,
		store,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		syncGateways: () => dispatch(syncWithServer('gatewaysTab')),
		onTabSelect: (tab) => {
			dispatch(syncWithServer(tab));
			dispatch(switchTab(tab));
		},
		onToggleEditMode: (tab) => dispatch(toggleEditMode(tab)),
		addNewLocation: () => dispatch(addNewGateway()),
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(TabsView));
