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
 * @providesModule DeviceDetailsTabsView
 */

// @flow

'use strict';

import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { connect } from 'react-redux';

import { Text, View, Image } from 'BaseComponents';

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icon_settings from './../../../TabViews/img/selection.json';
const Icon = createIconSetFromIcoMoon(icon_settings);

import DeviceDetailsTabView from 'DeviceDetailsTabView';
import { TabNavigator, StackNavigator } from 'react-navigation';
let deviceHeight = Dimensions.get('window').height;
let deviceWidth = Dimensions.get('window').width;

type Props = {
	dispatch: Function,
	device: Object,
	stackNavigator: Object,
};

type State = {
};

class DeviceDetailsTabsView extends View {
	props: Props;
	state: State;

	constructor(props: Props) {
		super(props);
		this.goBack = this.goBack.bind(this);
	}

	goBack() {
		this.props.stackNavigator.goBack();
	}

	render() {
		let screenProps = { device: this.props.device };
		return (
			<View style={styles.container}>
					<Image style={styles.deviceIconBackG} resizeMode={'stretch'} source={require('./../../../TabViews/img/telldus-geometric-header-bg.png')}>
						<View style={styles.deviceIconBackground}>
							<Icon name="icon_device_alt" size={36} color={'#F06F0C'} />
						</View>
						<Text style={styles.textDeviceName}>
						{this.props.device.name}
						</Text>
					</Image>
                <View style={{ height: (deviceHeight * 0.72) - 20 }}>
                   <Tabs screenProps={screenProps}/>
                </View>
            </View>
		);
	}
}
const styles = StyleSheet.create({
	container: {
	},
	deviceIconBackG: {
		height: (deviceHeight * 0.2),
		width: deviceWidth,
		alignItems: 'center',
		justifyContent: 'center',
	},
	icon: {
		width: 15,
		height: 15,
	},
	textDeviceName: {
		fontSize: 18,
		color: '#fff',
	},
	deviceIconBackground: {
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
		width: (deviceWidth * 0.17),
		height: (deviceHeight * 0.1),
		borderRadius: 29,
	},
});

const OverviewNavigationOptions = {
	navigationOptions: {
		tabBarIcon: ({ tintColor }) => (
                <Icon name="icon_home" size={24} color={tintColor} />
            ),
		headerStyle: {
			height: 2,
		},
	},
};
const HistoryNavigationOptions = {
	navigationOptions: {
		tabBarIcon: ({ tintColor }) => (
                <Icon name="icon_history" size={24} color={tintColor}/>
            ),
		headerStyle: {
			height: 2,
		},
	},
};
const SettingsNavigationOptions = {
	navigationOptions: {
		tabBarIcon: ({ tintColor }) => (
                <Icon name="icon_settings" size={24} color={tintColor}/>
            ),
		headerStyle: {
			height: 2,
		},
	},
};

const OverviewNavigator = StackNavigator({
	Overview: { screen: DeviceDetailsTabView.Overview },
}, OverviewNavigationOptions);
const HistoryNavigator = StackNavigator({
	History: { screen: DeviceDetailsTabView.History },
}, HistoryNavigationOptions);
const SettingsNavigator = StackNavigator({
	Settings: { screen: DeviceDetailsTabView.Settings },
}, SettingsNavigationOptions);

const Tabs = TabNavigator(
	{
		Overview: {
			screen: OverviewNavigator,
		},
		History: {
			screen: HistoryNavigator,
		},
		Settings: {
			screen: SettingsNavigator,
		},
	},
	{
		initialRouteName: 'Overview',
		swipeEnabled: true,
		lazy: true,
		animationEnabled: true,
		tabBarOptions: {
			indicatorStyle: {
				backgroundColor: '#fff',
			},
			scrollEnabled: true,
			labelStyle: {
				fontSize: Math.round(Dimensions.get('window').width / 35),
			},
			style: {
				backgroundColor: '#fff',
				shadowColor: '#000000',
				shadowOpacity: 1.0,
				elevation: 2,
			},
			tabStyle: {
				width: Dimensions.get('window').width / 3,
				flexDirection: 'row',
			},
			iconStyle: {
				width: 25,
				height: 25,
			},
			activeTintColor: '#F06F0C',
			inactiveTintColor: '#A59F9A',
			showIcon: true,
		},
	}
);

function mapStateToProps(store, ownprops) {
	return {
		stackNavigator: ownprops.navigation,
		device: store.devices.byId[ownprops.navigation.state.params.id],
	};
}
function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(DeviceDetailsTabsView);
