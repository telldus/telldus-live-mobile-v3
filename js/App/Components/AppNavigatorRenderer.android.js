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
import { LayoutAnimation, DrawerLayoutAndroid } from 'react-native';
import { connect } from 'react-redux';
import { announceForAccessibility } from 'react-native-accessibility';
const isEqual = require('react-fast-compare');
import { intlShape } from 'react-intl';
import {
	View,
	MainTabNavHeader,
	Image,
} from '../../BaseComponents';
import AppNavigator from './AppNavigator';
import Drawer from './Drawer/Drawer';

import {
	syncWithServer,
	resetSchedule,
} from '../Actions';
import {
	navigate,
	getDrawerWidth,
	LayoutAnimations,
	shouldUpdate,
} from '../Lib';
import Theme from '../Theme';
import i18n from '../Translations/common';

type Props = {
	screenReaderEnabled: boolean,
	appLayout: Object,
	currentScreen: string,
	hasGateways: boolean,

	intl: intlShape.isRequired,
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
	newSchedule: () => void;
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

		this.starIconShowDevices = `${formatMessage(i18n.starIconShowDevices)}. ${this.labelButtondefaultDescription}`;
		this.starIconHideDevices = `${formatMessage(i18n.starIconHideDevices)}. ${this.labelButtondefaultDescription}`;
		this.starIconShowSensors = `${formatMessage(i18n.starIconShowSensors)}. ${this.labelButtondefaultDescription}`;
		this.starIconHideSensors = `${formatMessage(i18n.starIconHideSensors)}. ${this.labelButtondefaultDescription}`;
		this.messageCloseMenu = `${formatMessage(i18n.messageCloseMenu)}`;

		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;
		this.addNewLocationFailed = `${formatMessage(i18n.addNewLocationFailed)}`;

		this.renderNavigationView = this.renderNavigationView.bind(this);
		this.onOpenSetting = this.onOpenSetting.bind(this);
		this.addNewLocation = this.addNewLocation.bind(this);
		this.onPressGateway = this.onPressGateway.bind(this);

		this.addNewDevice = this.addNewDevice.bind(this);

		this.newSchedule = this.newSchedule.bind(this);
		this.toggleAttentionCapture = this.toggleAttentionCapture.bind(this);

		this.timeoutCloseDrawer = null;
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
		]);
	}

	componentWillUnmount() {
		if (this.timeoutCloseDrawer) {
			clearTimeout(this.timeoutCloseDrawer);
		}
	}

	addNewLocation() {
		if (this.state.drawer) {
			this.closeDrawer();
		}
		this.props.addNewLocation();
	}

	newSchedule() {
		this.props.dispatch(resetSchedule());
		navigate('Schedule', {
			editMode: false,
			screen: 'Device',
			params: {
				editMode: false,
			},
		});
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

	onPressGateway(location: Object) {
		this.closeDrawer();
		navigate('LocationDetails', {
			screen: 'Details',
			params: {
				location,
			},
			location,
		});
	}

	onOpenSetting(tabName?: string) {
		this.closeDrawer();
		if (tabName) {
			navigate('Profile', {
				screen: tabName,
			});
		} else {
			navigate('Profile');
		}
	}

	addNewDevice() {
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

	makeRightButton(CS: string, styles: Object): Object | null {
		this.AddButton = {
			component: <Image source={{uri: 'icon_plus'}} style={styles.addIconStyle}/>,
			style: styles.rightButtonStyle,
			onPress: () => {},
		};
		const { intl, hasGateways } = this.props;
		const { formatMessage } = intl;
		switch (CS) {
			case 'Devices':
				if (!hasGateways) {
					return null;
				}
				return {
					...this.AddButton,
					onPress: this.addNewDevice,
					accessibilityLabel: `${formatMessage(i18n.labelAddNewDevice)}, ${formatMessage(i18n.defaultDescriptionButton)}`,
				};
			case 'Sensors':
				if (!hasGateways) {
					return null;
				}
				return {
					...this.AddButton,
					onPress: this.addNewSensor,
					accessibilityLabel: `${formatMessage(i18n.labelAddNewSensor)}, ${formatMessage(i18n.defaultDescriptionButton)}`,
				};
			case 'Gateways':
				return {
					...this.AddButton,
					onPress: this.addNewLocation,
					accessibilityLabel: `${formatMessage(i18n.addNewLocation)}, ${formatMessage(i18n.defaultDescriptionButton)}`,
				};
			case 'Scheduler':
				if (!hasGateways) {
					return null;
				}
				return {
					...this.AddButton,
					onPress: this.newSchedule,
					accessibilityLabel: `${formatMessage(i18n.labelAddEditSchedule)}, ${formatMessage(i18n.defaultDescriptionButton)}`,
				};
			default:
				return null;
		}
	}

	openDrawer = () => {
		this.refs.drawer.openDrawer();
		this.props.syncGateways();
	}

	renderNavigationView(): Object {
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

	toggleAttentionCapture(value: boolean) {
		if (!this.state.addNewDevicePressed) {
			LayoutAnimation.configureNext(LayoutAnimations.linearCUD(500));
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
		const { currentScreen } = this.props;

		return (currentScreen === 'Devices') && showAttentionCaptureAddDevice && !addNewDevicePressed;
	}

	render(): Object {
		const { drawer, showAttentionCaptureAddDevice } = this.state;
		const {
			intl,
			appLayout,
			screenReaderEnabled,
			toggleDialogueBox,
			currentScreen: CS,
		} = this.props;

		const styles = this.getStyles(appLayout);

		const rightButton = this.makeRightButton(CS, styles);
		const drawerWidth = getDrawerWidth(styles.deviceWidth);

		const showHeader = CS === 'Tabs' || CS === 'Devices' || CS === 'Sensors' ||
			CS === 'Dashboard' || CS === 'Scheduler' || CS === 'Gateways';

		const showAttentionCapture = this.showAttentionCapture();
		let screenProps = {
			currentScreen: CS,
			intl,
			drawer,
			appLayout,
			screenReaderEnabled,
			toggleDialogueBox,
			rightButton,
			hideHeader: !styles.isPortrait, // Hide Stack Nav Header, show custom Header
			toggleAttentionCapture: this.toggleAttentionCapture,
			showAttentionCapture,
			showAttentionCaptureAddDevice,
			source: 'postlogin',
			openDrawer: this.openDrawer,
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
						rightButton={rightButton}
						showAttentionCapture={showAttentionCapture}
						openDrawer={this.openDrawer}
						drawer={drawer}
						screenReaderEnabled={screenReaderEnabled}/>
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

		const size = Math.floor(deviceHeight * 0.025);
		const fontSizeIcon = size < 20 ? 20 : size;

		const { port, land } = Theme.Core.headerHeightFactor;

		return {
			deviceWidth,
			header: isPortrait ? {
				height: deviceHeight * port,
				alignItems: 'center',
			} : {
				transform: [{rotateZ: '-90deg'}],
				position: 'absolute',
				left: Math.ceil(-deviceHeight * 0.4444),
				top: Math.ceil(deviceHeight * 0.4444),
				width: deviceHeight,
				height: Math.ceil(deviceHeight * land),
			},
			container: {
				flex: 1,
				marginLeft: isPortrait ? 0 : Math.ceil(deviceHeight * 0.11),
			},
			starButtonStyle: isPortrait ? null : {
				position: 'absolute',
				right: height - 50,
				top: deviceHeight * 0.03666,
				paddingTop: 0,
				paddingHorizontal: 0,
			},
			rightButtonStyle: isPortrait ? null : {
				top: deviceHeight * 0.03666,
				right: height - 50,
				paddingTop: 0,
				paddingHorizontal: 0,
			},
			addIconStyle: {
				height: fontSizeIcon,
				width: fontSizeIcon,
			},
			logoStyle: isPortrait ? null : {
				position: 'absolute',
				left: deviceHeight * 0.6255,
				top: deviceHeight * 0.0400,
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

	return {
		screenReaderEnabled,
		appLayout: layout,
		currentScreen: state.navigation.screen,
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

module.exports = connect(mapStateToProps, mapDispatchToProps)(AppNavigatorRenderer);
