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
import { Easing, Animated } from 'react-native';
import { StackNavigator } from 'react-navigation';
import { connect } from 'react-redux';
import { intlShape, injectIntl, defineMessages } from 'react-intl';

import { View } from 'BaseComponents';

import { NavigationHeader } from 'DDSubViews';
import ChangeLogContainer from './ChangeLogContainer';
import ChangeLogPoster from './SubViews/ChangeLogPoster';
import Wizard from './SubViews/Wizard';

import { getRouteName } from 'Lib';

const Screens = ['WizardOne', 'WizardTwo', 'WizardThree', 'WizardFour', 'WizardFive'];

const renderChangeLogContainer = (navigation, screenProps): Function => (Component): Object => (
	<ChangeLogContainer navigation={navigation} screenProps={screenProps}>
		<Component/>
	</ChangeLogContainer>
);


const RouteConfigs = {
	WizardOne: {
		screen: ({ navigation, screenProps }) => renderChangeLogContainer(navigation, screenProps)(Wizard),
	},
	WizardTwo: {
		screen: ({ navigation, screenProps }) => renderChangeLogContainer(navigation, screenProps)(Wizard),
	},
	WizardThree: {
		screen: ({ navigation, screenProps }) => renderChangeLogContainer(navigation, screenProps)(Wizard),
	},
	WizardFour: {
		screen: ({ navigation, screenProps }) => renderChangeLogContainer(navigation, screenProps)(Wizard),
	},
	WizardFive: {
		screen: ({ navigation, screenProps }) => renderChangeLogContainer(navigation, screenProps)(Wizard),
	},
};

const StackNavigatorConfig = {
	initialRouteName: 'WizardOne',
	navigationOptions: ({navigation}) => {
		return {
			header: null,
		};
	},
	transitionConfig: () => ({
		transitionSpec: {
		  duration: 600,
		  easing: Easing.out(Easing.poly(4)),
		  timing: Animated.timing,
		},
		screenInterpolator: sceneProps => {
		  const { layout, position, scene } = sceneProps;
		  const { index } = scene;

		  const width = layout.initWidth;
		  const translateX = position.interpolate({
				inputRange: [index - 1, index, index + 1],
				outputRange: [width, 0, 0],
		  });

		  const opacity = position.interpolate({
				inputRange: [index - 1, index - 0.99, index],
				outputRange: [0, 1, 1],
		  });

		  return { opacity, transform: [{ translateX }] };
		},
	  }),
};

const Stack = StackNavigator(RouteConfigs, StackNavigatorConfig);

const messages = defineMessages({
	headerOne: {
		id: 'changeLog.headerOne',
		defaultMessage: 'Explore new features',
	},
	headerTwo: {
		id: 'changeLog.headerTwo',
		defaultMessage: 'New in version 3.5',
	},
});

type Props = {
	appLayout: Object,
	screenReaderEnabled: boolean,
	intl: intlShape,
	changeLogVersion: string,
};

type State = {
	currentScreen: string,
};


class ChangeLogNavigator extends View {
	props: Props;
	state: State;

	h1: string;
	h2: string;

	onNavigationStateChange: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			currentScreen: 'WizardOne',
		};

		let { formatMessage } = props.intl;

		this.h1 = formatMessage(messages.headerOne);
		this.h2 = formatMessage(messages.headerTwo);

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
		let { appLayout, screenReaderEnabled, intl, changeLogVersion } = this.props;
		let screenProps = {
			currentScreen,
			appLayout,
			screenReaderEnabled,
			Screens,
			intl,
			changeLogVersion,
		};
		let { h1, h2 } = this;

		return (
			<View>
				<NavigationHeader showLeftIcon={false}/>
				<ChangeLogPoster h1={h1} h2={h2}/>
				<Stack onNavigationStateChange={this.onNavigationStateChange} screenProps={screenProps}/>
			</View>
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
