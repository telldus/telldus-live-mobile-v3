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
 *
 */

// @flow

'use strict';

import React from 'react';
import { createStackNavigator } from 'react-navigation';
import { connect } from 'react-redux';

import { View, SafeAreaView } from '../../../../BaseComponents';
import { NavigationHeader } from '../../DeviceDetails/SubViews';
import AddLocationContainer from './AddLocationContainer';

import LocationDetected from './LocationDetected';
import LocationActivationManual from './LocationActivationManual';
import LocationName from './LocationName';
import TimeZoneContinent from './TimeZoneContinent';
import TimeZoneCity from './TimeZoneCity';
import TimeZone from './TimeZone';
import Success from './Success';
import Position from './Position';

import { getRouteName, getRelativeDimensions } from '../../../Lib';

const initialRouteName = 'LocationDetected';

type renderContainer = (Object) => Object;

const renderAddLocationContainer = (navigation: Object, screenProps: Object): renderContainer => (Component: Object): Object => (
	<AddLocationContainer navigation={navigation} screenProps={screenProps}>
		<Component/>
	</AddLocationContainer>
);


const RouteConfigs = {
	LocationDetected: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddLocationContainer(navigation, screenProps)(LocationDetected),
	},
	LocationActivationManual: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddLocationContainer(navigation, screenProps)(LocationActivationManual),
	},
	LocationName: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddLocationContainer(navigation, screenProps)(LocationName),
	},
	TimeZoneContinent: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddLocationContainer(navigation, screenProps)(TimeZoneContinent),
	},
	TimeZoneCity: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddLocationContainer(navigation, screenProps)(TimeZoneCity),
	},
	TimeZone: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddLocationContainer(navigation, screenProps)(TimeZone),
	},
	Position: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddLocationContainer(navigation, screenProps)(Position),
	},
	Success: {
		screen: ({ navigation, screenProps }: Object): Object => renderAddLocationContainer(navigation, screenProps)(Success),
	},
};

const StackNavigatorConfig = {
	initialRouteName,
	headerMode: 'float',
	initialRouteParams: {renderHeader: false},
	navigationOptions: ({navigation}: Object): Object => {
		let {state} = navigation;
		let renderStackHeader = state.routeName !== 'LocationDetected';
		if (renderStackHeader) {
			return {
				header: <NavigationHeader navigation={navigation} showLeftIcon={state.routeName !== 'Success'}/>,
			};
		}
		return {
			header: null,
		};
	},
};

const Stack = createStackNavigator(RouteConfigs, StackNavigatorConfig);

type Props = {
	navigation: Object,
	appLayout: Object,
	screenReaderEnabled: boolean,
};

type State = {
	currentScreen: string,
};


class AddLocationNavigator extends View {

	props: Props;
	state: State;

	onNavigationStateChange: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			currentScreen: 'LocationDetected',
		};

		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
	}

	onNavigationStateChange(prevState: Object, currentState: Object) {
		const currentScreen = getRouteName(currentState);
		if (this.state.currentScreen !== currentScreen) {
			this.setState({
				currentScreen,
			});
			let {navigation} = this.props;
			if (currentScreen === 'LocationDetected' && !navigation.state.params.renderRootHeader) {
				navigation.setParams({renderRootHeader: true});
			}
			if (currentScreen !== 'LocationDetected' && navigation.state.params.renderRootHeader) {
				navigation.setParams({renderRootHeader: false});
			}
		}
	}


	render(): Object {

		let { currentScreen } = this.state;
		let { appLayout, navigation, screenReaderEnabled } = this.props;
		let screenProps = {
			currentScreen,
			rootNavigator: navigation,
			appLayout,
			screenReaderEnabled,
			initialRouteName,
		};

		return (
			<SafeAreaView>
				{this.props.navigation.state.params.renderRootHeader &&
				<NavigationHeader navigation={navigation} />
				}
				<Stack onNavigationStateChange={this.onNavigationStateChange} screenProps={screenProps}/>
			</SafeAreaView>
		);
	}
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	return {
		appLayout: getRelativeDimensions(state.App.layout),
		screenReaderEnabled: state.App.screenReaderEnabled,
	};
}

export default connect(mapStateToProps, null)(AddLocationNavigator);
