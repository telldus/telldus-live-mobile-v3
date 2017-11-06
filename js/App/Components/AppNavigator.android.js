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

import React, { PropTypes } from 'React';
import { connect } from 'react-redux';
import { Image, Dimensions } from 'react-native';
import { StackNavigator } from 'react-navigation';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import Toast from 'react-native-simple-toast';
import DrawerLayoutAndroid from 'DrawerLayoutAndroid';
import {
	getGateways,
	getSensors,
	getJobs,
	getUserProfile,
	appStart,
	appState,
	syncLiveApiOnForeground,
} from 'Actions';
import { authenticateSession, connectToGateways } from 'Actions_Websockets';
import { getDevices } from 'Actions_Devices';
import { hideToast } from 'Actions_App';
import { intlShape, injectIntl, defineMessages } from 'react-intl';
import { resetSchedule } from 'Actions_Schedule';
import ScheduleNavigator from 'ScheduleNavigatorNew';
import Drawer from 'Drawer';

const messages = defineMessages({
	errortoast: {
		id: 'errortoast',
		defaultMessage: 'Action Currently Unavailable',
		description: 'The error messgage to show, when a device action cannot be performed',
	},
});

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;
import Theme from 'Theme';

import { View, Icon, HeaderNav } from 'BaseComponents';
import TabsView from 'TabsView';
import StatusBar from 'StatusBar';
import { DimmerPopup } from 'TabViews_SubViews';
import DeviceDetailsTabsView from 'DeviceDetailsTabsView';

import { getUserProfile as getUserProfileSelector } from '../Reducers/User';

const RouteConfigs = {
	Tabs: {
		screen: TabsView,
		navigationOptions: ({navigation}: Object): Object => {
			let {state} = navigation;
			return {
				headerStyle: {
					marginTop: ExtraDimensions.get('STATUS_BAR_HEIGHT'),
					backgroundColor: Theme.Core.brandPrimary,
					height: deviceHeight * 0.1,
					elevation: 0,
				},
				headerTintColor: '#ffffff',
				headerTitle: renderHeader(),
				headerLeft: renderHeaderLeft(state),
				headerRight: renderHeaderRight(state),
			};
		},
	},
	DeviceDetails: {
		screen: DeviceDetailsTabsView,
		navigationOptions: {
			headerStyle: {
				marginTop: ExtraDimensions.get('STATUS_BAR_HEIGHT'),
				backgroundColor: Theme.Core.brandPrimary,
				height: deviceHeight * 0.1,
			},
			headerTintColor: '#ffffff',
			headerTitle: renderHeader(),
		},
	},
	Schedule: {
		screen: ScheduleNavigator,
		navigationOptions: ({navigation}: Object): Object => {
			let {state} = navigation;
			let renderRootHeader = state.params && state.params.renderRootHeader;
			if (renderRootHeader) {
				return {
					headerStyle: {
						marginTop: ExtraDimensions.get('STATUS_BAR_HEIGHT'),
						backgroundColor: Theme.Core.brandPrimary,
						height: deviceHeight * 0.1,
					},
					headerTintColor: '#ffffff',
					headerTitle: renderHeader(),
				};
			}
			return {
				header: null,
			};
		},
	},
};

function renderHeader(): React$Element<any> {
	return (
		<Image style={{ height: 110, width: 130, marginHorizontal: deviceWidth * 0.18 }} resizeMode={'contain'} source={require('./TabViews/img/telldus-logo.png')}/>
	);
}

function renderHeaderLeft(state: Object): React$Element<any> {
	return (
		<HeaderNav onPress={openDrawer} onPressParam={state}>
			<Icon name={'bars'} size={22} color={'#fff'}/>
		</HeaderNav>
	);
}

function openDrawer(args: Object) {
	args.params.openDrawer();
}

function renderHeaderRight(state: Object): React$Element<any> {
	if (state.params && (state.params.currentTab === 'devicesTab' || state.params.currentTab === 'sensorsTab')) {
		return (
			<HeaderNav onPress={toggleEditMode} onPressParam={state}>
				<Icon name={'star'} size={22} color={'#fff'}/>
			</HeaderNav>
		);
	}
}

function toggleEditMode(args: Object) {
	args.params.toggleEditMode();
}

const StackNavigatorConfig = {
	initialRouteName: 'Tabs',
};

const Navigator = StackNavigator(RouteConfigs, StackNavigatorConfig);

type Props = {
	dimmer: Object,
	accessToken: Object,
	userProfile: Object,
	dispatch: Function,
	toastVisible: boolean,
	toastMessage: string,
	toastDuration: string,
	toastPosition: string,
	intl: intlShape.isRequired,
	gateways: Object,
};

type State = {
	specificOrientation: Object,
	openSetting: boolean,
};

class AppNavigator extends View {

	props: Props;
	state: State;

	renderNavigationView: () => Object;
	openDrawer: () => void;
	closeDrawer: () => void;
	openSetting: () => void;
	closeSetting: () => void;

	constructor() {
		super();

		this.state = {
			openSetting: false,
			currentScreen: 'Tabs',
		};

		this.renderNavigationView = this.renderNavigationView.bind(this);
		this.openDrawer = this.openDrawer.bind(this);
		this.closeDrawer = this.closeDrawer.bind(this);
		this.openSetting = this.openSetting.bind(this);
		this.closeSetting = this.closeSetting.bind(this);

		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
	}

	componentWillMount() {
		this.props.dispatch(appStart());
		this.props.dispatch(appState());
	}

	componentDidMount() {
		if (StatusBar) {
			StatusBar.setTranslucent(true);
			StatusBar.setBackgroundColor(Theme.Core.brandPrimary);
		}

		this.props.dispatch(getUserProfile());
		this.props.dispatch(authenticateSession());
		this.props.dispatch(connectToGateways());
		this.props.dispatch(syncLiveApiOnForeground());

		this.props.dispatch(getDevices());
		this.props.dispatch(getGateways());
		this.props.dispatch(getSensors());
		this.props.dispatch(getJobs());
		this.props.dispatch(resetSchedule());
	}

	componentWillReceiveProps(nextProps: Object) {
		if (nextProps.toastVisible) {
			let message = nextProps.toastMessage ? nextProps.toastMessage : this.props.intl.formatMessage(messages.errortoast);
			this._showToast(message, nextProps.toastDuration, nextProps.toastPosition);
		}
	}

	_showToast(message: string, duration: string, position: string) {
		Toast.showWithGravity(message, Toast[duration], Toast[position]);
		this.props.dispatch(hideToast());
	}

	openDrawer() {
		this.refs.drawer.openDrawer();
	}

	closeDrawer() {
		this.refs.drawer.closeDrawer();
	}

	openSetting() {
		this.setState({
			openSetting: true,
		});
	}

	closeSetting() {
		this.setState({
			openSetting: false,
		});
	}

	getRouteName(navigationState: Object): any {
		if (!navigationState) {
			return null;
		}
		const route = navigationState.routes[navigationState.index];
		if (route.routes) {
			return this.getRouteName(route);
		}
		return route.routeName;
	}

	onNavigationStateChange(prevState: Object, currentState: Object) {
		const currentScreen = this.getRouteName(currentState);
		if (this.state.currentScreen !== currentScreen) {
			this.setState({
				currentScreen,
			});
		}
	}

	renderNavigationView(): React$Element<any> {
		return <Drawer
			gateways={this.props.gateways}
			userProfile={this.props.userProfile}
			openSetting={this.openSetting}
		/>;
	}

	render(): React$Element<any> {
		let screenProps = {
			openDrawer: this.openDrawer,
			closeDrawer: this.closeDrawer,
			openSetting: this.state.openSetting,
			closeSetting: this.closeSetting,
			currentScreen: this.state.currentScreen,
		};

		return (
			<View>
				<DrawerLayoutAndroid
					ref="drawer"
					drawerWidth={250}
					drawerPosition={DrawerLayoutAndroid.positions.Left}
					renderNavigationView={this.renderNavigationView}
				>
					<Navigator screenProps={screenProps} onNavigationStateChange={this.onNavigationStateChange}/>
				</DrawerLayoutAndroid>
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

function mapStateToProps(state: Object, ownProps: Object): Object {
	return {
		accessToken: state.user.accessToken,
		userProfile: getUserProfileSelector(state),
		dimmer: state.dimmer,
		gateways: state.gateways,
		toastVisible: state.App.showToast,
		toastMessage: state.App.message,
		toastDuration: state.App.duration,
		toastPosition: state.App.position,
	};
}

module.exports = connect(mapStateToProps)(injectIntl(AppNavigator));
