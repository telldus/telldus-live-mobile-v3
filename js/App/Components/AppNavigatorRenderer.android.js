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
import { LayoutAnimation } from 'react-native';
import { connect } from 'react-redux';
import DrawerLayoutAndroid from 'DrawerLayoutAndroid';
import { announceForAccessibility } from 'react-native-accessibility';
const isEqual = require('react-fast-compare');
import { intlShape } from 'react-intl';
import { NavigationActions } from 'react-navigation';

import {
	View,
	Header,
	Image,
	HeaderLeftButtonsMainTab,
	Icon,
	CampaignIcon,
} from '../../BaseComponents';
import Navigator from './AppNavigator';
import Drawer from './Drawer/Drawer';

import {
	syncWithServer,
	screenChange,
	resetSchedule,
} from '../Actions';
import {
	setTopLevelNavigator,
	navigate,
	getDrawerWidth,
	getRouteName,
	LayoutAnimations,
} from '../Lib';
import Theme from '../Theme';
import i18n from '../Translations/common';

type Props = {
	screenReaderEnabled: boolean,
	appLayout: Object,

	intl: intlShape.isRequired,
	dispatch: Function,
	syncGateways: () => void,
	onTabSelect: (string) => void,
	onNavigationStateChange: (string) => void,
	addNewLocation: () => any,
	addNewDevice: () => void,
	toggleDialogueBox: (Object) => void,
	navigateToCampaign: () => void,
};

type State = {
	currentScreen: string,
	drawer: boolean,
	showAttentionCaptureAddDevice: boolean,
	addNewDevicePressed: boolean,
};

class AppNavigatorRenderer extends View<Props, State> {

	props: Props;
	state: State;

	onNavigationStateChange: (Object, Object) => void;
	autoDetectLocalTellStick: () => void;
	setNavigatorRef: (any) => void;

	renderNavigationView: () => Object;
	onOpenSetting: () => void;
	openDrawer: () => void;
	addNewLocation: () => void;
	onPressGateway: (Object) => void;
	newSchedule: () => void;
	toggleAttentionCapture: (boolean) => void;

	addNewDevice: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			currentScreen: 'Dashboard',
			drawer: false,
			showAttentionCaptureAddDevice: false,
			addNewDevicePressed: false,
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

		this.setNavigatorRef = this.setNavigatorRef.bind(this);

		this.renderNavigationView = this.renderNavigationView.bind(this);
		this.onOpenSetting = this.onOpenSetting.bind(this);
		this.onCloseDrawer = this.onCloseDrawer.bind(this);
		this.onOpenDrawer = this.onOpenDrawer.bind(this);
		this.openDrawer = this.openDrawer.bind(this);
		this.addNewLocation = this.addNewLocation.bind(this);
		this.onPressGateway = this.onPressGateway.bind(this);

		this.addNewDevice = this.addNewDevice.bind(this);

		this.newSchedule = this.newSchedule.bind(this);
		this.toggleAttentionCapture = this.toggleAttentionCapture.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const isStateEqual = isEqual(this.state, nextState);
		if (!isStateEqual) {
			return true;
		}

		const { appLayout } = this.props;
		const { appLayout: appLayoutN } = nextProps;


		if (appLayout.width !== appLayoutN.width) {
			return true;
		}

		return false;
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
			key: 'Schedule',
			params: { editMode: false },
		}, 'Schedule');
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
		const navigateAction = NavigationActions.navigate({
			routeName: 'Details',
			key: 'Details',
			params: { location },
		});
		navigate('LocationDetails', location, 'LocationDetails', navigateAction);
	}

	onOpenSetting() {
		this.closeDrawer();
		navigate('Profile', {}, 'Profile');
	}

	onNavigationStateChange(prevState: Object, currentState: Object) {
		const currentScreen = getRouteName(currentState);
		this.setState({ currentScreen });

		this.props.onNavigationStateChange(currentScreen);
	}

	addNewDevice() {
		this.setState({
			addNewDevicePressed: true,
		}, () => {
			this.props.addNewDevice();
		});
	}

	makeRightButton(CS: string, styles: Object): Object | null {
		this.AddButton = {
			component: <Image source={{uri: 'icon_plus'}} style={styles.addIconStyle}/>,
			style: styles.rightButtonStyle,
			onPress: () => {},
		};
		const { intl } = this.props;
		const { formatMessage } = intl;
		switch (CS) {
			case 'Devices':
				return {
					...this.AddButton,
					onPress: this.addNewDevice,
					accessibilityLabel: `${formatMessage(i18n.labelAddNewDevice)}, ${formatMessage(i18n.defaultDescriptionButton)}`,
				};
			case 'Gateways':
				return {
					...this.AddButton,
					onPress: this.addNewLocation,
					accessibilityLabel: `${formatMessage(i18n.addNewLocation)}, ${formatMessage(i18n.defaultDescriptionButton)}`,
				};
			case 'Scheduler':
				return {
					...this.AddButton,
					onPress: this.newSchedule,
					accessibilityLabel: `${formatMessage(i18n.labelAddEditSchedule)}, ${formatMessage(i18n.defaultDescriptionButton)}`,
				};
			default:
				return null;
		}
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

	makeLeftButton(styles: Object): any {
		const { drawer } = this.state;
		const { screenReaderEnabled, intl } = this.props;

		const buttons = [
			{
				style: {},
				accessibilityLabel: this.menuIcon,
				onPress: this.openDrawer,
				iconComponent: <Icon
					name="bars"
					size={styles.buttonSize > 22 ? styles.buttonSize : 22}
					style={styles.menuIconStyle}
					color={'#fff'}/>,
			},
			{
				style: {},
				accessibilityLabel: intl.formatMessage(i18n.linkToCampaigns),
				onPress: this.props.navigateToCampaign,
				iconComponent: <CampaignIcon
					size={styles.buttonSize > 22 ? styles.buttonSize : 22}
					style={styles.campaingIconStyle}/>,
			},
		];

		const customComponent = <HeaderLeftButtonsMainTab style={styles.menuButtonStyle} buttons={buttons}/>;

		return (drawer && screenReaderEnabled) ? null : {
			customComponent,
		};
	}

	showAttentionCapture(): boolean {
		const { currentScreen: CS, showAttentionCaptureAddDevice, addNewDevicePressed } = this.state;
		return (CS === 'Devices') && showAttentionCaptureAddDevice && !addNewDevicePressed;
	}

	render(): Object {
		const { currentScreen: CS, drawer, showAttentionCaptureAddDevice } = this.state;
		const { intl, appLayout, screenReaderEnabled, toggleDialogueBox } = this.props;

		const styles = this.getStyles(appLayout);

		const leftButton = this.makeLeftButton(styles);
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
			leftButton,
			rightButton,
			hideHeader: !styles.isPortrait, // Hide Stack Nav Header, show custom Header
			style: styles.header,
			logoStyle: styles.logoStyle,
			toggleAttentionCapture: this.toggleAttentionCapture,
			showAttentionCapture,
			showAttentionCaptureAddDevice,
			attentionCaptureText: intl.formatMessage(i18n.labelAddZWaveD).toUpperCase(),
		};

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
				{showHeader && !styles.isPortrait && (
					<Header
						style={styles.header}
						logoStyle={styles.logoStyle}
						leftButton={leftButton}
						rightButton={rightButton}
						appLayout={appLayout}
						showAttentionCapture={showAttentionCapture}
						attentionCaptureText={intl.formatMessage(i18n.labelAddZWaveD).toUpperCase()}/>
				)}
				<View style={showHeader ? styles.container : {flex: 1}}>
					<Navigator
						ref={this.setNavigatorRef}
						onNavigationStateChange={this.onNavigationStateChange}
						screenProps={screenProps} />
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

		const buttonSize = isPortrait ? Math.floor(width * 0.04) : Math.floor(height * 0.04);

		return {
			deviceWidth,
			header: isPortrait ? {
				height: deviceHeight * port,
				alignItems: 'center',
			} : {
				transform: [{rotateZ: '-90deg'}],
				position: 'absolute',
				left: -deviceHeight * 0.4444,
				top: deviceHeight * 0.4444,
				width: deviceHeight,
				height: deviceHeight * land,
			},
			container: {
				flex: 1,
				marginLeft: isPortrait ? 0 : deviceHeight * 0.11,
			},
			buttonSize,
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
			campaingIconStyle: isPortrait ? {
				marginLeft: 30,
				padding: 2,
			} : {
				transform: [{rotateZ: '90deg'}],
				marginLeft: 30,
				padding: 2,
			},
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
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
		syncGateways: () => {
			dispatch(syncWithServer('gatewaysTab'));
		},
		onNavigationStateChange: (screen: string) => {
			dispatch(syncWithServer(screen));
			dispatch(screenChange(screen));
		},
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(AppNavigatorRenderer);
