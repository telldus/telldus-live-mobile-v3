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
 * @providesModule AddLocationNavigator
 */

// @flow

'use strict';

import React from 'react';
import { StackNavigator } from 'react-navigation';
import ExtraDimensions from 'react-native-extra-dimensions-android';

import { View, Image, Dimensions } from 'BaseComponents';
import AddLocationContainer from './AddLocationContainer';

import LocationDetected from './LocationDetected';
import LocationActivationManual from './LocationActivationManual';
import LocationName from './LocationName';
import TimeZoneContinent from './TimeZoneContinent';
import TimeZoneCity from './TimeZoneCity';
import TimeZone from './TimeZone';
import Success from './Success';
import Position from './Position';

import {getRouteName} from 'Lib';

import Theme from 'Theme';
const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;

const renderAddLocationContainer = (navigation, screenProps) => Component => (
	<AddLocationContainer navigation={navigation} screenProps={screenProps}>
		<Component/>
	</AddLocationContainer>
);


const RouteConfigs = {
	LocationDetected: {
		screen: ({ navigation, screenProps }) => renderAddLocationContainer(navigation, screenProps)(LocationDetected),
	},
	LocationActivationManual: {
		screen: ({ navigation, screenProps }) => renderAddLocationContainer(navigation, screenProps)(LocationActivationManual),
	},
	LocationName: {
		screen: ({ navigation, screenProps }) => renderAddLocationContainer(navigation, screenProps)(LocationName),
	},
	TimeZoneContinent: {
		screen: ({ navigation, screenProps }) => renderAddLocationContainer(navigation, screenProps)(TimeZoneContinent),
	},
	TimeZoneCity: {
		screen: ({ navigation, screenProps }) => renderAddLocationContainer(navigation, screenProps)(TimeZoneCity),
	},
	TimeZone: {
		screen: ({ navigation, screenProps }) => renderAddLocationContainer(navigation, screenProps)(TimeZone),
	},
	Position: {
		screen: ({ navigation, screenProps }) => renderAddLocationContainer(navigation, screenProps)(Position),
	},
	Success: {
		screen: ({ navigation, screenProps }) => renderAddLocationContainer(navigation, screenProps)(Success),
	},
};

const StackNavigatorConfig = {
	initialRouteName: 'LocationDetected',
	headerMode: 'float',
	initialRouteParams: {renderHeader: false},
	navigationOptions: ({navigation}) => {
		let {state} = navigation;
		let renderStackHeader = state.routeName !== 'LocationDetected';
		if (renderStackHeader) {
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
};

const Stack = StackNavigator(RouteConfigs, StackNavigatorConfig);

function renderHeader(): Object {
	return (
		<Image style={{ height: 110, width: 130, marginHorizontal: deviceWidth * 0.18 }} resizeMode={'contain'} source={require('../TabViews/img/telldus-logo.png')}/>
	);
}

type Props = {
	navigation: Object,
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


	render() {

		let { currentScreen } = this.state;
		let screenProps = {
			currentScreen,
			rootNavigator: this.props.navigation,
		};

		return (
			<Stack onNavigationStateChange={this.onNavigationStateChange} screenProps={screenProps}/>
		);
	}
}

export default AddLocationNavigator;
