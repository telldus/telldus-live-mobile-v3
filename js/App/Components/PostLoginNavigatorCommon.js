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
import { injectIntl, intlShape } from 'react-intl';
import { Linking, NativeModules, Platform } from 'react-native';
const isEqual = require('react-fast-compare');
import Toast from 'react-native-simple-toast';
import NetInfo from '@react-native-community/netinfo';
import RNIap from 'react-native-iap';

import { View } from '../../BaseComponents';
import AppNavigatorRenderer from './AppNavigatorRenderer';
import UserAgreement from './UserAgreement/UserAgreement';
import ExchangeOffer from './ExchangeOffer/ExchangeOffer';
import DimmerStep from './TabViews/SubViews/Device/DimmerStep';
import { DimmerPopup } from './TabViews/SubViews';

const { AndroidWidget } = NativeModules;

import {
	setAppLayout,
	getUserProfile,
	appStart,
	appState,
	syncLiveApiOnForeground,
	getAppData,
	getGateways,
	initiateGatewayLocalTest,
	closeUDPSocket,
	autoDetectLocalTellStick,
	resetLocalControlSupport,
	addNewGateway,
	showToast,
	hideToast,
	getPhonesList,
	getUserSubscriptions,
	campaignVisited,
	toggleVisibilityProExpireHeadsup,
	fetchRemoteConfig,
	onReceivedInAppPurchaseProducts,
	onReceivedInAppAvailablePurchases,
} from '../Actions';
import { getUserProfile as getUserProfileSelector } from '../Reducers/User';
import { hideDimmerStep } from '../Actions/Dimmer';
import { widgetAndroidConfigure, widgetAndroidRefresh, widgetiOSConfigure } from '../Actions/Widget';
import Push from './Push';

import {
	getRSAKey,
	shouldUpdate,
	navigate,
	prepareNoZWaveSupportDialogueData,
	checkForZWaveSupport,
	filterGatewaysWithZWaveSupport,
	hasTellStickNetGetOne,
	premiumAboutToExpire,
} from '../Lib';

import i18n from '../Translations/common';

type Props = {
    showEULA: boolean,
    dimmer: Object,
    screenReaderEnabled: boolean,
	gateways: Object,
	pushTokenRegistered: boolean,
	deviceId: string,
	pushToken: string,

    showToast: boolean,
	messageToast: string,
	durationToast: string,
	positionToast: string,
	locale: string,

	addNewGatewayBool: boolean,

	showChangeLog: boolean,

	visibilityExchangeOffer: 'show' | 'hide_temp' | 'hide_perm' | 'force_show',
	subscriptions: Object,
	pro: number,
	visibilityProExpireHeadsup: 'show' | 'hide_temp' | 'hide_perm' | 'force_show',

    intl: intlShape.isRequired,
    dispatch: Function,
	addNewLocation: () => any,
	locale: string,
	toggleDialogueBox: (Object) => null,
};

type State = {
    addingNewLocation: boolean,
	hasTriedAddLocation: boolean,
};

class PostLoginNavigatorCommon extends View<Props, State> {

props: Props;
state: State;

onLayout: (Object) => void;
onDoneDimming: (Object) => void;
autoDetectLocalTellStick: () => void;
handleConnectivityChange: () => void;
addNewLocation: () => void;
addNewDevice: () => void;

constructor(props: Props) {
	super(props);

	this.state = {
		addingNewLocation: false,
		hasTriedAddLocation: false,
	};

	this.timeOutConfigureLocalControl = null;

	this.onLayout = this.onLayout.bind(this);
	this.onDoneDimming = this.onDoneDimming.bind(this);
	this.autoDetectLocalTellStick = this.autoDetectLocalTellStick.bind(this);

	this.handleConnectivityChange = this.handleConnectivityChange.bind(this);

	this.addNewLocation = this.addNewLocation.bind(this);
	this.addNewDevice = this.addNewDevice.bind(this);

	getRSAKey(true);

	const { formatMessage } = props.intl;

	this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;
	this.addNewLocationFailed = `${formatMessage(i18n.addNewLocationFailed)}`;

	this.onTokenRefreshListener = null;

	// sets push notification listeners and returns a method that clears all listeners.
	this.onNotification = Push.onNotification();
	this.onNotificationOpened = Push.onNotificationOpened();
}

async componentDidMount() {
	const { dispatch, addNewGatewayBool, pushTokenRegistered, subscriptions, pro, visibilityProExpireHeadsup } = this.props;
	dispatch(appStart());
	dispatch(appState());
	// Calling other API requests after resolving the very first one, in order to avoid the situation, where
	// access_token has expired and the API requests, all together goes for fetching new token with refresh_token,
	// and results in generating multiple tokens.

	await dispatch(fetchRemoteConfig());

	if (Platform.OS === 'ios') {
		try {
			await RNIap.initConnection();

			const subs = Platform.select({
				ios: ['premium1m', 'onlytest'],
			});
			const products = await RNIap.getSubscriptions(subs);
			dispatch(onReceivedInAppPurchaseProducts(products));

			const purchases = await RNIap.getAvailablePurchases();
			dispatch(onReceivedInAppAvailablePurchases(purchases));
		} catch (err) {
			// Ignore
		}
	}

	try {
		await dispatch(getUserProfile());
	} catch (e) {
		// Nothing much to do here
	} finally {
		dispatch(getPhonesList()).then((phonesList: Object) => {
			const register = (!phonesList.phone) || (phonesList.phone.length === 0);
			this.pushConf(register);
			if (!pushTokenRegistered && phonesList.phone && phonesList.phone.length > 0) {
				navigate('RegisterForPushScreen', {}, 'RegisterForPushScreen');
			}
		}).catch(() => {
			this.pushConf(false);
		});

		dispatch(widgetAndroidConfigure());
		dispatch(widgetiOSConfigure());
		dispatch(syncLiveApiOnForeground());
		dispatch(getGateways());
		dispatch(getAppData()).then(() => {
			dispatch(widgetAndroidRefresh());
		});
		dispatch(getUserSubscriptions());

		// test gateway local control end-point on app restart.
		dispatch(initiateGatewayLocalTest());

		// Auto discover TellStick's that support local control.
		this.autoDetectLocalTellStick();
	}

	this.checkIfOpenPurchase();
	this.checkIfOpenThermostatControl();

	NetInfo.addEventListener(
		'connectionChange',
		this.handleConnectivityChange,
	);

	const { hasTriedAddLocation } = this.state;
	if (addNewGatewayBool && !hasTriedAddLocation) {
		this.addNewLocation();
	}

	if (premiumAboutToExpire(subscriptions, pro) && visibilityProExpireHeadsup !== 'hide_perm') {
		dispatch(toggleVisibilityProExpireHeadsup('show'));
		navigate('PremiumUpgradeScreen', {}, 'PremiumUpgradeScreen');
	}
}

/*
	 * calls the push configuration methods, for logged in users, which will generate push token and listen for local and
	 * remote push notifications.
	 */
pushConf(register: boolean) {
	const {
		dispatch,
		deviceId,
		pushTokenRegistered,
		pushToken,
		toggleDialogueBox,
	} = this.props;
	const data = {
		deviceId,
		pushTokenRegistered,
		pushToken,
		register,
		toggleDialogueBox,
	};
	dispatch(Push.configure(data));
	if (!this.onTokenRefreshListener) {
		this.onTokenRefreshListener = dispatch(Push.refreshTokenListener({deviceId, register}));
	}
}

checkIfOpenPurchase = async () => {
	// TODO: Remove check once iOS support widgets.
	if (Platform.OS === 'android') {
		const openPurchase = await AndroidWidget.checkIfOpenPurchase();
		if (openPurchase) {
			AndroidWidget.setOpenPurchase(false);
			navigate('AdditionalPlansPaymentsScreen', {}, 'AdditionalPlansPaymentsScreen');
		}
	}
}

checkIfOpenThermostatControl = async () => {
	// TODO: Remove check once iOS support widgets.
	if (Platform.OS === 'android') {
		const id = await AndroidWidget.checkIfOpenThermostatControl();
		if (id && id !== -1) {
			AndroidWidget.setOpenThermostatControl(-1);
			navigate('ThermostatControl', {
				id,
			}, 'ThermostatControl');
		}
	}
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	const isStateEqual = isEqual(this.state, nextState);
	if (!isStateEqual) {
		return true;
	}

	const { showEULA, showToast: showToastBool, gateways, addNewGatewayBool, ...others } = this.props;
	const { showEULA: showEULAN, showToast: showToastN, gateways: gatewaysN, addNewGatewayBool: addNewGatewayBoolN, ...othersN } = nextProps;

	const dimmerPropsChange = shouldUpdate(others.dimmer, othersN.dimmer, ['show', 'value', 'name', 'showStep', 'deviceStep']);
	if (dimmerPropsChange) {
		return true;
	}

	const propsChange = shouldUpdate(others, othersN, [
		'visibilityExchangeOffer',
		'pushTokenRegistered',
		'pushToken',
		'deviceId',
		'locale',
		'subscriptions',
		'pro',
		'visibilityProExpireHeadsup',
		'showChangeLog',
	]);
	if (propsChange) {
		return true;
	}

	if ((showEULA !== showEULAN) || (showToastBool !== showToastN) ||
    (gateways.allIds.length !== gatewaysN.allIds.length) || (addNewGatewayBool !== addNewGatewayBoolN)) {
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

	const { hasTriedAddLocation } = this.state;
	if (addNewGatewayBool && !hasTriedAddLocation) {
		this.addNewLocation();
	}
}

componentWillUnmount() {
	clearTimeout(this.timeOutConfigureLocalControl);
	NetInfo.removeEventListener(
		'connectionChange',
		this.handleConnectivityChange,
	);
	closeUDPSocket();

	if (this.onNotification && typeof this.onNotification === 'function') {
		// Remove Push notification listener.
		this.onNotification();
	}
	if (this.onNotificationOpened && typeof this.onNotificationOpened === 'function') {
		// Remove Push notification opened listener.
		this.onNotificationOpened();
	}
	if (this.onTokenRefreshListener) {
		this.onTokenRefreshListener();
		this.onTokenRefreshListener = null;
	}
}

addNewLocation() {
	this.setState({
		addingNewLocation: true,
		hasTriedAddLocation: true,
	});
	this.props.addNewLocation()
		.then((response: Object) => {
			this.setState({
				addingNewLocation: false,
			});
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

_showToast(message: string, durationToast: any, positionToast: any) {
	Toast.showWithGravity(message, Toast[durationToast], Toast[positionToast]);
	this.props.dispatch(hideToast());
}

handleConnectivityChange(connectionInfo: Object) {
	const { dispatch } = this.props;
	const { type } = connectionInfo;

	// When ever user's connection change reset the previously auto-discovered ip address, before it is auto-discovered and updated again.
	dispatch(resetLocalControlSupport());

	// When user's connection change and if it there is connection to internet, auto-discover TellStick and update it's ip address.
	if (type && type !== 'none') {
		dispatch(initiateGatewayLocalTest());
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

navigateToCampaign = () => {
	let url = 'https://live.telldus.com/profile/campaigns';
	const defaultMessage = this.props.intl.formatMessage(i18n.errorMessageOpenCampaign);
	Linking.canOpenURL(url)
		.then((supported: boolean): any => {
			if (!supported) {
				this.showDialogue(defaultMessage);
			} else {
				const { dispatch } = this.props;
				dispatch(campaignVisited(true));
				return Linking.openURL(url);
			}
		})
		.catch((err: any) => {
			const message = err.message || defaultMessage;
			this.showDialogue(message);
		});
}

showDialogue(message: string) {
	this.props.toggleDialogueBox({
		show: true,
		showHeader: true,
		text: message,
		showPositive: true,
	});
}

onLayout(ev: Object) {
	this.props.dispatch(setAppLayout(ev.nativeEvent.layout));
}

onDoneDimming() {
	this.props.dispatch(hideDimmerStep());
}

render(): Object {
	const {
		showEULA,
		dimmer,
		intl,
		screenReaderEnabled,
		visibilityExchangeOffer,
		gateways,
		locale,
		showChangeLog,
	} = this.props;
	const { show, name, value, showStep, deviceStep } = dimmer;

	const importantForAccessibility = showStep ? 'no-hide-descendants' : 'no';

	const showEO = !showEULA
	&& locale === 'sv'
	&& (!visibilityExchangeOffer || visibilityExchangeOffer === 'show' || visibilityExchangeOffer === 'force_show')
	&& hasTellStickNetGetOne(gateways.byId);

	return (
		<View style={{flex: 1}}>
			<View style={{flex: 1}} importantForAccessibility={importantForAccessibility}>
				<AppNavigatorRenderer
					{...this.props}
					addNewLocation={this.addNewLocation}
					addingNewLocation={this.state.addingNewLocation}
					addNewDevice={this.addNewDevice}
					navigateToCampaign={this.navigateToCampaign}/>
			</View>

			<DimmerPopup
				isVisible={show}
				name={name}
				value={value / 255}
			/>
			{screenReaderEnabled && (
				<DimmerStep
					showModal={showStep && !showEULA && !showEO && !showChangeLog}
					deviceId={deviceStep}
					onDoneDimming={this.onDoneDimming}
					intl={intl}
				/>
			)}
			<UserAgreement showModal={showEULA && !showChangeLog} onLayout={this.onLayout}/>
			<ExchangeOffer showModal={showEO && !showChangeLog} onLayout={this.onLayout}/>
		</View>
	);
}
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	const {
		screenReaderEnabled,
		showToast: showToastBool,
		messageToast,
		durationToast,
		positionToast,
		defaultSettings,
	} = state.app;

	let { language = {} } = defaultSettings || {};
	let locale = language.code;

	const {
		visibilityExchangeOffer,
		subscriptions,
		userProfile,
		visibilityProExpireHeadsup,
	} = state.user;

	const { allIds = [], toActivate } = state.gateways;
	const addNewGatewayBool = allIds.length === 0 && toActivate.checkIfGatewaysEmpty;

	let {
		pushToken,
		pushTokenRegistered,
		deviceId = null,
	} = state.user;

	return {
		messageToast,
		durationToast,
		positionToast,
		showToast: showToastBool,
		locale,

		addNewGatewayBool,
		gateways: state.gateways,

		showEULA: !getUserProfileSelector(state).eula,
		dimmer: state.dimmer,
		screenReaderEnabled,

		pushTokenRegistered,
		pushToken,
		deviceId,
		visibilityExchangeOffer,
		subscriptions,
		pro: userProfile.pro,
		visibilityProExpireHeadsup,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
		addNewLocation: (): Function => {
			return dispatch(addNewGateway());
		},
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PostLoginNavigatorCommon));
