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
import { Image, Dimensions } from 'react-native';
import { StackNavigator } from 'react-navigation';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import Toast from 'react-native-simple-toast';
import {
	getUserProfile,
	appStart,
	appState,
	appOrientation,
	syncLiveApiOnForeground,
	getAppData,
	getGateways,
} from 'Actions';
import { intlShape, injectIntl, defineMessages } from 'react-intl';

const messages = defineMessages({
	errortoast: {
		id: 'errortoast',
		defaultMessage: 'Action Currently Unavailable',
		description: 'The error messgage to show, when a device action cannot be performed',
	},
});

const deviceHeight = Dimensions.get('window').height;
let deviceWidth = Dimensions.get('window').width;
import Theme from 'Theme';

import { View, HeaderTitle } from 'BaseComponents';
import Platform from 'Platform';
import TabsView from 'TabsView';
import StatusBar from 'StatusBar';
import Orientation from 'react-native-orientation';
import { DimmerPopup } from 'TabViews_SubViews';
import DeviceDetailsTabsView from 'DeviceDetailsTabsView';
import AddLocationNavigator from 'AddLocationNavigator';

import { getUserProfile as getUserProfileSelector } from '../Reducers/User';
import { hasStatusBar } from 'Lib';

const RouteConfigs = {
	Tabs: {
		screen: TabsView,
		navigationOptions: {
			header: null,
		},
	},
	DeviceDetails: {
		screen: DeviceDetailsTabsView,
		navigationOptions: {
			headerStyle: {
				marginTop: hasStatusBar() ? ExtraDimensions.get('STATUS_BAR_HEIGHT') : 0,
				backgroundColor: Theme.Core.brandPrimary,
				height: deviceHeight * 0.1,
			},
			headerTintColor: '#ffffff',
			headerTitle: HeaderTitle,
		},
	},
	AddLocation: {
		screen: AddLocationNavigator,
		navigationOptions: ({navigation}: Object): Object => {
			let {state} = navigation;
			let renderRootHeader = state.params && state.params.renderRootHeader;
			if (renderRootHeader) {
				return {
					headerStyle: {
						marginTop: hasStatusBar() ? ExtraDimensions.get('STATUS_BAR_HEIGHT') : 0,
						backgroundColor: Theme.Core.brandPrimary,
						height: deviceHeight * 0.1,
					},
					headerTintColor: '#ffffff',
					headerTitle: renderStackHeader(),
				};
			}
			return {
				header: null,
			};
		},

	},
};

function renderStackHeader() {
	return (
		<Image style={{ height: 110, width: 130, marginLeft: (deviceWidth * 0.2) }} resizeMode={'contain'} source={require('./TabViews/img/telldus-logo.png')}/>
	);
}

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
	intl: intlShape.isRequired,
};

type State = {
	specificOrientation: string,
}

class AppNavigator extends View {

	props: Props;
	state: State;

	_updateSpecificOrientation: (Object) => void;

	constructor() {
		super();

		const init = Orientation.getInitialOrientation();

		this.state = {
			specificOrientation: init,
		};

		Orientation.unlockAllOrientations();
		Orientation.addSpecificOrientationListener(this._updateSpecificOrientation);
	}

	componentWillMount() {
		this.props.dispatch(appStart());
		this.props.dispatch(appState());
	}

	componentDidMount() {
		Platform.OS === 'ios' && StatusBar && StatusBar.setBarStyle('light-content');
		if (Platform.OS === 'android' && StatusBar) {
			StatusBar.setTranslucent(true);
			StatusBar.setBackgroundColor(Theme.Core.brandPrimary);
		}

		// Calling other API requests after resolving the very first one, in order to avoid the situation, where
		// access_token has expired and the API requests, all together goes for fetching new token with refresh_token,
		// and results in generating multiple tokens.
		this.props.dispatch(getUserProfile()).then(() => {
			this.props.dispatch(syncLiveApiOnForeground());
			this.props.dispatch(getGateways());
			this.props.dispatch(getAppData());
		});
		this.props.dispatch(appOrientation(this.state.specificOrientation));
	}

	componentWillUnmount() {
		Orientation.removeSpecificOrientationListener(this._updateSpecificOrientation);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.toastVisible) {
			this._showToast();
		}
	}

	_showToast() {
		Toast.showWithGravity(this.props.intl.formatMessage(messages.errortoast), Toast.SHORT, Toast.TOP);
		this.props.dispatch({
			type: 'GLOBAL_ERROR_HIDE',
		});
	}

	_updateSpecificOrientation = specificOrientation => {
		this.setState({ specificOrientation });
	};

	render() {
		return (
			<View>
				<Navigator/>
				<DimmerPopup
					isVisible={this.props.dimmer.show}
					name={this.props.dimmer.name}
					value={this.props.dimmer.value / 255}
				/>
			</View>
		);
	}
}

AppNavigator.propTypes = {
	dispatch: PropTypes.func.isRequired,
};


function mapStateToProps(state, ownProps) {
	return {
		tab: state.navigation.tab,
		accessToken: state.user.accessToken,
		userProfile: getUserProfileSelector(state),
		dimmer: state.dimmer,
		toastVisible: state.App.errorGlobalShow,
		toastMessage: state.App.errorGlobalMessage,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(AppNavigator));
