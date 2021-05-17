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
 */

// @flow

'use strict';

import React from 'react';
import {
	LayoutAnimation,
	DrawerLayoutAndroid,
	BackHandler,
} from 'react-native';
import { connect } from 'react-redux';
import { announceForAccessibility } from 'react-native-accessibility';
const isEqual = require('react-fast-compare');
import {
	View,
	MainTabNavHeader,
} from '../../BaseComponents';
import AppNavigator from './AppNavigator';
import Drawer from './Drawer/Drawer';

import {
	syncWithServer,
} from '../Actions';
import {
	navigate,
	getDrawerWidth,
	LayoutAnimations,
	shouldUpdate,
} from '../Lib';
import i18n from '../Translations/common';
import Theme from '../Theme';

type Props = {
	screenReaderEnabled: boolean,
	appLayout: Object,
	currentScreen: string,
	hasGateways: boolean,
	hiddenTabsCurrentUser: Array<string>,
	defaultStartScreenKey: string,

	intl: Object,
	dispatch: Function,
	syncGateways: () => void,
	onTabSelect: (string) => void,
	addNewLocation: () => any,
	addNewDevice: () => void,
	toggleDialogueBox: (Object) => void,
	navigateToCampaign: () => void,
	addNewSensor: () => void,
	showSwitchAccountActionSheet: () => void,
	toggleDrawerState: (boolean) => void,
};

type State = {
	drawer: boolean,
	showAttentionCaptureAddDevice: boolean,
	addNewDevicePressed: boolean,
};

class AppNavigatorRenderer extends View<Props, State> {

	props: Props;
	state: State;

	autoDetectLocalTellStick: () => void;

	renderNavigationView: () => Object;
	onOpenSetting: () => void;
	openDrawer: () => void;
	addNewLocation: () => void;
	onPressGateway: (Object) => void;
	toggleAttentionCapture: (boolean) => void;

	addNewDevice: () => void;
	addNewSensor: () => void;

	timeoutCloseDrawer: any;

	constructor(props: Props) {
		super(props);

		this.state = {
			drawer: false,
			showAttentionCaptureAddDevice: false,
			addNewDevicePressed: false,
		};

		const { formatMessage } = props.intl;

		this.labelButton = formatMessage(i18n.button);
		this.labelButtondefaultDescription = formatMessage(i18n.defaultDescriptionButton);

		this.messageCloseMenu = `${formatMessage(i18n.messageCloseMenu)}`;

		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;
		this.addNewLocationFailed = `${formatMessage(i18n.addNewLocationFailed)}`;

		this.timeoutCloseDrawer = null;

		this.backHandler = BackHandler.addEventListener(
			'hardwareBackPress',
			this.backAction
		  );
	}

	backAction = (): boolean => {
		if (this.state.drawer) {
			this.closeDrawer();
			return true;
		}
		return false;
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const isStateEqual = isEqual(this.state, nextState);
		if (!isStateEqual) {
			return true;
		}

		return shouldUpdate(this.props, nextProps, [
			'appLayout',
			'currentScreen',
			'screenReaderEnabled',
			'hasGateways',
			'hiddenTabsCurrentUser',
			'defaultStartScreenKey',
		]);
	}

	componentWillUnmount() {
		if (this.timeoutCloseDrawer) {
			clearTimeout(this.timeoutCloseDrawer);
		}
		if (this.backHandler && this.backHandler.remove) {
			this.backHandler.remove();
		}
	}

	addNewLocation = () => {
		if (this.state.drawer) {
			this.closeDrawer();
		}
		this.props.addNewLocation();
	}

	onOpenDrawer = () => {
		this.props.toggleDrawerState(true);
		this.setState({ drawer: true });
		if (this.props.screenReaderEnabled) {
			announceForAccessibility(this.messageCloseMenu);
		}
	}

	showSwitchAccountActionSheet = () => {
		this.closeDrawer();
		this.timeoutCloseDrawer = setTimeout(() => {
			this.props.showSwitchAccountActionSheet();
			this.timeoutCloseDrawer = null;
		}, 300);
	}

	closeDrawer = () => {
		this.refs.drawer.closeDrawer();
	}

	onCloseDrawer = () => {
		this.props.toggleDrawerState(false);
		this.setState({ drawer: false });
	}

	onPressGateway = (location: Object) => {
		this.closeDrawer();
		navigate('LocationDetails', {
			screen: 'Details',
			params: {
				location,
			},
			location,
		});
	}

	onOpenSetting = (tabName?: string) => {
		this.closeDrawer();
		if (tabName) {
			navigate('Profile', {
				screen: tabName,
			});
		} else {
			navigate('Profile');
		}
	}

	addNewDevice = () => {
		this.setState({
			addNewDevicePressed: true,
		}, () => {
			this.props.addNewDevice();
		});
	}

	addNewSensor = () => {
		this.setState({
			addNewSensorPressed: true,
		}, () => {
			this.props.addNewSensor();
		});
	}

	openDrawer = () => {
		this.refs.drawer.openDrawer();
		this.props.syncGateways();
	}

	renderNavigationView = (): Object => {
		const { appLayout, toggleDialogueBox, intl } = this.props;

		return <Drawer
			addNewLocation={this.addNewLocation}
			onOpenSetting={this.onOpenSetting}
			appLayout={appLayout}
			isOpen={this.state.drawer}
			onPressGateway={this.onPressGateway}
			closeDrawer={this.closeDrawer}
			showSwitchAccountActionSheet={this.showSwitchAccountActionSheet}
			toggleDialogueBox={toggleDialogueBox}
			intl={intl}
		/>;
	}

	toggleAttentionCapture = (value: boolean) => {
		if (!this.state.addNewDevicePressed) {
			LayoutAnimation.configureNext(LayoutAnimations.linearU(500));
		}
		this.setState({
			showAttentionCaptureAddDevice: value,
		}, () => {
			// This is to prevent same layout animation occuring on navigation(next layout)
			// Since LayoutAnimationEnd Callback only available in iOS
			LayoutAnimation.configureNext(null);
		});
	}

	showAttentionCapture(): boolean {
		const { showAttentionCaptureAddDevice, addNewDevicePressed } = this.state;
		const { currentScreen, hasGateways } = this.props;

		return (currentScreen === 'Devices') && hasGateways && showAttentionCaptureAddDevice && !addNewDevicePressed;
	}

	render(): Object {
		const { drawer, showAttentionCaptureAddDevice } = this.state;
		const {
			intl,
			appLayout,
			screenReaderEnabled,
			toggleDialogueBox,
			currentScreen: CS,
			hiddenTabsCurrentUser,
			defaultStartScreenKey,
		} = this.props;

		const styles = this.getStyles(appLayout);

		const drawerWidth = getDrawerWidth(styles.deviceWidth);

		const showHeader = CS === 'Tabs' || CS === 'Devices' || CS === 'Sensors' ||
			CS === 'Dashboard' || CS === 'Scheduler' || CS === 'Gateways';

		const showAttentionCapture = this.showAttentionCapture();

		const MainNavHeaderProps = {
			addNewSensor: this.addNewSensor,
			addNewDevice: this.addNewDevice,
			addNewLocation: this.addNewLocation,
			showAttentionCapture,
			openDrawer: this.openDrawer,
			drawer,
			screenReaderEnabled,
		};

		let screenProps = {
			intl,
			appLayout,
			toggleDialogueBox,
			hideHeader: !styles.isPortrait, // Hide Stack Nav Header, show custom Header
			toggleAttentionCapture: this.toggleAttentionCapture,
			showAttentionCaptureAddDevice,
			source: 'postlogin',
			...MainNavHeaderProps,
			hiddenTabsCurrentUser,
			defaultStartScreenKey,
		};

		return (
			<DrawerLayoutAndroid
				ref="drawer"
				drawerWidth={drawerWidth}
				drawerPosition={'left'}
				renderNavigationView={this.renderNavigationView}
				drawerBackgroundColor={'transparent'}
				onDrawerOpen={this.onOpenDrawer}
				onDrawerClose={this.onCloseDrawer}
			>
				{showHeader && !styles.isPortrait && (
					<MainTabNavHeader
						{...MainNavHeaderProps}/>
				)}
				<View style={showHeader ? styles.container : {flex: 1}}>
					<AppNavigator
						screenProps={screenProps}/>
				</View>
			</DrawerLayoutAndroid>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceHeight = isPortrait ? height : width;
		const deviceWidth = isPortrait ? width : height;

		const {
			headerHeightFactor,
		} = Theme.Core;

		const { land } = headerHeightFactor;

		return {
			deviceWidth,
			container: {
				flex: 1,
				marginLeft: isPortrait ? 0 : Math.floor(deviceHeight * land),
			},
			isPortrait,
		};
	}
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	const {
		layout,
		screenReaderEnabled,
	} = state.app;

	const {
		userId = '',
	} = state.user;

	const {
		hiddenTabs = {},
		defaultStartScreen = {},
	} = state.navigation;

	const hiddenTabsCurrentUser = hiddenTabs[userId] || [];

	const defaultStartScreenCurrentUser = defaultStartScreen[userId] || {};

	return {
		screenReaderEnabled,
		appLayout: layout,
		currentScreen: state.navigation.screen,
		hiddenTabsCurrentUser,
		defaultStartScreenKey: defaultStartScreenCurrentUser.screenKey,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
		syncGateways: () => {
			dispatch(syncWithServer('gatewaysTab'));
		},
	};
}

module.exports = (connect(mapStateToProps, mapDispatchToProps)(AppNavigatorRenderer): Object);
