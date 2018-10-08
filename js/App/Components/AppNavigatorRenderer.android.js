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
import { connect } from 'react-redux';
import { NetInfo } from 'react-native';
import Toast from 'react-native-simple-toast';
import DrawerLayoutAndroid from 'DrawerLayoutAndroid';
import { announceForAccessibility } from 'react-native-accessibility';
const isEqual = require('react-fast-compare');
import { intlShape, injectIntl } from 'react-intl';

import { View, Header, IconTelldus } from '../../BaseComponents';
import Navigator from './AppNavigator';
import { DimmerPopup } from './TabViews/SubViews';
import DimmerStep from './TabViews/SubViews/Device/DimmerStep';
import UserAgreement from './UserAgreement/UserAgreement';
import Drawer from './Drawer/Drawer';

import {
	getUserProfile,
	appStart,
	appState,
	syncLiveApiOnForeground,
	getAppData,
	getGateways,
	hideToast,
	resetSchedule,
	autoDetectLocalTellStick,
	setAppLayout,
	resetLocalControlSupport,
	showToast,
	addNewGateway,
	syncWithServer,
	switchTab,
	closeUDPSocket,
} from '../Actions';
import { hideDimmerStep } from '../Actions/Dimmer';
import { configureAndroid } from '../Actions/Widget';
import { getUserProfile as getUserProfileSelector } from '../Reducers/User';
import {
	getRSAKey,
	setTopLevelNavigator,
	navigate,
	getDrawerWidth,
	getRouteName,
	shouldUpdate,
} from '../Lib';

import i18n from '../Translations/common';

type Props = {
	dimmer: Object,
	showEULA: boolean,
	showToast: boolean,
	messageToast: string,
	durationToast: string,
	positionToast: string,
	screenReaderEnabled: boolean,
	addNewGatewayBool: boolean,
	intl: intlShape.isRequired,

	dispatch: Function,
	syncGateways: () => void,
	onTabSelect: (string) => void,
	onNavigationStateChange: (string) => void,
	addNewLocation: () => any,
};

type State = {
	currentScreen: string,
	drawer: boolean,
	addingNewLocation: boolean,
};

class AppNavigatorRenderer extends View<Props, State> {

	props: Props;
	state: State;

	onNavigationStateChange: (Object, Object) => void;
	onDoneDimming: (Object) => void;
	autoDetectLocalTellStick: () => void;
	handleConnectivityChange: () => void;
	onLayout: (Object) => void;
	setNavigatorRef: (any) => void;

	renderNavigationView: () => Object;
	onOpenSetting: () => void;
	openDrawer: () => void;
	addNewLocation: () => void;
	onPressGateway: (Object) => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			currentScreen: 'Dashboard',
			drawer: false,
			addingNewLocation: false,
		};

		const { formatMessage } = props.intl;

		this.labelButton = formatMessage(i18n.button);
		this.labelButtondefaultDescription = formatMessage(i18n.defaultDescriptionButton);

		this.menuIcon = `${formatMessage(i18n.menuIcon)} ${this.labelButton}. ${this.labelButtondefaultDescription}`;
		this.starIconShowDevices = `${formatMessage(i18n.starIconShowDevices)}. ${this.labelButtondefaultDescription}`;
		this.starIconHideDevices = `${formatMessage(i18n.starIconHideDevices)}. ${this.labelButtondefaultDescription}`;
		this.starIconShowSensors = `${formatMessage(i18n.starIconShowSensors)}. ${this.labelButtondefaultDescription}`;
		this.starIconHideSensors = `${formatMessage(i18n.starIconHideSensors)}. ${this.labelButtondefaultDescription}`;
		this.messageCloseMenu = `${formatMessage(i18n.messageCloseMenu)}`;

		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;
		this.addNewLocationFailed = `${formatMessage(i18n.addNewLocationFailed)}`;

		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
		this.onDoneDimming = this.onDoneDimming.bind(this);

		this.timeOutConfigureLocalControl = null;
		this.timeOutGetLocalControlToken = null;
		this.autoDetectLocalTellStick = this.autoDetectLocalTellStick.bind(this);
		this.onLayout = this.onLayout.bind(this);
		this.handleConnectivityChange = this.handleConnectivityChange.bind(this);

		this.setNavigatorRef = this.setNavigatorRef.bind(this);

		this.renderNavigationView = this.renderNavigationView.bind(this);
		this.onOpenSetting = this.onOpenSetting.bind(this);
		this.onCloseDrawer = this.onCloseDrawer.bind(this);
		this.onOpenDrawer = this.onOpenDrawer.bind(this);
		this.openDrawer = this.openDrawer.bind(this);
		this.addNewLocation = this.addNewLocation.bind(this);
		this.onPressGateway = this.onPressGateway.bind(this);

		getRSAKey(true);

		const { appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceHeight = isPortrait ? height : width;
		const size = Math.floor(deviceHeight * 0.03);

		let fontSize = size < 20 ? 20 : size;
		this.settingsButton = {
			component: <IconTelldus icon={'settings'} style={{
				fontSize,
				color: '#fff',
			}}/>,
			onPress: this.onOpenSetting,
		};

		this.menuButton = {
			icon: {
				name: 'bars',
				size: 22,
				color: '#fff',
				style: null,
				iconStyle: null,
			},
			onPress: this.openDrawer,
			accessibilityLabel: '',
		};
	}

	componentDidMount() {
		this.props.dispatch(appStart());
		this.props.dispatch(appState());
		this.props.dispatch(configureAndroid());
		// Calling other API requests after resolving the very first one, in order to avoid the situation, where
		// access_token has expired and the API requests, all together goes for fetching new token with refresh_token,
		// and results in generating multiple tokens.
		const { dispatch } = this.props;
		dispatch(getUserProfile()).then(() => {
			dispatch(syncLiveApiOnForeground());
			dispatch(getGateways());
			dispatch(getAppData());
			dispatch(resetSchedule());

			// Auto discover TellStick's that support local control.
			this.autoDetectLocalTellStick();
		});

		NetInfo.addEventListener(
			'connectionChange',
			this.handleConnectivityChange,
		);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const isStateEqual = isEqual(this.state, nextState);
		if (!isStateEqual) {
			return true;
		}

		const { appLayout, showEULA, showToast: showToastBool, ...others } = this.props;
		const { appLayout: appLayoutN, showEULAN, showToast: showToastN, ...othersN } = nextProps;
		if ((appLayout.width !== appLayoutN.width) || (showEULA !== showEULAN) || (showToastBool !== showToastN)) {
			return true;
		}

		const propsChange = shouldUpdate(others, othersN, ['dimmer']);
		if (propsChange) {
			return true;
		}

		return false;
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		const {
			showToast: showToastBool,
			messageToast,
			durationToast,
			positionToast,
			intl,
			addNewGatewayBool,
		} = this.props;
		if (showToastBool && !prevProps.showToast) {
			const { formatMessage } = intl;
			const message = messageToast ? messageToast : formatMessage(i18n.errortoast);
			this._showToast(message, durationToast, positionToast);
		}
		if (addNewGatewayBool && !this.state.addingNewLocation) {
			this.addNewLocation();
		}
	}

	addNewLocation() {
		this.setState({
			addingNewLocation: true,
			addNewGateway: false,
		});
		if (this.state.drawer) {
			this.closeDrawer();
		}
		this.props.addNewLocation()
			.then((response: Object) => {
				if (response.client) {
					navigate('AddLocation', {clients: response.client}, 'AddLocation');
				}
			}).catch((error: Object) => {
				this.setState({
					addingNewLocation: false,
				});
				let message = error.message && error.message === 'Network request failed' ? this.networkFailed : this.addNewLocationFailed;
				this.props.dispatch(showToast(message));
			});
	}

	onOpenDrawer() {
		this.setState({ drawer: true });
		if (this.props.screenReaderEnabled) {
			announceForAccessibility(this.messageCloseMenu);
		}
	}

	closeDrawer() {
		this.refs.drawer.closeDrawer();
	}

	onCloseDrawer() {
		this.setState({ drawer: false });
	}

	onPressGateway(location: Object) {
		this.closeDrawer();
		navigate('LocationDetails', {location}, 'LocationDetails');
	}

	onOpenSetting() {
		this.closeDrawer();
		navigate('Settings', {}, 'Settings');
	}

	handleConnectivityChange(connectionInfo: Object) {
		const { dispatch } = this.props;
		const { type } = connectionInfo;

		// When ever user's connection change reset the previously auto-discovered ip address, before it is auto-discovered and updated again.
		dispatch(resetLocalControlSupport());

		// When user's connection change and if it there is connection to internet, auto-discover TellStick and update it's ip address.
		if (type && type !== 'none') {
			dispatch(autoDetectLocalTellStick());
		}
	}

	// Sends UDP package to the broadcast IP to detect gateways connected in the same LAN.
	autoDetectLocalTellStick() {
		const { dispatch } = this.props;
		this.timeOutConfigureLocalControl = setTimeout(() => {
			dispatch(autoDetectLocalTellStick());
		}, 15000);
	}

	componentWillUnmount() {
		clearTimeout(this.timeOutConfigureLocalControl);
		clearTimeout(this.timeOutGetLocalControlToken);
		NetInfo.removeEventListener(
			'connectionChange',
			this.handleConnectivityChange,
		);
		closeUDPSocket();
	}

	_showToast(message: string, durationToast: any, positionToast: any) {
		Toast.showWithGravity(message, Toast[durationToast], Toast[positionToast]);
		this.props.dispatch(hideToast());
	}

	onNavigationStateChange(prevState: Object, currentState: Object) {
		const currentScreen = getRouteName(currentState);
		this.setState({ currentScreen });

		this.props.onNavigationStateChange(currentScreen);
	}

	onDoneDimming() {
		this.props.dispatch(hideDimmerStep());
	}

	onLayout(ev: Object) {
		this.props.dispatch(setAppLayout(ev.nativeEvent.layout));
	}

	setNavigatorRef(navigatorRef: any) {
		setTopLevelNavigator(navigatorRef);
	}

	openDrawer() {
		this.refs.drawer.openDrawer();
		this.props.syncGateways();
	}

	renderNavigationView(): Object {
		const { appLayout} = this.props;

		return <Drawer
			addNewLocation={this.addNewLocation}
			onOpenSetting={this.onOpenSetting}
			appLayout={appLayout}
			isOpen={this.state.drawer}
			onPressGateway={this.onPressGateway}
		/>;
	}

	makeLeftButton(styles: Object): any {
		const { drawer } = this.state;
		const { screenReaderEnabled } = this.props;
		this.menuButton.icon.style = styles.menuButtonStyle;
		this.menuButton.icon.iconStyle = styles.menuIconStyle;
		this.menuButton.icon.size = styles.buttonSize > 22 ? styles.buttonSize : 22;
		this.menuButton.accessibilityLabel = this.menuIcon;

		return (drawer && screenReaderEnabled) ? null : this.menuButton;
	}

	render(): Object {
		const { currentScreen: CS, drawer } = this.state;
		const { intl, dimmer, showEULA, appLayout, screenReaderEnabled } = this.props;
		const screenProps = {
			currentScreen: CS,
			intl,
			drawer,
			appLayout,
		};
		const { show, name, value, showStep, deviceStep } = dimmer;
		const importantForAccessibility = showStep ? 'no-hide-descendants' : 'no';

		const styles = this.getStyles(appLayout);

		const leftButton = this.makeLeftButton(styles);
		const drawerWidth = getDrawerWidth(styles.deviceWidth);

		const showHeader = CS === 'Tabs' || CS === 'Devices' || CS === 'Sensors' ||
			CS === 'Dashboard' || CS === 'Scheduler' || CS === 'Gateways';

		return (
			<DrawerLayoutAndroid
				ref="drawer"
				drawerWidth={drawerWidth}
				drawerPosition={DrawerLayoutAndroid.positions.Left}
				renderNavigationView={this.renderNavigationView}
				drawerBackgroundColor={'transparent'}
				onDrawerOpen={this.onOpenDrawer}
				onDrawerClose={this.onCloseDrawer}
			>
				{showHeader && (
					<Header style={styles.header} logoStyle={styles.logoStyle} leftButton={leftButton}/>
				)}
				<View style={showHeader ? styles.container : {flex: 1}} importantForAccessibility={importantForAccessibility}>
					<Navigator
						ref={this.setNavigatorRef}
						onNavigationStateChange={this.onNavigationStateChange}
						screenProps={screenProps} />
					<DimmerPopup
						isVisible={show}
						name={name}
						value={value / 255}
					/>
				</View>
				{screenReaderEnabled && (
					<DimmerStep
						showModal={showStep}
						deviceId={deviceStep}
						onDoneDimming={this.onDoneDimming}
						intl={intl}
					/>
				)}
				<UserAgreement showModal={showEULA} onLayout={this.onLayout}/>
			</DrawerLayoutAndroid>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceHeight = isPortrait ? height : width;
		const deviceWidth = isPortrait ? width : height;

		return {
			deviceWidth,
			header: isPortrait ? {
				height: deviceHeight * 0.05,
				alignItems: 'flex-end',
			} : {
				transform: [{rotateZ: '-90deg'}],
				position: 'absolute',
				left: -deviceHeight * 0.4444,
				top: deviceHeight * 0.4444,
				width: deviceHeight,
				height: deviceHeight * 0.1111,
			},
			container: {
				flex: 1,
				marginLeft: isPortrait ? 0 : deviceHeight * 0.11,
			},
			buttonSize: isPortrait ? Math.floor(width * 0.04) : Math.floor(height * 0.04),
			menuButtonStyle: isPortrait ? null : {
				position: 'absolute',
				left: undefined,
				right: 50,
				top: deviceHeight * 0.03666,
				paddingTop: 0,
				paddingHorizontal: 0,
			},
			starButtonStyle: isPortrait ? null : {
				position: 'absolute',
				right: height - 50,
				top: deviceHeight * 0.03666,
				paddingTop: 0,
				paddingHorizontal: 0,
			},
			menuIconStyle: isPortrait ? null : {
				transform: [{rotateZ: '90deg'}],
			},
			logoStyle: isPortrait ? null : {
				position: 'absolute',
				left: deviceHeight * 0.6255,
				top: deviceHeight * 0.0400,
			},
		};
	}
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	const {
		showToast: showToastBool,
		messageToast,
		durationToast,
		positionToast,
		layout,
		screenReaderEnabled,
	} = state.app;
	const { allIds, toActivate } = state.gateways;

	const addNewGatewayBool = allIds.length === 0 && toActivate.checkIfGatewaysEmpty;

	return {
		addNewGatewayBool,
		screenReaderEnabled,
		messageToast,
		durationToast,
		positionToast,
		showToast: showToastBool,
		showEULA: !getUserProfileSelector(state).eula,
		dimmer: state.dimmer,
		appLayout: layout,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
		syncGateways: () => {
			dispatch(syncWithServer('gatewaysTab'));
		},
		onNavigationStateChange: (tab: string) => {
			dispatch(syncWithServer(tab));
			dispatch(switchTab(tab));
		},
		addNewLocation: (): Function => {
			return dispatch(addNewGateway());
		},
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(AppNavigatorRenderer));
