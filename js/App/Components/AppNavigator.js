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
import { StackNavigator } from 'react-navigation';
import Toast from 'react-native-simple-toast';

import {
	getUserProfile,
	appStart,
	appState,
	syncLiveApiOnForeground,
	getAppData,
	getGateways,
	hideToast,
	resetSchedule,
	getTokenForLocalControl,
	autoDetectLocalTellStick,
	setAppLayout,
	resetLocalControlIP,
} from '../Actions';
import { getRSAKey } from '../Lib';
import { intlShape, injectIntl, defineMessages } from 'react-intl';

import { View } from '../../BaseComponents';
import TabsView from './TabViews/TabsView';
import { DimmerPopup } from './TabViews/SubViews';
import DeviceDetails from './DeviceDetails/DeviceDetails';
import AddLocationNavigator from './Location/AddLocation/AddLocation';
import LocationDetailsNavigator from './Location/LocationDetails/LocationDetails';
import ScheduleNavigator from './Schedule/ScheduleNavigator';
import DimmerStep from './TabViews/SubViews/Device/DimmerStep';
import { SettingsScreen } from './Settings';
import UserAgreement from './UserAgreement/UserAgreement';

import { hideDimmerStep } from '../Actions/Dimmer';
import { getUserProfile as getUserProfileSelector } from '../Reducers/User';

const messages = defineMessages({
	errortoast: {
		id: 'errortoast',
		defaultMessage: 'Action could not be completed.',
		description: 'The error messgage to show, when a device action cannot be performed',
	},
});

const RouteConfigs = {
	Tabs: {
		screen: TabsView,
		navigationOptions: {
			header: null,
		},
	},
	Settings: {
		screen: SettingsScreen,
		navigationOptions: {
			header: null,
		},
	},
	DeviceDetails: {
		screen: DeviceDetails,
		navigationOptions: {
			header: null,
		},
	},
	Schedule: {
		screen: ScheduleNavigator,
		navigationOptions: {
			header: null,
		},
	},
	AddLocation: {
		screen: AddLocationNavigator,
		navigationOptions: {
			header: null,
		},
	},
	LocationDetails: {
		screen: LocationDetailsNavigator,
		navigationOptions: {
			header: null,
		},
	},
};

const StackNavigatorConfig = {
	initialRouteName: 'Tabs',
};

const Navigator = StackNavigator(RouteConfigs, StackNavigatorConfig);

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
};

type State = {
	currentScreen: string,
};

class AppNavigator extends View {

	props: Props;
	state: State;

	onNavigationStateChange: (Object) => void;
	onDoneDimming: (Object) => void;
	autoDetectLocalTellStick: () => void;
	handleConnectivityChange: () => void;
	onLayout: (Object) => void;

	static getDerivedStateFromProps(props: Object, state: Object): null {
		let { showToast, messageToast, durationToast, positionToast, intl, dispatch } = props;
		if (showToast) {
			let { formatMessage } = intl;
			let message = messageToast ? messageToast : formatMessage(messages.errortoast);
			Toast.showWithGravity(message, Toast[durationToast], Toast[positionToast]);
			dispatch(hideToast());
		}

		// Return null to indicate no change to state.
		return null;
	}

	constructor() {
		super();

		this.state = {
			currentScreen: 'Tabs',
		};

		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
		this.onDoneDimming = this.onDoneDimming.bind(this);

		this.timeOutConfigureLocalControl = null;
		this.timeOutGetLocalControlToken = null;
		this.autoDetectLocalTellStick = this.autoDetectLocalTellStick.bind(this);
		this.onLayout = this.onLayout.bind(this);
		this.handleConnectivityChange = this.handleConnectivityChange.bind(this);
		getRSAKey(true);
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

	getTokenForLocalControl() {
		const that = this;
		/**
		* Two important things about Local Control!
		* 1. If a device support local control and by any chance if it missed
		* sending token or app failed to receive token(socket fail), should be tried and fetched on next call.
		* 2. Try not to request for token unnecessarily. (Since function is called from 'componentWillReceiveProps',
		* it will be called quite frequently in short gap.)
		*
		* Upon token request it will take some time for the token to receive through the socket. During that time gap
		* this method will get called from 'componentWillReceiveProps' during any state change, and can result in
		* issue (2). Because of that timeout is crucial.
		*/
		this.timeOutGetLocalControlToken = setTimeout(() => {
			const { dispatch, gateways } = that.props;
			getRSAKey(false, ({ pemPub }: Object) => {
				if (pemPub) {
					for (let index in gateways) {
						const gateway = gateways[index];
						const { id, websocketOnline, websocketConnected, localKey } = gateway;
						const { key, supportLocal } = localKey;
						if (websocketOnline && websocketConnected && supportLocal && !key) {
							dispatch(getTokenForLocalControl(id, pemPub));
						}
					}
				}
			});
		}, 35000);
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
		const index = currentState.index;
		this.setState({ currentScreen: currentState.routes[index].routeName });
	}

	onDoneDimming() {
		this.props.dispatch(hideDimmerStep());
	}

	onLayout(ev: Object) {
		this.props.dispatch(setAppLayout(ev.nativeEvent.layout));
	}

	render(): Object {
		let { currentScreen } = this.state;
		let { intl, dimmer, userProfile } = this.props;
		let screenProps = {
			currentScreen,
		};
		let { show, name, value, showStep, deviceStep } = dimmer;
		let importantForAccessibility = showStep ? 'no-hide-descendants' : 'no';

		return (
			<View style={{flex: 1}}>
				<View style={{flex: 1}} importantForAccessibility={importantForAccessibility}>
					<Navigator onNavigationStateChange={this.onNavigationStateChange} screenProps={screenProps} />
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
			</View>
		);
	}
}

AppNavigator.propTypes = {
	dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state: Object, ownProps: Object): Object {
	let { showToast, messageToast, durationToast, positionToast } = state.App;
	let { accessToken } = state.user;

	return {
		accessToken,
		showToast,
		messageToast,
		durationToast,
		positionToast,
		userProfile: getUserProfileSelector(state),
		dimmer: state.dimmer,
		gateways: state.gateways.byId,
		tab: state.navigation.tab,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(AppNavigator));
