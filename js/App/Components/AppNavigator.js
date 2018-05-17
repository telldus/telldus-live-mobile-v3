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
import { Platform } from 'react-native';
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
} from '../Actions';
import { getRSAKey } from '../Lib';
import { intlShape, injectIntl, defineMessages } from 'react-intl';

import { View } from '../../BaseComponents';
import TabsView from './TabViews/TabsView';
import { DimmerPopup } from './TabViews/SubViews';
import DeviceDetails from './DeviceDetails/DeviceDetails';
import { NavigationHeader } from './DeviceDetails/SubViews';
import AddLocationNavigator from './Location/AddLocation/AddLocation';
import LocationDetailsNavigator from './Location/LocationDetails/LocationDetails';
import ScheduleNavigator from './Schedule/ScheduleNavigator';
import DimmerStep from './TabViews/SubViews/Device/DimmerStep';
import { SettingsScreen } from './Settings';
import ChangeLog from './ChangeLog/ChangeLog';
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
	ChangeLog: {
		screen: ChangeLog,
		navigationOptions: {
			header: null,
		},
	},
	DeviceDetails: {
		screen: DeviceDetails,
		navigationOptions: ({navigation}: Object): Object => {
			return {
				header: Platform.OS === 'ios' ? null : <NavigationHeader navigation={navigation}/>,
			};
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
		navigationOptions: ({navigation}: Object): Object => {
			let {state} = navigation;
			let renderRootHeader = state.params && state.params.renderRootHeader;
			if (renderRootHeader) {
				return {
					header: Platform.OS === 'ios' ? null : <NavigationHeader navigation={navigation}/>,
				};
			}
			return {
				header: null,
			};
		},
	},
	LocationDetails: {
		screen: LocationDetailsNavigator,
		navigationOptions: ({navigation}: Object): Object => {
			let {state} = navigation;
			let renderRootHeader = state.params && state.params.renderRootHeader;
			if (renderRootHeader) {
				return {
					header: Platform.OS === 'ios' ? null : <NavigationHeader navigation={navigation}/>,
				};
			}
			return {
				header: null,
			};
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
	configureLocalControl: () => void;
	onLayout: (Object) => void;

	constructor() {
		super();

		this.state = {
			currentScreen: 'Tabs',
		};

		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
		this.onDoneDimming = this.onDoneDimming.bind(this);

		this.timeOutConfigureLocalControl = null;
		this.configureLocalControl = this.configureLocalControl.bind(this);
		this.onLayout = this.onLayout.bind(this);
	}

	componentWillMount() {
		this.props.dispatch(appStart());
		this.props.dispatch(appState());
	}

	componentDidMount() {
		// Calling other API requests after resolving the very first one, in order to avoid the situation, where
		// access_token has expired and the API requests, all together goes for fetching new token with refresh_token,
		// and results in generating multiple tokens.
		this.props.dispatch(getUserProfile()).then(() => {
			this.props.dispatch(syncLiveApiOnForeground());
			this.props.dispatch(getGateways());
			this.props.dispatch(getAppData());
			this.props.dispatch(resetSchedule());

			const that = this;
			this.timeOutConfigureLocalControl = setTimeout(() => {
				that.configureLocalControl();
			}, 5000);
		});
	}
	/**
	 * Request for token to control gateways locally, if gateway is online.
	 * Also send UDP package to the broadcast IP to detect gateways connected in the same LAN.
	 */
	configureLocalControl() {
		const { gateways, dispatch } = this.props;
		dispatch(autoDetectLocalTellStick());
		getRSAKey(true, ({ pemPub }: Object) => {
			if (pemPub) {
				for (let index in gateways) {
					const gateway = gateways[index];
					const { id, websocketOnline, websocketConnected, localKey } = gateway;
					const { key } = localKey;
					if (websocketOnline && websocketConnected && !key) {
						dispatch(getTokenForLocalControl(id, pemPub));
					}
				}
			}
		});
	}

	componentWillReceiveProps(nextProps: Object) {
		let { showToast, messageToast, durationToast, positionToast, gateways } = nextProps;
		if (showToast) {
			let { formatMessage } = this.props.intl;
			let message = messageToast ? messageToast : formatMessage(messages.errortoast);
			this._showToast(message, durationToast, positionToast);
		}

		/**
		* Checking if any gateways failed to configure local control during app start,
		* because websocket failed to stay connected.
		* If the previous connected state was 'false' and new state is 'true' and key is missing,
		* then if socket is online will try to get a token for local control.
		*/
		this.updateLocalControl(gateways);
	}

	updateLocalControl(gateways: Object) {
		const { dispatch } = this.props;
		// TODO, since this is root component, getRSAKey function will be called very frequently which will
		// result in fetching keys from local. Need to check performance and resource utilisation.
		getRSAKey(false, ({ pemPub }: Object) => {
			if (pemPub) {
				for (let index in gateways) {
					const gateway = gateways[index];
					const prevGateway = this.props.gateways[index];
					if (prevGateway) {
						const { localKey, websocketConnected, websocketOnline } = gateway;
						const { websocketConnected: prevWebsocketConnected } = prevGateway;
						if (websocketOnline && !prevWebsocketConnected && websocketConnected) {
							const { key } = localKey;
							if (!key) {
								dispatch(getTokenForLocalControl(gateway.id, pemPub));
							}
						}
					}
				}
			}
		});
	}

	componentWillUnmount() {
		clearTimeout(this.timeOutConfigureLocalControl);
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
