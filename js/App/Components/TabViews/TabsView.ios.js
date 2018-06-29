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
 */

// @flow

'use strict';

import { ifIphoneX } from 'react-native-iphone-x-helper';
import DeviceInfo from 'react-native-device-info';
import { createBottomTabNavigator } from 'react-navigation-tabs';


import TabViews from './index';


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
	Gateways: {
		screen: TabViews.Gateways,
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
			...ifIphoneX({height: 20}),
		},
		labelStyle: {
			fontSize: DeviceInfo.isTablet() ? 18 : 12,
		},
	},
};

const TabsView = createBottomTabNavigator(RouteConfigs, TabNavigatorConfig);

// type Props = {
// 	intl: intlShape.isRequired,
// 	tab: string,
// 	userIcon: boolean,
// 	userProfile: Object,
// 	dashboard: Object,
// 	onTabSelect: (string) => void,
// 	onToggleEditMode: (string) => void,
// 	dispatch: Function,
// 	stackNavigator: Object,
// 	screenProps: Object,
// 	appLayout: Object,
// 	gateways: Array<any>,
// 	gatewaysToActivate: Object,
// 	addNewLocation: () => Promise<any>,
// };

// type Tab = {
// 	index: number,
// 	routeName: string,
// };

// type State = {
// 	tab: Tab,
// 	settings: boolean,
// 	addingNewLocation: boolean,
// };

// class TabsView extends View {
// 	props: Props;
// 	state: State;

// 	onNavigationStateChange: (Object, Object) => void;
// 	onOpenSetting: () => void;
// 	onCloseSetting: () => void;
// 	onToggleEditMode: () => void;
// 	addNewLocation: () => void;

// 	constructor(props: Props) {
// 		super(props);

// 		this.state = {
// 			tab: {
// 				index: 0,
// 				routeName: 'Dashboard',
// 			},
// 			settings: false,
// 			addingNewLocation: false,
// 		};

// 		this.tabNames = ['dashboardTab', 'devicesTab', 'sensorsTab', 'schedulerTab', 'gatewaysTab'];

// 		const { appLayout } = this.props;
// 		const { height, width } = appLayout;
// 		const isPortrait = height > width;
// 		const deviceHeight = isPortrait ? height : width;
// 		const size = Math.floor(deviceHeight * 0.03);

// 		let fontSize = size < 20 ? 20 : size;
// 		this.settingsButton = {
// 			component: <IconTelldus icon={'settings'} style={{
// 				fontSize,
// 				color: '#fff',
// 			}}/>,
// 			onPress: this.onOpenSetting,
// 		};

// 		let { formatMessage } = props.intl;

// 		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;
// 		this.addNewLocationFailed = `${formatMessage(i18n.addNewLocationFailed)}`;

// 		this.addNewLocation = this.addNewLocation.bind(this);
// 	}

// 	componentDidUpdate(prevProps: Object, prevState: Object) {
// 		const { gateways, gatewaysToActivate } = this.props;
// 		if (gateways.length === 0 && !this.state.addingNewLocation && gatewaysToActivate.checkIfGatewaysEmpty) {
// 			this.addNewLocation();
// 		}
// 	}

// 	addNewLocation() {
// 		this.setState({
// 			addingNewLocation: true,
// 		});
// 		this.props.addNewLocation()
// 			.then((response: Object) => {
// 				if (response.client) {
// 					this.props.stackNavigator.push('AddLocation', {clients: response.client, renderRootHeader: true});
// 				}
// 			}).catch((error: Object) => {
// 				this.setState({
// 					addingNewLocation: false,
// 				});
// 				let message = error.message && error.message === 'Network request failed' ? this.networkFailed : this.addNewLocationFailed;
// 				this.props.dispatch(showToast(message));
// 			});
// 	}

// 	onNavigationStateChange = (prevState: Object, newState: Object) => {
// 		const index = newState.index;

// 		const tab = {
// 			index,
// 			routeName: newState.routes[index].routeName,
// 		};

// 		this.setState({ tab });
// 		this.props.onTabSelect(this.tabNames[index]);
// 	};

// 	onOpenSetting = () => {
// 		// this.setState({ settings: true });
// 		this.props.stackNavigator.push('Settings');
// 	};

// 	onCloseSetting = () => {
// 		// this.setState({ settings: false });
// 	};

// 	onToggleEditMode = () => {
// 		const tab = this.tabNames[this.state.tab.index];
// 		this.props.onToggleEditMode(tab);
// 	};

// 	render(): Object {
// 		const { routeName } = this.state.tab;
// 		const { appLayout } = this.props;
// 		let { currentScreen } = this.props.screenProps;

// 		let leftButton = this.settingsButton;

// 		let screenProps = {
// 			stackNavigator: this.props.stackNavigator,
// 			currentTab: routeName,
// 			currentScreen,
// 		};

// 		let { height, width } = appLayout;
// 		let isPortrait = height > width;
// 		let deviceHeight = isPortrait ? height : width;

// 		return (
// 			<SafeAreaView>
// 				<Header leftButton={leftButton} style={{height: (isIphoneX() ? deviceHeight * 0.08 : deviceHeight * 0.1111 )}}/>
// 				<Tabs screenProps={{...screenProps, intl: this.props.intl}} onNavigationStateChange={this.onNavigationStateChange}/>
// 			</SafeAreaView>
// 		);
// 	}
// }

// function mapStateToProps(store: Object, ownProps: Object): Object {
// 	const { allIds, toActivate } = store.gateways;
// 	return {
// 		stackNavigator: ownProps.navigation,
// 		tab: store.navigation.tab,
// 		userIcon: false,
// 		userProfile: getUserProfile(store),
// 		appLayout: store.App.layout,
// 		gateways: allIds,
// 		gatewaysToActivate: toActivate,
// 	};
// }

// function mapDispatchToProps(dispatch: Function): Object {
// 	return {
// 		onTabSelect: (tab: string) => {
// 			dispatch(syncWithServer(tab));
// 			dispatch(switchTab(tab));
// 		},
// 		onToggleEditMode: (tab: string) => {
// 			dispatch(toggleEditMode(tab));
// 		},
// 		addNewLocation: (): Function => {
// 			return dispatch(addNewGateway());
// 		},
// 		dispatch,
// 	};
// }

module.exports = TabsView;
