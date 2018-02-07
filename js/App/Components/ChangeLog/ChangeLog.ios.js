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
 * @providesModule ChangeLogNavigator
 */

// @flow

'use strict';

import React from 'react';
import { StackNavigator } from 'react-navigation';
import { connect } from 'react-redux';

import { View } from 'BaseComponents';
import ChangeLogContainer from './ChangeLogContainer';

import WizardOne from './WizardOne';

import { getRouteName } from 'Lib';

const renderChangeLogContainer = (navigation, screenProps) => Component => (
	<ChangeLogContainer navigation={navigation} screenProps={screenProps}>
		<Component/>
	</ChangeLogContainer>
);


const RouteConfigs = {
	LocationDetected: {
		screen: ({ navigation, screenProps }) => renderChangeLogContainer(navigation, screenProps)(WizardOne),
	},
};

const StackNavigatorConfig = {
	initialRouteName: 'WizardOne',
	navigationOptions: ({navigation}) => {
		return {
			header: null,
		};
	},
};

const Stack = StackNavigator(RouteConfigs, StackNavigatorConfig);

type Props = {
	appLayout: Object,
	screenReaderEnabled: boolean,
};

type State = {
	currentScreen: string,
};


class ChangeLogNavigator extends View {

	props: Props;
	state: State;

	onNavigationStateChange: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			currentScreen: 'WizardOne',
		};

		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
	}

	onNavigationStateChange(prevState: Object, currentState: Object) {
		const currentScreen = getRouteName(currentState);
		if (this.state.currentScreen !== currentScreen) {
			this.setState({
				currentScreen,
			});
		}
	}


	render() {

		let { currentScreen } = this.state;
		let { appLayout, screenReaderEnabled } = this.props;
		let screenProps = {
			currentScreen,
			appLayout,
			screenReaderEnabled,
		};

		return (
			<Stack onNavigationStateChange={this.onNavigationStateChange} screenProps={screenProps}/>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		appLayout: state.App.layout,
		screenReaderEnabled: state.App.screenReaderEnabled,
	};
}

export default connect(mapStateToProps, null)(ChangeLogNavigator);
