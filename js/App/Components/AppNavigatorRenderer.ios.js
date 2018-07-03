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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NetInfo } from 'react-native';
import Toast from 'react-native-simple-toast';
import { isIphoneX } from 'react-native-iphone-x-helper';

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
	resetLocalControlIP,
	syncWithServer,
	addNewGateway,
	showToast,
	switchTab,
} from '../Actions';
import {
	getRSAKey,
	getRelativeDimensions,
	setTopLevelNavigator,
	navigate,
	getRouteName,
} from '../Lib';
import { intlShape, injectIntl, defineMessages } from 'react-intl';

import { View, Header, IconTelldus, SafeAreaView } from '../../BaseComponents';
import Navigator from './AppNavigator';
import { DimmerPopup } from './TabViews/SubViews';
import DimmerStep from './TabViews/SubViews/Device/DimmerStep';
import UserAgreement from './UserAgreement/UserAgreement';

import { hideDimmerStep } from '../Actions/Dimmer';
import { getUserProfile as getUserProfileSelector } from '../Reducers/User';

import i18n from '../Translations/common';
const messages = defineMessages({
	errortoast: {
		id: 'errortoast',
		defaultMessage: 'Action could not be completed.',
		description: 'The error messgage to show, when a device action cannot be performed',
	},
});

type Props = {
	dimmer: Object,
	tab: string,
	accessToken: Object,
	userProfile: Object,
	dispatch: Function,
	showToast: boolean,
	messageToast: string,
	durationToast: string,
	positionToast: string,
	intl: intlShape.isRequired,
	gateways: Object,

	userIcon: boolean,
	dashboard: Object,
	appLayout: Object,
	gatewaysallIds: Array<any>,
	gatewaysToActivate: Object,
	addNewLocation: () => Promise<any>,
	onNavigationStateChange: (string) => void,
};

type State = {
	currentScreen: string,
	settings: boolean,
	addingNewLocation: boolean,
};

class AppNavigator extends View {

	props: Props;
	state: State;

	onDoneDimming: (Object) => void;
	autoDetectLocalTellStick: () => void;
	handleConnectivityChange: () => void;
	onLayout: (Object) => void;
	setNavigatorRef: (any) => void;

	onNavigationStateChange: (Object, Object) => void;
	onOpenSetting: () => void;
	onCloseSetting: () => void;
	addNewLocation: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			currentScreen: 'Tabs',
			settings: false,
			addingNewLocation: false,
		};

		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
		this.onDoneDimming = this.onDoneDimming.bind(this);

		this.timeOutConfigureLocalControl = null;
		this.timeOutGetLocalControlToken = null;
		this.autoDetectLocalTellStick = this.autoDetectLocalTellStick.bind(this);
		this.onLayout = this.onLayout.bind(this);
		this.handleConnectivityChange = this.handleConnectivityChange.bind(this);

		this.setNavigatorRef = this.setNavigatorRef.bind(this);
		this.onOpenSetting = this.onOpenSetting.bind(this);

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

		let { formatMessage } = props.intl;

		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;
		this.addNewLocationFailed = `${formatMessage(i18n.addNewLocationFailed)}`;

		this.addNewLocation = this.addNewLocation.bind(this);
	}

	componentDidMount() {
		this.props.dispatch(appStart());
		this.props.dispatch(appState());
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

	onOpenSetting() {
		navigate('Settings');
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		let { showToast: showToastBool, messageToast, durationToast, positionToast, intl,
			gatewaysallIds, gatewaysToActivate } = this.props;
		if (showToastBool && !prevProps.showToast) {
			let { formatMessage } = intl;
			let message = messageToast ? messageToast : formatMessage(messages.errortoast);
			this._showToast(message, durationToast, positionToast);
		}

		if (gatewaysallIds.length === 0 && !this.state.addingNewLocation && gatewaysToActivate.checkIfGatewaysEmpty) {
			this.addNewLocation();
		}
	}

	addNewLocation() {
		this.setState({
			addingNewLocation: true,
		});
		this.props.addNewLocation()
			.then((response: Object) => {
				if (response.client) {
					navigate('AddLocation', {clients: response.client});
				}
			}).catch((error: Object) => {
				this.setState({
					addingNewLocation: false,
				});
				let message = error.message && error.message === 'Network request failed' ? this.networkFailed : this.addNewLocationFailed;
				this.props.dispatch(showToast(message));
			});
	}

	handleConnectivityChange(connectionInfo: Object) {
		const { dispatch } = this.props;
		const { type } = connectionInfo;

		// When ever user's connection change reset the previously auto-discovered ip address, before it is auto-discovered and updated again.
		dispatch(resetLocalControlIP());

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

	render(): Object {
		let { currentScreen: CS } = this.state;
		let { intl, dimmer, userProfile, appLayout } = this.props;
		let screenProps = {
			currentScreen: CS,
			intl,
			appLayout,
		};
		let { show, name, value, showStep, deviceStep } = dimmer;
		let importantForAccessibility = showStep ? 'no-hide-descendants' : 'no';

		let leftButton = this.settingsButton;

		let { height, width } = appLayout;
		let isPortrait = height > width;
		let deviceHeight = isPortrait ? height : width;

		const showHeader = CS === 'Tabs' || CS === 'Devices' || CS === 'Sensors' ||
			CS === 'Dashboard' || CS === 'Scheduler' || CS === 'Gateways';

		return (
			<SafeAreaView>
				{showHeader && (
					<Header leftButton={leftButton} style={{height: (isIphoneX() ? deviceHeight * 0.08 : deviceHeight * 0.1111 )}}/>
				)}
				<View style={{flex: 1}} importantForAccessibility={importantForAccessibility}>
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
				<DimmerStep
					showModal={showStep}
					deviceId={deviceStep}
					onDoneDimming={this.onDoneDimming}
					intl={intl}
				/>
				<UserAgreement showModal={!userProfile.eula} onLayout={this.onLayout}/>
			</SafeAreaView>
		);
	}
}

AppNavigator.propTypes = {
	dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state: Object, ownProps: Object): Object {
	const { showToast: showToastBool, messageToast, durationToast, positionToast, layout } = state.App;
	const { accessToken } = state.user;
	const { allIds, toActivate } = state.gateways;

	return {
		accessToken,
		showToast: showToastBool,
		messageToast,
		durationToast,
		positionToast,
		userProfile: getUserProfileSelector(state),
		dimmer: state.dimmer,
		gateways: state.gateways.byId,
		tab: state.navigation.tab,
		appLayout: getRelativeDimensions(layout),

		userIcon: false,
		gatewaysallIds: allIds,
		gatewaysToActivate: toActivate,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		onNavigationStateChange: (tab: string) => {
			dispatch(syncWithServer(tab));
			dispatch(switchTab(tab));
		},
		addNewLocation: (): Function => {
			return dispatch(addNewGateway());
		},
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(AppNavigator));
