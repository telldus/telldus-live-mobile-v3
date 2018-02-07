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
import { intlShape, injectIntl } from 'react-intl';

import { View, Header } from 'BaseComponents';

import ChangeLogContainer from './ChangeLogContainer';
import WizardOne from './WizardOne';
import WizardTwo from './WizardTwo';
import WizardThree from './WizardThree';
import WizardFour from './WizardFour';
import WizardFive from './WizardFive';

import { getRouteName } from 'Lib';

const Screens = ['WizardOne', 'WizardTwo', 'WizardThree', 'WizardFour', 'WizardFive'];

const renderChangeLogContainer = (navigation, screenProps): Function => (Component): Object => (
	<ChangeLogContainer navigation={navigation} screenProps={screenProps}>
		<Component/>
	</ChangeLogContainer>
);


const RouteConfigs = {
	WizardOne: {
		screen: ({ navigation, screenProps }) => renderChangeLogContainer(navigation, screenProps)(WizardOne),
	},
	WizardTwo: {
		screen: ({ navigation, screenProps }) => renderChangeLogContainer(navigation, screenProps)(WizardTwo),
	},
	WizardThree: {
		screen: ({ navigation, screenProps }) => renderChangeLogContainer(navigation, screenProps)(WizardThree),
	},
	WizardFour: {
		screen: ({ navigation, screenProps }) => renderChangeLogContainer(navigation, screenProps)(WizardFour),
	},
	WizardFive: {
		screen: ({ navigation, screenProps }) => renderChangeLogContainer(navigation, screenProps)(WizardFive),
	},
};

const StackNavigatorConfig = {
	initialRouteName: 'WizardOne',
	navigationOptions: ({navigation}) => {
		return {
			header: <Header style={{alignItems: 'center', justifyContent: 'center'}}/>,
		};
	},
};

const Stack = StackNavigator(RouteConfigs, StackNavigatorConfig);

type Props = {
	appLayout: Object,
	screenReaderEnabled: boolean,
	intl: intlShape,
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
		let { appLayout, screenReaderEnabled, intl } = this.props;
		let screenProps = {
			currentScreen,
			appLayout,
			screenReaderEnabled,
			Screens,
			intl,
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

export default connect(mapStateToProps, null)(injectIntl(ChangeLogNavigator));
