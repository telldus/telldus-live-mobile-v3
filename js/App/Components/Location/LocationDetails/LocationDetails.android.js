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
import { StackNavigator } from 'react-navigation';
import { connect } from 'react-redux';

import { View } from '../../../../BaseComponents';
import { NavigationHeader } from '../../DeviceDetails/SubViews';
import LocationDetailsContainer from './LocationDetailsContainer';

import Details from './Details';
import EditName from './EditName';
import EditTimeZoneContinent from './EditTimeZoneContinent';
import EditTimeZoneCity from './EditTimeZoneCity';
import EditGeoPosition from './EditGeoPosition';

import { getRouteName } from '../../../Lib';

const initialRouteName = 'Details';

type renderContainer = (Object) => Object;

const renderLocationDetailsContainer = (navigation: Object, screenProps: Object): renderContainer => (Component: Object): Object => (
	<LocationDetailsContainer navigation={navigation} screenProps={screenProps}>
		<Component/>
	</LocationDetailsContainer>
);

const RouteConfigs = {
	Details: {
		screen: ({ navigation, screenProps }: Object): Object => renderLocationDetailsContainer(navigation, screenProps)(Details),
	},
	EditName: {
		screen: ({ navigation, screenProps }: Object): Object => renderLocationDetailsContainer(navigation, screenProps)(EditName),
	},
	EditTimeZoneContinent: {
		screen: ({ navigation, screenProps }: Object): Object => renderLocationDetailsContainer(navigation, screenProps)(EditTimeZoneContinent),
	},
	EditTimeZoneCity: {
		screen: ({ navigation, screenProps }: Object): Object => renderLocationDetailsContainer(navigation, screenProps)(EditTimeZoneCity),
	},
	EditGeoPosition: {
		screen: ({ navigation, screenProps }: Object): Object => renderLocationDetailsContainer(navigation, screenProps)(EditGeoPosition),
	},
};

const StackNavigatorConfig = {
	initialRouteName,
	headerMode: 'float',
	initialRouteParams: {renderHeader: false},
	navigationOptions: ({navigation}: Object): Object => {
		let {state} = navigation;
		let renderStackHeader = state.routeName !== 'Details';
		if (renderStackHeader) {
			return {
				header: <NavigationHeader navigation={navigation}/>,
			};
		}
		return {
			header: null,
		};
	},
};

const Stack = StackNavigator(RouteConfigs, StackNavigatorConfig);

type Props = {
	navigation: Object,
	appLayout: Object,
	screenReaderEnabled: boolean,
};

type State = {
	currentScreen: string,
};


class LocationDetailsNavigator extends View {

	props: Props;
	state: State;

	onNavigationStateChange: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			currentScreen: 'Details',
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
			if (currentScreen === 'Details' && !navigation.state.params.renderRootHeader) {
				navigation.setParams({renderRootHeader: true});
			}
			if (currentScreen !== 'Details' && navigation.state.params.renderRootHeader) {
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
			<Stack onNavigationStateChange={this.onNavigationStateChange} screenProps={screenProps}/>
		);
	}
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	return {
		appLayout: state.App.layout,
		screenReaderEnabled: state.App.screenReaderEnabled,
	};
}

export default connect(mapStateToProps, null)(LocationDetailsNavigator);
