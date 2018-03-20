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

import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';
import { TabNavigator } from 'react-navigation';
import { ifIphoneX, isIphoneX } from 'react-native-iphone-x-helper';

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icon_settings from '../TabViews/img/selection.json';
const CustomIcon = createIconSetFromIcoMoon(icon_settings);

import { NavigationHeader } from './SubViews';
import History from './HistoryTab';
import Overview from './OverviewTab';
import Settings from './SettingsTab';
import { Text, View, Poster, SafeAreaView } from '../../../BaseComponents';
import { getWindowDimensions, getRelativeDimensions } from '../../Lib';
import { closeDatabase } from '../../Actions/LocalStorage';
import i18n from '../../Translations/common';
import Theme from '../../Theme';

type Props = {
	dispatch: Function,
	device: Object,
	stackNavigator: Object,
	intl: intlShape.isRequired,
	appLayout: Object,
	screenProps: Object,
};

type State = {
	currentTab: string,
};

class DeviceDetails extends View {
	props: Props;
	state: State;

	goBack: () => void;
	onNavigationStateChange: (Object, Object) => void;
	getRouteName: (Object) => string | null;

	constructor(props: Props) {
		super(props);
		this.state = {
			currentTab: 'Overview',
		};
		this.goBack = this.goBack.bind(this);
		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);

		this.isTablet = DeviceInfo.isTablet();

		let { formatMessage } = props.intl;

		this.defaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
		this.labelLeftIcon = `${formatMessage(i18n.navigationBackButton)} .${this.defaultDescription}`;
	}

	getRouteName(navigationState: Object): string | null {
		if (!navigationState) {
			return null;
		}
		const route = navigationState.routes[navigationState.index];
		// dive into nested navigators
		if (route.routes) {
			return this.getRouteName(route);
		}
		return route.routeName;
	}

	onNavigationStateChange(prevState: Object, currentState: Object) {
		const currentScreen = this.getRouteName(currentState);
		this.setState({
			currentTab: currentScreen,
		});
	}

	goBack() {
		this.props.stackNavigator.goBack();
	}

	componentWillUnmount() {
		closeDatabase();
	}

	render(): Object {
		let { appLayout, stackNavigator } = this.props;
		let { currentScreen } = this.props.screenProps;
		let screenProps = {
			device: this.props.device,
			currentTab: this.state.currentTab,
			intl: this.props.intl,
			currentScreen,
		};
		let isPortrait = appLayout.height > appLayout.width;

		let {
			posterCover,
			iconBackground,
			deviceIcon,
			textDeviceName,
		} = this.getStyles(appLayout);

		return (
			<SafeAreaView>
				<NavigationHeader navigation={stackNavigator}/>
				<Poster>
					<View style={posterCover}>
						{(!this.isTablet) && (!isPortrait) &&
							<TouchableOpacity
								style={styles.backButtonLand}
								onPress={this.goBack}
								accessibilityLabel={this.labelLeftIcon}>
								<Icon name="arrow-back" size={appLayout.width * 0.047} color="#fff"/>
							</TouchableOpacity>
						}
						<View style={iconBackground}>
							<CustomIcon name="icon_device_alt" size={deviceIcon.size} color={'#F06F0C'} />
						</View>
						<Text style={textDeviceName}>
							{this.props.device.name}
						</Text>
					</View>
				</Poster>
				<View style={{flex: 1}}>
					{isIphoneX() && (
						<View style={{height: 10, backgroundColor: '#fff'}}/>
					)}
					<Tabs screenProps={screenProps} onNavigationStateChange={this.onNavigationStateChange} />
				</View>
			</SafeAreaView>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = getRelativeDimensions(appLayout);
		const isPortrait = height > width;

		return {
			posterCover: {
				position: 'absolute',
				top: 0,
				left: 0,
				bottom: 0,
				right: 0,
				alignItems: 'center',
				justifyContent: 'center',
			},
			iconBackground: {
				backgroundColor: '#fff',
				alignItems: 'center',
				justifyContent: 'center',
				width: isPortrait ? height * 0.12 : width * 0.10,
				height: isPortrait ? height * 0.12 : width * 0.10,
				borderRadius: isPortrait ? height * 0.06 : width * 0.05,
			},
			deviceIcon: {
				size: isPortrait ? height * 0.08 : width * 0.06,
			},
			textDeviceName: {
				fontSize: isPortrait ? width * 0.05 : height * 0.05,
				color: '#fff',
			},
		};
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	backButtonLand: {
		position: 'absolute',
		alignItems: 'flex-start',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		left: 10,
		top: 10,
	},
});

const Tabs = TabNavigator(
	{
		Overview: {
			screen: Overview,
		},
		History: {
			screen: History,
		},
		Settings: {
			screen: Settings,
		},
	},
	{
		initialRouteName: 'Overview',
		tabBarPosition: 'top',
		tabBarOptions: {
			indicatorStyle: {
				backgroundColor: '#fff',
			},
			style: {
				backgroundColor: '#fff',
				...ifIphoneX({ height: 40 }, {height: getWindowDimensions().height * 0.085}),
				...Theme.Core.shadow,
				alignItems: 'center',
				justifyContent: 'center',
				borderTopColor: 'transparent',
			},
			tabStyle: {
				...ifIphoneX({ marginTop: 14 }),
				alignItems: 'center',
				justifyContent: 'center',
			},
			swipeEnabled: true,
			lazy: true,
			animationEnabled: true,
			upperCaseLabel: false,
			scrollEnabled: true,
			activeTintColor: '#F06F0C',
			inactiveTintColor: '#A59F9A',
			showIcon: false,
		},
	}
);

function mapStateToProps(store: Object, ownProps: Object): Object {
	return {
		stackNavigator: ownProps.navigation,
		device: store.devices.byId[ownProps.navigation.state.params.id],
		appLayout: store.App.layout,
		isModalOpen: store.modal.openModal,
	};
}
function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(DeviceDetails));
