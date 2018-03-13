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

import React from 'React';
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
} from '../Actions';
import { intlShape, injectIntl, defineMessages } from 'react-intl';
import { resetSchedule } from 'Actions_Schedule';
import ScheduleNavigator from 'ScheduleNavigator';

const messages = defineMessages({
	errortoast: {
		id: 'errortoast',
		defaultMessage: 'Action could not be completed.',
		description: 'The error messgage to show, when a device action cannot be performed',
	},
});

import { View } from '../../BaseComponents';
import TabsView from './TabViews/TabsView';
import { DimmerPopup } from './TabViews/SubViews';
import DeviceDetails from './DeviceDetails/DeviceDetails';
import { NavigationHeader } from './DeviceDetails/SubViews';
import AddLocationNavigator from './Location/AddLocation/AddLocation';
import LocationDetailsNavigator from './Location/LocationDetails/LocationDetails';
import DimmerStep from './TabViews/SubViews/Device/DimmerStep';

import { hideDimmerStep } from '../Actions/Dimmer';
import { getUserProfile as getUserProfileSelector } from '../Reducers/User';

const RouteConfigs = {
	Tabs: {
		screen: TabsView,
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
	toastVisible: boolean,
	toastMessage: string,
	toastDuration: string,
	toastPosition: string,
	intl: intlShape.isRequired,
};

type State = {
	currentScreen: string,
};

class AppNavigator extends View {

	props: Props;
	state: State;

	onNavigationStateChange: (Object) => void;
	onDoneDimming: (Object) => void;

	constructor() {
		super();

		this.state = {
			currentScreen: 'Tabs',
		};

		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
		this.onDoneDimming = this.onDoneDimming.bind(this);
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
		});
	}

	componentWillReceiveProps(nextProps: Object) {
		if (nextProps.toastVisible) {
			let { formatMessage } = this.props.intl;
			let message = nextProps.toastMessage ? nextProps.toastMessage : formatMessage(messages.errortoast);
			this._showToast(message);
		}
	}

	_showToast(message: string) {
		Toast.showWithGravity(message, Toast.SHORT, Toast.TOP);
		this.props.dispatch({
			type: 'GLOBAL_ERROR_HIDE',
		});
	}

	onNavigationStateChange(prevState: Object, currentState: Object) {
		const index = currentState.index;
		this.setState({ currentScreen: currentState.routes[index].routeName });
	}

	onDoneDimming() {
		this.props.dispatch(hideDimmerStep());
	}

	render(): Object {
		let { currentScreen } = this.state;
		let { intl, dimmer } = this.props;
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
			</View>
		);
	}
}

AppNavigator.propTypes = {
	dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state: Object, ownProps: Object): Object {
	return {
		tab: state.navigation.tab,
		accessToken: state.user.accessToken,
		userProfile: getUserProfileSelector(state),
		dimmer: state.dimmer,
		toastVisible: state.App.showToast,
		toastMessage: state.App.message,
		toastDuration: state.App.duration,
		toastPosition: state.App.position,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(AppNavigator));
