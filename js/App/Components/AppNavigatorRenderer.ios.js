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
import { isIphoneX } from 'react-native-iphone-x-helper';
import { intlShape } from 'react-intl';
const isEqual = require('react-fast-compare');
import appleAuth from '@invertase/react-native-apple-authentication';

import {
	View,
	IconTelldus,
	Throbber,
	HeaderLeftButtonsMainTab,
	CampaignIcon,
} from '../../BaseComponents';
import AppNavigator from './AppNavigator';

import {
	resetSchedule,
	logoutAfterUnregister,
} from '../Actions';
import {
	navigate,
	LayoutAnimations,
	shouldUpdate,
} from '../Lib';

import Theme from '../Theme';
import i18n from '../Translations/common';
import { Image } from 'react-native-animatable';

type Props = {
	appLayout: Object,
	screenReaderEnabled: boolean,
	addingNewLocation: boolean,
	currentScreen: string,
	hasGateways: boolean,

	intl: intlShape.isRequired,
	dispatch: Function,
	addNewLocation: () => Promise<any>,
	addNewDevice: () => void,
	toggleDialogueBox: (Object) => void,
	navigateToCampaign: () => void,
	addNewSensor: () => void,
};

type State = {
	showAttentionCaptureAddDevice: boolean,
	addNewDevicePressed: boolean,
};

class AppNavigatorRenderer extends View<Props, State> {

	props: Props;
	state: State;

	onOpenSetting: () => void;
	onCloseSetting: () => void;
	newSchedule: () => void;
	toggleAttentionCapture: (boolean) => void;

	addNewDevice: () => void;
	addNewSensor: () => void;

	clearAppleCredentialRevokedListener: any;

	constructor(props: Props) {
		super(props);

		this.state = {
			showAttentionCaptureAddDevice: false,
			addNewDevicePressed: false,
		};

		this.onOpenSetting = this.onOpenSetting.bind(this);

		this.addNewDevice = this.addNewDevice.bind(this);

		const { appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceHeight = isPortrait ? height : width;
		const size = Math.floor(deviceHeight * 0.03);

		let fontSize = size < 20 ? 20 : size;

		this.AddButton = {
			component: <Image source={{uri: 'icon_plus'}} style={{
				height: fontSize * 0.85,
				width: fontSize * 0.85,
			}}/>,
			onPress: () => {},
		};

		this.throbber = {
			component: <Throbber
				throbberStyle={{
					fontSize,
					color: '#fff',
				}}
				throbberContainerStyle={{
					position: 'relative',
				}}/>,
			onPress: () => {},
		};

		this.newSchedule = this.newSchedule.bind(this);
		this.toggleAttentionCapture = this.toggleAttentionCapture.bind(this);

		this.clearAppleCredentialRevokedListener = null;
	}

	componentDidMount() {
		if (appleAuth.isSupported) {
			this.clearAppleCredentialRevokedListener = appleAuth.onCredentialRevoked(() => {
				this.props.dispatch(logoutAfterUnregister());
			});
		}
	}

	componentWillUnmount() {
		if (this.clearAppleCredentialRevokedListener) {
			this.clearAppleCredentialRevokedListener();
			this.clearAppleCredentialRevokedListener = null;
		}
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
			'addingNewLocation',
		]);
	}

	onOpenSetting() {
		navigate('Profile');
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
				if (this.props.addingNewLocation) {
					return {
						...this.throbber,
					};
				}
				return {
					...this.AddButton,
					onPress: this.props.addNewLocation,
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

	toggleAttentionCapture(value: boolean) {
		if (!this.state.addNewDevicePressed) {
			LayoutAnimation.configureNext(LayoutAnimations.linearCUD(500), () => {
				// This is to prevent same layout animation occuring on navigation(next layout)
				// Callback only available in iOS
				LayoutAnimation.configureNext(null);
			});
		}
		this.setState({
			showAttentionCaptureAddDevice: value,
		});
	}

	showAttentionCapture(): boolean {
		const { showAttentionCaptureAddDevice, addNewDevicePressed } = this.state;
		const { currentScreen } = this.props;

		return (currentScreen === 'Devices') && showAttentionCaptureAddDevice && !addNewDevicePressed;
	}

	makeLeftButton(styles: Object): any {
		const { intl } = this.props;

		const buttons = [
			{
				style: styles.settingsButtonStyle,
				accessibilityLabel: `${intl.formatMessage(i18n.settingsHeader)}, ${intl.formatMessage(i18n.defaultDescriptionButton)}`,
				onPress: this.onOpenSetting,
				iconComponent: <IconTelldus icon={'settings'} style={{
					fontSize: styles.fontSizeIcon,
					color: '#fff',
				}}/>,
			},
			{
				style: styles.campaingButtonStyle,
				accessibilityLabel: intl.formatMessage(i18n.linkToCampaigns),
				onPress: this.props.navigateToCampaign,
				iconComponent: <CampaignIcon
					size={styles.fontSizeIcon}
				/>,
			},
		];

		const customComponent = <HeaderLeftButtonsMainTab buttons={buttons}/>;

		return {
			customComponent,
		};
	}

	render(): Object {
		const { showAttentionCaptureAddDevice } = this.state;
		const {
			intl,
			appLayout,
			screenReaderEnabled,
			toggleDialogueBox,
			currentScreen: CS,
		} = this.props;

		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceHeight = isPortrait ? height : width;

		const styles = this.getStyles(appLayout);

		const { land } = Theme.Core.headerHeightFactor;
		const rightButton = this.makeRightButton(CS, styles);
		const showAttentionCapture = this.showAttentionCapture() && rightButton;
		let screenProps = {
			currentScreen: CS,
			intl,
			appLayout,
			screenReaderEnabled,
			toggleDialogueBox,
			leftButton: this.makeLeftButton(styles),
			rightButton,
			hideHeader: false,
			style: {height: (isIphoneX() ? deviceHeight * 0.08 : deviceHeight * land )},
			toggleAttentionCapture: this.toggleAttentionCapture,
			showAttentionCapture,
			showAttentionCaptureAddDevice,
			source: 'postlogin',
		};

		return (
			<AppNavigator
				screenProps={screenProps}/>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceHeight = isPortrait ? height : width;

		const size = Math.floor(deviceHeight * 0.025);
		const fontSizeIcon = size < 20 ? 20 : size;

		return {
			addIconStyle: {
				height: fontSizeIcon,
				width: fontSizeIcon,
			},
			campaingButtonStyle: {
				marginLeft: 4,
				paddingRight: 15,
				paddingLeft: 5,
				paddingVertical: 4,
			},
			settingsButtonStyle: {
				paddingLeft: 15,
				paddingRight: 5,
				paddingVertical: 4,
			},
			fontSizeIcon,
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
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(AppNavigatorRenderer);
