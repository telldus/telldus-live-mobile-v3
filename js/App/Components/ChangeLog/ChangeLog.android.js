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
import { Animated, LayoutAnimation, UIManager, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { intlShape, injectIntl, defineMessages } from 'react-intl';

import { View, FloatingButton, Text, StyleSheet } from '../../../BaseComponents';

import { NavigationHeader } from '../DeviceDetails/SubViews';
import ChangeLogPoster from './SubViews/ChangeLogPoster';
import Wizard from './SubViews/Wizard';
const AnimatedWizard = Animated.createAnimatedComponent(Wizard);

import { getRouteName } from '../../Lib';
import Theme from '../../Theme';
import i18n from '../../Translations/common';

import { setChangeLogVersion } from '../../Actions';

const CustomLayoutAnimation = (duration: number = 200): Object => {
	return {
		duration,
		create: {
	  type: LayoutAnimation.Types.linear,
	  property: LayoutAnimation.Properties.opacity,
		},
		update: {
	  type: LayoutAnimation.Types.linear,
		},
	};
};

const Screens = ['WizardOne', 'WizardTwo', 'WizardThree', 'WizardFour'];

const messages = defineMessages({
	changeLog36HeaderOne: {
		id: 'changeLog36.headerOne',
		defaultMessage: 'Explore new features',
	},
	changeLog36HeaderTwo: {
		id: 'changeLog36.headerTwo',
		defaultMessage: 'New in version 3.6',
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

	nextButton: string;
	skipButton: string;
	doneButton: string;

	onNavigationStateChange: () => void;

	onPressNext: () => void;
	onPressPrev: () => void;
	onPressSkip: () => void;

	animatedX: Object;
	animatedOpacity: Object;

	startAnimationX: (number) => void;
	startAnimationParallel: (number) => void;
	startAnimationOpacity: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			currentScreen: 'WizardOne',
		};

		let { formatMessage } = props.intl;

		this.h1 = formatMessage(messages.changeLog36HeaderOne);
		this.h2 = formatMessage(messages.changeLog36HeaderTwo);

		this.nextButton = formatMessage(i18n.next);
		this.skipButton = formatMessage(messages.skipButton).toUpperCase();
		this.doneButton = formatMessage(i18n.done);

		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);

		this.onPressNext = this.onPressNext.bind(this);
		this.onPressPrev = this.onPressPrev.bind(this);
		this.onPressSkip = this.onPressSkip.bind(this);

		this.startAnimationX = this.startAnimationX.bind(this);
		this.startAnimationOpacity = this.startAnimationOpacity.bind(this);
		this.startAnimationParallel = this.startAnimationParallel.bind(this);

		this.animatedX = new Animated.Value(0);
		this.animatedOpacity = new Animated.Value(1);
		UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
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
			let customLayoutAnimation = CustomLayoutAnimation(500);
			LayoutAnimation.configureNext(customLayoutAnimation);
		} else {
			this.setState({
				currentScreen: nextScreen,
			});
			let customLayoutAnimation = CustomLayoutAnimation();
			LayoutAnimation.configureNext(customLayoutAnimation);
			this.animatedX.setValue(-appLayout.width);
			this.animatedOpacity.setValue(0);
			this.startAnimationParallel(0);
		}
	}

	startAnimationParallel(value: number) {
		Animated.parallel([
			this.startAnimationX(value),
			this.startAnimationOpacity(),
		]).start();
	}

	startAnimationX(value: number) {
		Animated.timing(this.animatedX, {
			toValue: value,
			duration: 300,
		}).start();
	}

	startAnimationOpacity() {
		Animated.timing(this.animatedOpacity, {
			toValue: 1,
			duration: 300,
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
			let customLayoutAnimation = CustomLayoutAnimation();
			LayoutAnimation.configureNext(customLayoutAnimation);
			this.animatedX.setValue(appLayout.width);
			this.animatedOpacity.setValue(0);
			this.startAnimationParallel(0);
		}
	}

	onPressSkip() {
		let { dispatch, changeLogVersion } = this.props;
		let customLayoutAnimation = CustomLayoutAnimation(500);

		dispatch(setChangeLogVersion(changeLogVersion));
		LayoutAnimation.configureNext(customLayoutAnimation);
	}


	render(): Object {
		let { currentScreen } = this.state;
		let { appLayout, intl } = this.props;
		let { width } = appLayout;
		let { h1, h2 } = this;

		const isFirstScreen = Screens.indexOf(currentScreen) === 0;
		const isLastScreen = Screens.indexOf(currentScreen) === Screens.length - 1;

		let { stepIndicatorCover, floatingButtonLeft } = this.getStyles(appLayout);

		let inputRange = width ? [-width, 0] : [-100, 0];
		let outputRange = width ? [width, 0] : [-100, 0];

		let inputRangeOpacity = width ? [-width, -width / 2, 0] : [-100, -50, 0];

		const animatedX = this.animatedX.interpolate({
			inputRange,
			outputRange,
			extrapolateLeft: 'clamp',
			useNativeDriver: true,
		});

		const animatedOpacity = this.animatedOpacity.interpolate({
			inputRange: inputRangeOpacity,
			outputRange: [0, 0, 1],
			extrapolateLeft: 'clamp',
			useNativeDriver: true,
		});

		return (
			<View style={{flex: 1, backgroundColor: '#EFEFF4'}}>
				<NavigationHeader showLeftIcon={false}/>
				<ChangeLogPoster h1={h1} h2={h2}/>
				<ScrollView>
					<AnimatedWizard intl={intl} currentScreen={currentScreen} animatedX={animatedX} animatedOpacity={animatedOpacity}/>
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
						{Screens.map((screen: string, index: number): Object => {
							let backgroundColor = Screens[index] === currentScreen ?
								Theme.Core.brandSecondary : '#00000080';
							return <View style={[styles.stepIndicator, { backgroundColor }]} key={index}/>;
						})
						}
						<FloatingButton
							imageSource={isLastScreen ? false : require('../TabViews/img/right-arrow-key.png')}
							iconName={isLastScreen ? 'checkmark' : false}
							iconStyle={isLastScreen ? styles.checkIconStyle : {}}
							onPress={this.onPressNext}
							buttonStyle={{bottom: 0}}/>
					</View>
				</ScrollView>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
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
	checkIconStyle: {
		color: '#fff',
		fontSize: 26,
	},
});

function mapStateToProps(state: Object, ownProps: Object): Object {
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

