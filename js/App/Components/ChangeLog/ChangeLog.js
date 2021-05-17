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
import {
	Animated,
	ScrollView,
	BackHandler,
	Platform,
} from 'react-native';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import DeviceInfo from 'react-native-device-info';


import {
	View,
	FloatingButton,
	Text,
	StyleSheet,
	NavigationHeaderPoster,
} from '../../../BaseComponents';

import Wizard from './SubViews/Wizard';

import Screens from './SubViews/Screens';
import Theme from '../../Theme';
import i18n from '../../Translations/common';

import capitalize from '../../Lib/capitalize';

import { setChangeLogVersion } from '../../Actions';

type Props = {
	appLayout: Object,
	screenReaderEnabled: boolean,
	intl: Object,
	dispatch: Function,
	route: Object,
	navigation: Object,
};

type State = {
	currentScreen: number,
};

class ChangeLogScreen extends View {
	props: Props;
	state: State;

	h1: string;
	h2: string;

	skipButton: string;

	onPressNext: () => void;
	onPressPrev: () => Object;
	onPressSkip: () => void;

	animatedX: Object;
	animatedOpacity: Object;

	startAnimationX: (number) => Object;
	startAnimationParallel: (number) => void;
	startAnimationOpacity: () => Object;

	onRequestClose: () => boolean;

	defaultDescription: string;
	labelButton: string;
	nextLabel: string;
	prevLabel: string;

	isIos: boolean;

	constructor(props: Props) {
		super(props);

		this.state = {
			currentScreen: 1,
		};

		let { formatMessage } = props.intl;

		this.isIos = Platform.OS === 'ios';

		const appVersion = DeviceInfo.getReadableVersion();
		this.h1 = capitalize(formatMessage(i18n.changeLogHeaderOne));
		this.h2 = `${formatMessage(i18n.changeLogHeaderTwo)} ${appVersion.substring(0, 4)}`;

		this.skipButton = capitalize(formatMessage(i18n.skipButton));

		this.onPressNext = this.onPressNext.bind(this);
		this.onPressPrev = this.onPressPrev.bind(this);
		this.onPressSkip = this.onPressSkip.bind(this);

		this.startAnimationX = this.startAnimationX.bind(this);
		this.startAnimationOpacity = this.startAnimationOpacity.bind(this);
		this.startAnimationParallel = this.startAnimationParallel.bind(this);

		this.animatedX = new Animated.Value(0);
		this.animatedOpacity = new Animated.Value(1);

		this.defaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
		this.labelButton = `${formatMessage(i18n.button)}`;
		this.nextLabel = `${formatMessage(i18n.next)} ${this.labelButton}. ${this.defaultDescription}`;
		this.prevLabel = `${formatMessage(i18n.previous)} ${this.labelButton}. ${this.defaultDescription}`;
	}

	onRequestClose = (): boolean => {
		let { route = {}, navigation } = this.props;
		const { forceShowChangeLog = false } = route.params || {};
		if (forceShowChangeLog) {
			let { end } = this.onPressPrev();
			if (end) {
				this.setState({
					currentScreen: Screens[0],
				});
				navigation.goBack();
			}
		} else {
			let { end } = this.onPressPrev();
			if (end) {
				BackHandler.exitApp();
				this.setState({
					currentScreen: Screens[0],
				});
			}
		}
		this.animatedX.setValue(0);
		this.animatedOpacity.setValue(1);
		return true;
	}

	onPressNext() {
		let {
			dispatch,
			appLayout,
			route = {},
			navigation,
		} = this.props;
		const {
			forceShowChangeLog = false,
			changeLogVersion,
		} = route.params || {};
		let { currentScreen } = this.state;
		let nextIndex = Screens.indexOf(currentScreen) + 1;
		let nextScreen = Screens[nextIndex];

		let isFinalScreen = Screens.indexOf(currentScreen) === (Screens.length - 1);
		if (isFinalScreen) {
			if (!forceShowChangeLog) {
				dispatch(setChangeLogVersion(changeLogVersion));
			}
			this.setState({
				currentScreen: Screens[0],
			});
			this.animatedX.setValue(0);
			this.animatedOpacity.setValue(1);
			navigation.goBack();
		} else {
			this.setState({
				currentScreen: nextScreen,
			});
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

	startAnimationX(value: number): Object {
		return Animated.timing(this.animatedX, {
			toValue: value,
			duration: 300,
			useNativeDriver: true,
		}).start();
	}

	startAnimationOpacity(): Object {
		return Animated.timing(this.animatedOpacity, {
			toValue: 1,
			duration: 300,
			useNativeDriver: true,
		}).start();
	}

	onPressPrev(): Object {
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
			this.animatedOpacity.setValue(0);
			this.startAnimationParallel(0);
			return { end: false };
		}
		return { end: true };
	}

	onPressSkip() {
		let {
			dispatch,
			route = {},
			navigation,
		} = this.props;
		const {
			forceShowChangeLog = false,
			changeLogVersion,
		} = route.params || {};
		if (!forceShowChangeLog) {
			dispatch(setChangeLogVersion(changeLogVersion));
		}
		this.setState({
			currentScreen: Screens[0],
		});
		this.animatedX.setValue(0);
		this.animatedOpacity.setValue(1);
		navigation.goBack();
	}

	render(): Object | null {
		const { currentScreen } = this.state;
		const {
			appLayout,
			intl,
			navigation,
		} = this.props;
		const { width } = appLayout;
		const { h1, h2 } = this;

		if (!width) {
			return null;
		}

		const isFirstScreen = Screens.indexOf(currentScreen) === 0;
		const isLastScreen = Screens.indexOf(currentScreen) === Screens.length - 1;

		const {
			stepIndicatorCover,
			floatingButtonLeft,
			checkIconStyle,
			textSkip,
			stepIndicator,
			stepIndicatorSize,
			innerContainer,
			floatingButtonRight,
			floatingCommon,
		} = this.getStyles(appLayout);

		const inputRange = width ? [-width, 0] : [-100, 0];
		const outputRange = width ? [width, 0] : [-100, 0];

		const inputRangeOpacity = width ? [-width, -width / 2, 0] : [-100, -50, 0];

		const animatedX = this.animatedX.interpolate({
			inputRange,
			outputRange,
			extrapolateLeft: 'clamp',
		});

		const animatedOpacity = this.animatedOpacity.interpolate({
			inputRange: inputRangeOpacity,
			outputRange: [0, 0, 1],
			extrapolateLeft: 'clamp',
		});

		return (
			<View
				level={3}>
				<NavigationHeaderPoster
					 h1={h1} h2={h2}
					align={'left'}
					showLeftIcon={false}
					leftIcon={'close'}
					navigation={navigation}
					appLayout={appLayout}
					topMargin={this.isIos}
					handleBackPress={this.onRequestClose}/>
				<ScrollView>
					<Wizard
						intl={intl}
						currentScreen={currentScreen}
						animatedX={animatedX}
						animatedOpacity={animatedOpacity}
						appLayout={appLayout}/>
					<View style={styles.buttonCover}>
						<Text
							level={36}
							style={textSkip}
							onPress={this.onPressSkip}>
							{this.skipButton}
						</Text>
					</View>
					<View style={stepIndicatorCover}>
						{!isFirstScreen && (<FloatingButton
							imageSource={{uri: 'right_arrow_key'}}
							onPress={this.onPressPrev}
							buttonStyle={[floatingButtonLeft, floatingCommon]}
							iconStyle={styles.buttonIconStyle}
							innerContainer={innerContainer}
							accessibilityLabel={this.prevLabel}
							buttonInnerViewLevel={23}/>
						)}
						{Screens.length > 1 && Screens.map((screen: number, index: number): Object => {
							let level = Screens[index] === currentScreen ?
								13 : 14;
							return <View
								level={level}
								style={[stepIndicator, {
									marginLeft: !index ? 0 : stepIndicatorSize * 0.7,
								}]} key={index}/>;
						})
						}
						<FloatingButton
							imageSource={isLastScreen ? false : {uri: 'right_arrow_key'}}
							iconName={isLastScreen ? 'checkmark' : false}
							iconStyle={isLastScreen ? checkIconStyle : {}}
							onPress={this.onPressNext}
							buttonStyle={[floatingCommon, floatingButtonRight]}
							innerContainer={innerContainer}
							accessibilityLabel={this.nextLabel}
							buttonInnerViewLevel={23}/>
					</View>
				</ScrollView>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const stepIndicatorSize = Math.floor(deviceWidth * 0.033);
		const maxIconSize = 40;

		const {
			maxSizeFloatingButton,
			shadow: themeShadow,
			paddingFactor,
			fontSizeFactorThree,
		} = Theme.Core;

		let iconSize = Math.floor(deviceWidth * 0.07);
		iconSize = iconSize > maxIconSize ? maxIconSize : iconSize;

		let buttonSize = deviceWidth * 0.134666667;
		buttonSize = buttonSize > maxSizeFloatingButton ? maxSizeFloatingButton : buttonSize;

		const adjust = buttonSize * 0.2;
		const buttonSizeOuter = buttonSize + adjust;

		const shadow = Object.assign({}, themeShadow, {
			shadowOpacity: 0.35,
			shadowOffset: {
				...themeShadow.shadowOffset,
				height: 2,
			},
			elevation: 5,
		});

		const padding = deviceWidth * paddingFactor;
		const adjustFloatPad = adjust < padding ? adjust : padding;
		const padFloat = padding - (adjustFloatPad / 2);

		return {
			stepIndicatorCover: {
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
				marginBottom: 10,
				height: buttonSize,
				flex: 1,
			},
			stepIndicator: {
				height: stepIndicatorSize,
				width: stepIndicatorSize,
				borderRadius: stepIndicatorSize / 2,
			},
			floatingButtonLeft: {
				left: padFloat,
			},
			floatingCommon: {
				height: buttonSizeOuter,
				width: buttonSizeOuter,
				borderRadius: buttonSizeOuter / 2,
				bottom: 0,
				backgroundColor: 'transparent',
				alignItems: 'center',
				justifyContent: 'center',
				elevation: 0,
				shadowColor: 'transparent',
				shadowRadius: 0,
				shadowOpacity: 0,
				shadowOffset: {
					width: 0,
					height: 0,
				},
			},
			floatingButtonRight: {
				right: padFloat,
			},
			innerContainer: {
				flex: 0,
				height: buttonSize,
				width: buttonSize,
				borderRadius: buttonSize / 2,
				...shadow,
			},
			checkIconStyle: {
				color: '#fff',
				fontSize: iconSize,
			},
			textSkip: {
				paddingVertical: 10,
				textAlign: 'center',
				fontSize: Math.floor(deviceWidth * fontSizeFactorThree),
			},
			stepIndicatorSize,
		};
	}
}

const styles = StyleSheet.create({
	buttonCover: {
		alignItems: 'center',
		justifyContent: 'center',
		flex: 0,
	},
	buttonIconStyle: {
		transform: [{rotateZ: '180deg'}],
	},
});

function mapStateToProps(state: Object, ownProps: Object): Object {
	return {
		appLayout: state.app.layout,
		screenReaderEnabled: state.app.screenReaderEnabled,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

export default (connect(mapStateToProps, mapDispatchToProps)(injectIntl(ChangeLogScreen)): Object);

