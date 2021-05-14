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

import {
	View,
	TransparentFullPageLoadingIndicator,
} from '../../BaseComponents';
import AppNavigatorRenderer from './AppNavigatorRenderer';
import UserAgreement from './UserAgreement/UserAgreement';
import DimmerStep from './TabViews/SubViews/Device/DimmerStep';
import { DimmerPopup } from './TabViews/SubViews';
import SwitchAccountActionSheet from './AccountSettings/SwitchAccountActionSheet';

const { WidgetModule } = NativeModules;

import {
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
	setupGeoFence,
	fetchRemoteConfig,
	prepareCommonGAProperties,
	updateAllAccountsInfo,
	setGatewayRelatedGAProperties,
	onReceivedInAppPurchaseProducts,
	onReceivedInAppAvailablePurchases,
	checkAndLinkAccountIfRequired,
	updateAllMetWeatherDbTiles,
	setWidgetSensorLastUpdatedModeIOS,
} from '../Actions';
import { getUserProfile as getUserProfileSelector } from '../Reducers/User';
import { hideDimmerStep } from '../Actions/Dimmer';
import {
	widgetConfigure,
	widgetRefresh,
} from '../Actions/Widget';
import Push from './Push';
import {
	deployStore,
} from '../../Config';

import {
	getRSAKey,
	shouldUpdate,
	navigate,
	premiumAboutToExpire,
	setGAUserProperties,
	getSubscriptionPlans,
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
	visibilityEula: boolean,

	themeInApp: string,
	colorScheme: string,
	colors: Object,

    showToast: boolean,
	messageToast: string,
	durationToast: string,
	positionToast: string,
	locale: string,

	addNewGatewayBool: boolean,

	showChangeLog: boolean,
	changeLogVersion: string,

	screen: string,

	showSwitchAccountAS: boolean,

	subscriptions: Object,
	pro: number,
	visibilityProExpireHeadsup: 'show' | 'hide_temp' | 'hide_perm' | 'force_show',
	userId: string,

	showLoadingIndicator: boolean,

	enableGeoFence: boolean,

    intl: intlShape.isRequired,
    dispatch: Function,
	addNewLocation: () => any,
	locale: string,
	toggleDialogueBox: (Object) => null,
	onLayout: Function,
};

type State = {
    addingNewLocation: boolean,
	hasTriedAddLocation: boolean,
	isDrawerOpen: boolean,
};

class PostLoginNavigatorCommon extends View<Props, State> {

props: Props;
state: State;

onDoneDimming: (Object) => void;
autoDetectLocalTellStick: () => void;
handleConnectivityChange: () => void;
addNewLocation: () => void;
addNewDevice: () => void;

refSwitchAccountActionSheet: Object;
screensAllowsNavigationOrModalOverride: Array<string>;
clearNetInfoListener: any;

clearListenerSyncLiveApiOnForeground: any;
clearListenerAppState: any;

timeoutNavToChangelog: any;

constructor(props: Props) {
	super(props);

	this.state = {
		addingNewLocation: false,
		hasTriedAddLocation: false,
		isDrawerOpen: false,
	};

	this.timeOutConfigureLocalControl = null;

	this.onDoneDimming = this.onDoneDimming.bind(this);
	this.autoDetectLocalTellStick = this.autoDetectLocalTellStick.bind(this);

	this.handleConnectivityChange = this.handleConnectivityChange.bind(this);

	this.addNewDevice = this.addNewDevice.bind(this);

	getRSAKey(true);

	const { formatMessage } = props.intl;

	this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;
	this.addNewLocationFailed = `${formatMessage(i18n.addNewLocationFailed)}`;

	this.onTokenRefreshListener = null;

	// sets push notification listeners and returns a method that clears all listeners.
	this.onNotification = Push.onNotification({
		getThemeOptions: this.getThemeOptions,
	});
	this.onNotificationOpened = Push.onNotificationOpened();

	this.screensAllowsNavigationOrModalOverride = [
		'Tabs',
		'Dashboard',
		'Devices',
		'Sensors',
		'Scheduler',
		'MoreOptionsTab',
	];

	this.refSwitchAccountActionSheet = {};
	this.clearNetInfoListener = null;
	this.clearListenerSyncLiveApiOnForeground = null;
	this.clearListenerAppState = null;

	this.timeoutNavToChangelog = null;
}

getThemeOptions = (): Object => {
	const {
		colorScheme,
	} = this.props;
	return {
		colorScheme,
	};
}

async componentDidMount() {
	const { dispatch } = this.props;
	dispatch(appStart());
	this.clearListenerAppState = await dispatch(appState());

	dispatch(updateAllAccountsInfo());

	this.actionsToPerformOnStart();

	this.clearNetInfoListener = NetInfo.addEventListener(this.handleConnectivityChange);

	this._askIfAddNewLocation();
}

actionsToPerformOnStart = async () => {
	const {
		dispatch,
		subscriptions,
		pro,
		visibilityProExpireHeadsup,
		showLoadingIndicator,
		enableGeoFence,
		intl,
	} = this.props;

	// NOTE: Setting time out for the navigator 'ref' to get ready(when called from DidMount).
	this.timeoutNavToChangelog = setTimeout(() => {
		const {
			showChangeLog: sCLLate,
			changeLogVersion,
		} = this.props;
		if (sCLLate) {
			navigate('ChangeLogScreen', {
				forceShowChangeLog: false,
				changeLogVersion,
			});
			this.timeoutNavToChangelog = null;
		}
	}, 400);

	try {
		// NOTE : Make sure "fetchRemoteConfig" is called before 'setupGeoFence'.
		await dispatch(fetchRemoteConfig());

		if (enableGeoFence) {
			await dispatch(setupGeoFence(intl));
		}
	} catch (e) {
		// Ignore
	}

	// Calling other API requests after resolving the very first one, in order to avoid the situation, where
	// access_token has expired and the API requests, all together goes for fetching new token with refresh_token,
	// and results in generating multiple tokens.

	if (Platform.OS === 'ios') {
		try {
			const flag = await RNIap.initConnection();
			if (flag) {
				let productIds = [];
				getSubscriptionPlans().forEach((plans: Object) => {
					if (plans.productIdIap) {
						productIds.push(plans.productIdIap);
					}
				});
				const subs = Platform.select({
					ios: productIds,
				});
				const products = await RNIap.getSubscriptions(subs);
				dispatch(onReceivedInAppPurchaseProducts(products));

				const purchases = await RNIap.getAvailablePurchases() || [];// Those not called 'finishTransaction' post-purchase
				dispatch(onReceivedInAppAvailablePurchases(purchases));
				// purchases.forEach((purchase: Object) => {
				// const idsAutoRenewing = ['premiumauto'];// TODO update with the actual auto renewing susbscriptions
				// const {
				// 	productId,
				// } = purchase;

				// Fix for ISSUE 1 reported below. But with a cost one unnecessary
				// API call/report(auto renewing subscription).
				// const isAutoRenewing = idsAutoRenewing.indexOf(productId) === -1;
				// if (!isAutoRenewing) {
				// 	dispatch(reportIapAtServer(purchase));
				// }
				// TODO: If auto renewing subscription:
				// 1- Take the one with latest 'originTransactionDateIOS'
				// 2- Report that alone at the server
				// Even after reporting and calling 'finishTransaction' and 'finishTransactionIOS',
				// Unlike non-renew, it will still be present in this list.
				// });
				// TODO: These are the purchases made successfully but failed to
				// report at our server(createTransaction not success), may be try to report now?

				// ISSUES when reporting to server from here:

				// ISSUE 1: All transactions of auto-renewable subscription seem to be present
				// here even after calling 'finishTransaction' and 'finishTransactionIOS'.
				// Which will be an issue while reporting!!
				// ISSUE 2: In future when user log into multiple accounts, there is a
				// chance for the user to have purchased a subscription from one account,
				// and report at server from another.(Made purchase from acc. 'A', failed report
				// at server, hence finishTransaction not called, user switched to acc. 'B', prev. purchase
				// made from acc 'A' gets reported now from here)
			}
		} catch (err) {
			// Ignore
		}
	}

	try {
		await dispatch(getUserProfile());
		await dispatch(getGateways());

		dispatch(widgetConfigure());
	} catch (e) {
		// Nothing much to do here
	} finally {
		if (deployStore !== 'huawei') {
			dispatch(getPhonesList()).then((phonesList: Object) => {
				const register = (!phonesList.phone) || (phonesList.phone.length === 0);
				this.pushConf(register);
				if (
					!this.state.isDrawerOpen &&
					!this.props.pushTokenRegistered &&
					!this.props.showLoadingIndicator &&
					phonesList.phone &&
					phonesList.phone.length > 0 &&
					this.doesAllowsToOverrideScreen()
				) {
					navigate('RegisterForPushScreen');
				}
			}).catch(() => {
				this.pushConf(false);
			});
		}

		this.clearListenerSyncLiveApiOnForeground = await dispatch(syncLiveApiOnForeground());
		dispatch(getAppData()).then(() => {
			dispatch(setWidgetSensorLastUpdatedModeIOS(false));
			dispatch(widgetRefresh());
		});

		try {
			await dispatch(getUserSubscriptions());
		} catch (userSubsErr) {
			// Ignore
		} finally {
			const gAPremProps = dispatch(prepareCommonGAProperties());
			setGAUserProperties(gAPremProps);
		}
		dispatch(setGatewayRelatedGAProperties());// NOTE: Make sure is called resolving getGateways

		// test gateway local control end-point on app restart.
		dispatch(initiateGatewayLocalTest());

		// Auto discover TellStick's that support local control.
		this.autoDetectLocalTellStick();
	}

	this.checkIfOpenPurchase();
	this.checkIfOpenThermostatControl();

	dispatch(checkAndLinkAccountIfRequired());

	dispatch(updateAllMetWeatherDbTiles());

	const {
		isDrawerOpen,
	} = this.state;

	if (
		Platform.OS !== 'ios' &&
		!isDrawerOpen &&
		!showLoadingIndicator &&
		premiumAboutToExpire(subscriptions, pro) &&
		visibilityProExpireHeadsup !== 'hide_perm' &&
		this.doesAllowsToOverrideScreen()
	) {
		dispatch(toggleVisibilityProExpireHeadsup('show'));
		navigate('PremiumUpgradeScreen');
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
		const openPurchase = await WidgetModule.checkIfOpenPurchase();
		if (openPurchase) {
			WidgetModule.setOpenPurchase(false);
			navigate('AdditionalPlansPaymentsScreen');
		}
	}
}

checkIfOpenThermostatControl = async () => {
	// TODO: Remove check once iOS support widgets.
	if (Platform.OS === 'android') {
		const id = await WidgetModule.checkIfOpenThermostatControl();
		if (id && id !== -1) {
			WidgetModule.setOpenThermostatControl(-1);
			navigate('ThermostatControl', {
				id,
			});
		}
	}
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	const isStateEqual = isEqual(this.state, nextState);
	if (!isStateEqual) {
		return true;
	}

	const { gateways, ...others } = this.props;
	const { gateways: gatewaysN, ...othersN } = nextProps;

	const dimmerPropsChange = shouldUpdate(others.dimmer, othersN.dimmer, ['show', 'value', 'name', 'showStep', 'deviceStep']);
	if (dimmerPropsChange) {
		return true;
	}

	const propsChange = shouldUpdate(others, othersN, [
		'pushTokenRegistered',
		'pushToken',
		'deviceId',
		'locale',
		'subscriptions',
		'pro',
		'visibilityProExpireHeadsup',
		'showToast',
		'showEULA',
		'addNewGatewayBool',
		'showChangeLog',
		'userId',
		'screen',
		'showLoadingIndicator',
		'screen',
		'showSwitchAccountAS',
		'enableGeoFence',
		'visibilityEula',
		'themeInApp',
		'colorScheme',
		'selectedThemeSet',
	]);
	if (propsChange) {
		return true;
	}

	if (gateways.allIds.length !== gatewaysN.allIds.length) {
		return true;
	}

	if (gateways.didFetch !== gatewaysN.didFetch) {
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
		userId,
		showSwitchAccountAS,
	} = this.props;
	if (showToastBool && !prevProps.showToast) {
		const { formatMessage } = intl;
		const message = messageToast ? messageToast : formatMessage(i18n.errortoast);
		this._showToast(message, durationToast, positionToast);
	}

	// Account switched
	if (userId && prevProps.userId && (userId !== prevProps.userId)) {
		this.actionsToPerformOnStart();
	}
	this._askIfAddNewLocation();

	if (showSwitchAccountAS && !prevProps.showSwitchAccountAS) {
		this.showSwitchAccountActionSheet();
	}
}

_askIfAddNewLocation = () => {
	const {
		addNewGatewayBool,
		showLoadingIndicator,
	} = this.props;
	const { hasTriedAddLocation } = this.state;
	if (
		addNewGatewayBool &&
		this.doesAllowsToOverrideScreen() &&
		!hasTriedAddLocation &&
		!showLoadingIndicator
	) {
		this.setState({
			hasTriedAddLocation: true,
		}, () => {
			navigate(
				'InfoScreen',
				{
					info: 'add_gateway',
				},
				'InfoScreen',
			);
		});
	}
}

componentWillUnmount() {
	clearTimeout(this.timeOutConfigureLocalControl);
	closeUDPSocket();

	if (this.clearNetInfoListener) {
		this.clearNetInfoListener();
	}

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
	if (this.clearListenerSyncLiveApiOnForeground) {
		this.clearListenerSyncLiveApiOnForeground();
		this.clearListenerSyncLiveApiOnForeground = null;
	}
	if (this.clearListenerAppState) {
		this.clearListenerAppState();
		this.clearListenerAppState = null;
	}

	if (this.timeoutNavToChangelog) {
		clearTimeout(this.timeoutNavToChangelog);
	}
}

doesAllowsToOverrideScreen = (extraScreens?: Object = []): boolean => {
	const {
		screen,
		showChangeLog,
	} = this.props;
	return !showChangeLog && this.screensAllowsNavigationOrModalOverride.concat(extraScreens).indexOf(screen) !== -1;
}

addNewLocation = () => {
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

addNewDevice() {
	const { gateways } = this.props;
	const { byId } = gateways;
	const gatewaysLen = Object.keys(byId).length;

	if (gatewaysLen > 0) {
		const singleGateway = gatewaysLen === 1;
		if (singleGateway) {
			navigate('AddDevice', {
				gateway: byId[Object.keys(byId)[0]],
				singleGateway,
				screen: 'SelectDeviceType',
				params: {
					gateway: byId[Object.keys(byId)[0]],
					singleGateway,
				},
			});
		} else {
			navigate('AddDevice', {
				screen: 'SelectLocation',
			});
		}
	}
}

addNewSensor = () => {
	const { gateways } = this.props;
	const filteredGateways = gateways.byId;
	if (Object.keys(filteredGateways).length > 0) {
		const filteredAllIds = Object.keys(filteredGateways);
		const gatewaysLen = filteredAllIds.length;

		if (gatewaysLen > 0) {
			const singleGateway = gatewaysLen === 1;
			if (singleGateway) {
				navigate('AddSensor', {
					gateway: filteredGateways[filteredAllIds[0]],
					singleGateway,
					screen: 'SelectSensorType',
					params: {
						gateway: filteredGateways[filteredAllIds[0]],
						singleGateway,
					},
				});
			} else {
				navigate('AddSensor', {
					screen: 'SelectLocationAddSensor',
				});
			}
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

onDoneDimming() {
	this.props.dispatch(hideDimmerStep());
}

showSwitchAccountActionSheet = () => {
	if (this.refSwitchAccountActionSheet && this.refSwitchAccountActionSheet.show) {
		this.refSwitchAccountActionSheet.show();
	}
}

setRefSwitchAccountActionSheet = (ref: any) => {
	this.refSwitchAccountActionSheet = ref;
}

toggleDrawerState = (isDrawerOpen: boolean) => {
	this.setState({
		isDrawerOpen,
	});
}

render(): Object {
	const {
		isDrawerOpen,
	} = this.state;

	const {
		showEULA,
		dimmer,
		intl,
		screenReaderEnabled,
		showLoadingIndicator,
		onLayout,
		gateways,
		visibilityEula,
		showSwitchAccountAS,
	} = this.props;
	const { show, name, value, showStep, deviceStep } = dimmer;

	const importantForAccessibility = showStep ? 'no-hide-descendants' : 'no';

	const showEulaModal = showEULA && !isDrawerOpen && this.doesAllowsToOverrideScreen(visibilityEula ? ['ProfileTab'] : []);

	const showLoadingIndicatorFinal = showLoadingIndicator && !showEulaModal && !showSwitchAccountAS;

	return (
		<View style={{flex: 1}}>
			<View style={{flex: 1}} importantForAccessibility={importantForAccessibility}>
				<AppNavigatorRenderer
					{...this.props}
					showSwitchAccountActionSheet={this.showSwitchAccountActionSheet}
					addNewLocation={this.addNewLocation}
					addingNewLocation={this.state.addingNewLocation}
					addNewDevice={this.addNewDevice}
					addNewSensor={this.addNewSensor}
					navigateToCampaign={this.navigateToCampaign}
					toggleDrawerState={this.toggleDrawerState}
					hasGateways={gateways.didFetch && gateways.allIds.length > 0}/>
			</View>

			<DimmerPopup
				isVisible={show}
				name={name}
				value={value / 255}
			/>
			{screenReaderEnabled && (
				<DimmerStep
					showModal={showStep && !showEulaModal}
					deviceId={deviceStep}
					onDoneDimming={this.onDoneDimming}
					intl={intl}
				/>
			)}
			<SwitchAccountActionSheet
				ref={this.setRefSwitchAccountActionSheet}/>
			<TransparentFullPageLoadingIndicator
				isVisible={showLoadingIndicatorFinal}/>
			<UserAgreement showModal={showEulaModal} onLayout={onLayout}/>
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

	let { language = {}, enableGeoFence = false } = defaultSettings || {};
	let locale = language.code;

	let {
		subscriptions,
		userProfile,
		visibilityProExpireHeadsup,
		visibilityEula,
		pushToken,
		pushTokenRegistered,
		deviceId = null,
		userId,
		switchAccountConf = {},
	} = state.user;

	const { allIds = [], toActivate, didFetch: gDidFetch } = state.gateways;
	const addNewGatewayBool = allIds.length === 0 && toActivate.checkIfGatewaysEmpty;

	const { didFetch: dDidFetch, allIds: allDs = [] } = state.devices;
	const { didFetch: sDidFetch, allIds: allSs = [] } = state.sensors;
	const showLoadingIndicator = (!gDidFetch && allIds.length === 0) ||
	(!dDidFetch && allDs.length === 0) ||
	(!sDidFetch && allSs.length === 0);

	return {
		messageToast,
		durationToast,
		positionToast,
		showToast: showToastBool,
		locale,

		addNewGatewayBool,
		gateways: state.gateways,

		showEULA: !getUserProfileSelector(state).eula || visibilityEula,
		visibilityEula,
		dimmer: state.dimmer,
		screenReaderEnabled,

		pushTokenRegistered,
		pushToken,
		deviceId,
		subscriptions,
		pro: userProfile.pro,
		visibilityProExpireHeadsup,
		userId,
		screen: state.navigation.screen,
		showSwitchAccountAS: switchAccountConf.showAS,

		showLoadingIndicator,

		enableGeoFence,
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

export default (connect(mapStateToProps, mapDispatchToProps)(injectIntl(PostLoginNavigatorCommon)): Object);
