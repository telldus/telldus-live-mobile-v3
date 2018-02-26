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
import { Animated } from 'react-native';
import { StackNavigator } from 'react-navigation';
import { connect } from 'react-redux';
import { intlShape, injectIntl, defineMessages } from 'react-intl';

import { View, FloatingButton, Text, StyleSheet } from '../../../BaseComponents';

import { NavigationHeader } from '../DeviceDetails/SubViews';
import ChangeLogContainer from './ChangeLogContainer';
import ChangeLogPoster from './SubViews/ChangeLogPoster';
import Wizard from './SubViews/Wizard';
const AnimatedWizard = Animated.createAnimatedComponent(Wizard);

import { getRouteName } from '../../Lib';
import Theme from '../../Theme';
import i18n from '../../Translations/common';

import { setChangeLogVersion } from '../../Actions';

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
	skipButton: {
		id: 'changeLog.button.skipButton',
		defaultMessage: 'skip this',
	},
});

type Props = {
	appLayout: Object,
	screenReaderEnabled: boolean,
	intl: intlShape,
	changeLogVersion?: string,
	dispatch: Function,
};

type State = {
	currentScreen: string,
};


class ChangeLogNavigator extends View {
	props: Props;
	state: State;

	h1: string;
	h2: string;

	nextButton: string;
	skipButton: string;
	doneButton: string;

	onNavigationStateChange: () => void;

	onPressNext: () => void;
	onPressPrev: () => void;
	onPressSkip: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			currentScreen: 'WizardOne',
			nextScreen: 'WizardOne',
		};

		let { formatMessage } = props.intl;

		this.h1 = formatMessage(messages.headerOne);
		this.h2 = formatMessage(messages.headerTwo);

		this.nextButton = formatMessage(i18n.next);
		this.skipButton = formatMessage(messages.skipButton).toUpperCase();
		this.doneButton = formatMessage(i18n.done);

		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);

		this.onPressNext = this.onPressNext.bind(this);
		this.onPressPrev = this.onPressPrev.bind(this);
		this.onPressSkip = this.onPressSkip.bind(this);

		this.animatedX = new Animated.Value(0);
	}

	onNavigationStateChange(prevState: Object, currentState: Object) {
		const currentScreen = getRouteName(currentState);
		if (this.state.currentScreen !== currentScreen) {
			this.setState({
				currentScreen,
			});
		}
	}

	onPressNext() {
		let { dispatch, changeLogVersion, appLayout } = this.props;
		let { currentScreen } = this.state;
		let nextIndex = Screens.indexOf(currentScreen) + 1;
		let nextScreen = Screens[nextIndex];

		let isFinalScreen = Screens.indexOf(currentScreen) === (Screens.length - 1);
		if (isFinalScreen) {
			dispatch(setChangeLogVersion(changeLogVersion));
		} else {
			this.setState({
				currentScreen: nextScreen,
			});
			this.animatedX.setValue(-appLayout.width);
			this.startAnimation(0);
		}
	}

	startAnimation(value) {
		Animated.timing(this.animatedX, {
			toValue: value,
			duration: 500,
		}).start();
	}

	onPressPrev() {
		let { appLayout } = this.props;
		let { currentScreen } = this.state;
		let prevIndex = Screens.indexOf(currentScreen) - 1;
		let prevScreen = Screens[prevIndex];

		let isFirstScreen = Screens.indexOf(currentScreen) === 0;
		if (!isFirstScreen) {
			this.setState({
				currentScreen: prevScreen,
			});
			this.animatedX.setValue(appLayout.width);
			this.startAnimation(0);
		}
	}

	onPressSkip() {
		let { dispatch, changeLogVersion } = this.props;
		dispatch(setChangeLogVersion(changeLogVersion));
	}


	render() {
		let { currentScreen, nextScreen } = this.state;
		let { appLayout, screenReaderEnabled, intl, changeLogVersion } = this.props;
		let screenProps = {
			currentScreen,
			appLayout,
			screenReaderEnabled,
			Screens,
			intl,
			changeLogVersion,
			nextScreen,
		};
		let { h1, h2 } = this;

		const isFirstScreen = Screens.indexOf(currentScreen) === 0;

		let { stepIndicatorCover, floatingButtonLeft } = this.getStyles(appLayout);

		let inputRange = (appLayout && appLayout.width) ? [-appLayout.width, 0] : [-100, 0];
		let outputRange = (appLayout && appLayout.width) ? [appLayout.width, 0] : [-100, 0];

		const animatedX = this.animatedX.interpolate({
			inputRange,
			outputRange,
			extrapolateLeft: 'clamp',
			useNativeDriver: true,
		  });

		return (
			<View style={{flex: 1, backgroundColor: '#EFEFF4'}}>
				<NavigationHeader showLeftIcon={false}/>
				<ChangeLogPoster h1={h1} h2={h2}/>
				<AnimatedWizard intl={intl} currentScreen={currentScreen} styles={styles} animatedX={animatedX}/>
				<View style={styles.buttonCover}>
					<Text style={styles.textSkip} onPress={this.onPressSkip}>
						{this.skipButton}
					</Text>
				</View>
				<View style={stepIndicatorCover}>
					{!isFirstScreen && (<FloatingButton
						imageSource={require('../TabViews/img/right-arrow-key.png')}
						onPress={this.onPressPrev}
						buttonStyle={floatingButtonLeft}
						iconStyle={styles.buttonIconStyle}/>
					)}
					{Screens.map((screen, index) => {
						let backgroundColor = Screens[index] === currentScreen ?
							Theme.Core.brandSecondary : '#00000080';
						return <View style={[styles.stepIndicator, { backgroundColor }]} key={index}/>;
					})
					}
					<FloatingButton
						imageSource={require('../TabViews/img/right-arrow-key.png')}
						onPress={this.onPressNext}
						buttonStyle={{bottom: 0}}/>
				</View>
			</View>
		);
	}

	getStyles(appLayout: Object) {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const buttonSize = deviceWidth * 0.134666667;

		return {
			stepIndicatorCover: {
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
				marginBottom: 10,
				height: buttonSize,
				backgroundColor: '#EFEFF4',
			},
			floatingButtonLeft: {
				left: deviceWidth * 0.034666667,
				bottom: 0,
			},
		};
	}
}

const styles = StyleSheet.create({
	buttonCover: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#EFEFF4',
	},
	textSkip: {
		paddingVertical: 10,
		color: Theme.Core.brandSecondary,
		textAlign: 'center',
	},
	stepIndicator: {
		height: 10,
		width: 10,
		borderRadius: 5,
		marginLeft: 7,
	},
	buttonIconStyle: {
		transform: [{rotateZ: '180deg'}],
	},
	container: {
		...Theme.Core.shadow,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 15,
		paddingVertical: 15,
		marginHorizontal: 10,
		marginVertical: 10,
	},
	icon: {
		fontSize: 100,
		color: Theme.Core.brandSecondary,
	},
	title: {
		fontSize: 20,
		color: '#00000090',
		textAlign: 'center',
		paddingHorizontal: 10,
		marginVertical: 10,
	},
	description: {
		fontSize: 14,
		color: '#00000080',
		textAlign: 'left',
	},
});

function mapStateToProps(state, ownProps) {
	return {
		appLayout: state.App.layout,
		screenReaderEnabled: state.App.screenReaderEnabled,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ChangeLogNavigator));
