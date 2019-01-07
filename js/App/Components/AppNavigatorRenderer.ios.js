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
import { isIphoneX } from 'react-native-iphone-x-helper';
import { intlShape, injectIntl } from 'react-intl';
const isEqual = require('react-fast-compare');

import { View, IconTelldus, Throbber } from '../../BaseComponents';
import Navigator from './AppNavigator';

import {
	syncWithServer,
	switchTab,
} from '../Actions';
import {
	setTopLevelNavigator,
	navigate,
	getRouteName,
	prepareNoZWaveSupportDialogueData,
	checkForZWaveSupport,
	filterGatewaysWithZWaveSupport,
} from '../Lib';

import Theme from '../Theme';
import i18n from '../Translations/common';
import { Image } from 'react-native-animatable';

type Props = {
	appLayout: Object,
	screenReaderEnabled: boolean,
	gateways: Object,
	addingNewLocation: boolean,

	intl: intlShape.isRequired,
	dispatch: Function,
	addNewLocation: () => Promise<any>,
	onNavigationStateChange: (string) => void,
	toggleDialogueBox: (Object) => void,
	locale: string,
};

type State = {
	currentScreen: string,
	showAttentionCaptureAddDevice: boolean,
};

class AppNavigatorRenderer extends View<Props, State> {

	props: Props;
	state: State;

	setNavigatorRef: (any) => void;

	onNavigationStateChange: (Object, Object) => void;
	onOpenSetting: () => void;
	onCloseSetting: () => void;
	addNewDevice: () => void;
	newSchedule: () => void;
	toggleAttentionCapture: (boolean) => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			currentScreen: 'Dashboard',
			showAttentionCaptureAddDevice: false,
		};

		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);

		this.setNavigatorRef = this.setNavigatorRef.bind(this);
		this.onOpenSetting = this.onOpenSetting.bind(this);

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

		this.addNewDevice = this.addNewDevice.bind(this);
		this.newSchedule = this.newSchedule.bind(this);
		this.toggleAttentionCapture = this.toggleAttentionCapture.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const isStateEqual = isEqual(this.state, nextState);
		if (!isStateEqual) {
			return true;
		}

		const { appLayout, gateways, addingNewLocation } = this.props;
		const { appLayout: appLayoutN, gateways: gatewaysN, addingNewLocation: addingNewLocationN } = nextProps;

		if ((appLayout.width !== appLayoutN.width) || (gateways.allIds.length !== gatewaysN.allIds.length)
		|| (addingNewLocation !== addingNewLocationN)) {
			return true;
		}

		return false;
	}

	onOpenSetting() {
		navigate('Settings');
	}

	newSchedule() {
		navigate('Schedule', {
			key: 'Schedule',
			params: { editMode: false },
		}, 'Schedule');
	}

	addNewDevice() {
		const { gateways, toggleDialogueBox, intl, locale } = this.props;
		const zwavesupport = checkForZWaveSupport(gateways.byId);
		if (!zwavesupport) {
			const dialogueData = prepareNoZWaveSupportDialogueData(intl.formatMessage, locale);
			toggleDialogueBox(dialogueData);
		} else {
			const { byId } = gateways;
			const filteredGateways = filterGatewaysWithZWaveSupport(byId);
			const filteredAllIds = Object.keys(filteredGateways);
			const gatewaysLen = filteredAllIds.length;

			if (gatewaysLen > 0) {
				const singleGateway = gatewaysLen === 1;
				navigate('AddDevice', {
					selectLocation: !singleGateway,
					gateway: singleGateway ? {...filteredGateways[filteredAllIds[0]]} : null,
				}, 'AddDevice');
			}
		}
	}

	onNavigationStateChange(prevState: Object, currentState: Object) {
		const currentScreen = getRouteName(currentState);
		this.setState({ currentScreen });

		this.props.onNavigationStateChange(currentScreen);
	}

	makeRightButton(CS: string): Object | null {
		switch (CS) {
			case 'Devices':
				return {
					...this.AddButton,
					onPress: this.addNewDevice,
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
				};
			case 'Scheduler':
				return {
					...this.AddButton,
					onPress: this.newSchedule,
				};
			default:
				return null;
		}
	}

	toggleAttentionCapture(value: boolean) {
		this.setState({
			showAttentionCaptureAddDevice: value,
		});
	}

	setNavigatorRef(navigatorRef: any) {
		setTopLevelNavigator(navigatorRef);
	}

	render(): Object {
		const { currentScreen: CS, showAttentionCaptureAddDevice } = this.state;
		const { intl, appLayout, screenReaderEnabled } = this.props;

		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceHeight = isPortrait ? height : width;

		const showHeader = CS === 'Tabs' || CS === 'Devices' || CS === 'Sensors' ||
			CS === 'Dashboard' || CS === 'Scheduler' || CS === 'Gateways';

		let screenProps = {
			currentScreen: CS,
			intl,
			appLayout,
			screenReaderEnabled,
		};
		if (showHeader) {
			const { land } = Theme.Core.headerHeightFactor;
			const rightButton = this.makeRightButton(CS);
			const showAttentionCapture = CS === 'Devices' && rightButton && showAttentionCaptureAddDevice;
			screenProps = {
				...screenProps,
				leftButton: this.settingsButton,
				rightButton,
				hideHeader: false,
				style: {height: (isIphoneX() ? deviceHeight * 0.08 : deviceHeight * land )},
				toggleAttentionCapture: this.toggleAttentionCapture,
				showAttentionCapture,
				showAttentionCaptureAddDevice,
				attentionCaptureText: intl.formatMessage(i18n.labelAddZWaveD).toUpperCase(),
			};
		}

		return (
			<Navigator
				ref={this.setNavigatorRef}
				onNavigationStateChange={this.onNavigationStateChange}
				screenProps={screenProps} />
		);
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
		gateways: state.gateways,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		onNavigationStateChange: (tab: string) => {
			dispatch(syncWithServer(tab));
			dispatch(switchTab(tab));
		},
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(AppNavigatorRenderer));
