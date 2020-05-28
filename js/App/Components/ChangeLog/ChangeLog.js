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
	Modal,
	BackHandler,
	Platform,
} from 'react-native';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import DeviceInfo from 'react-native-device-info';


import { View, FloatingButton, Text, StyleSheet, SafeAreaView, NavigationHeader } from '../../../BaseComponents';

import ChangeLogPoster from './SubViews/ChangeLogPoster';
import Wizard from './SubViews/Wizard';

import Screens from './SubViews/Screens';
import Theme from '../../Theme';
import i18n from '../../Translations/common';

import { setChangeLogVersion, hideChangeLog } from '../../Actions';

type Props = {
	appLayout: Object,
	screenReaderEnabled: boolean,
	intl: intlShape,
	changeLogVersion?: string,
	dispatch: Function,
	changeLogVersion: string,
	showChangeLog: boolean,
	forceShowChangeLog: boolean,
	onLayout: (Object) => void,
};

type State = {
	currentScreen: number,
};

class ChangeLogNavigator extends View {
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

	onRequestClose: () => void;

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
		this.h1 = formatMessage(i18n.changeLogHeaderOne);
		this.h2 = `${formatMessage(i18n.changeLogHeaderTwo)} ${appVersion.substring(0, 4)}`;

		this.skipButton = formatMessage(i18n.skipButton).toUpperCase();

		this.onPressNext = this.onPressNext.bind(this);
		this.onPressPrev = this.onPressPrev.bind(this);
		this.onPressSkip = this.onPressSkip.bind(this);

		this.startAnimationX = this.startAnimationX.bind(this);
		this.startAnimationOpacity = this.startAnimationOpacity.bind(this);
		this.startAnimationParallel = this.startAnimationParallel.bind(this);

		this.onRequestClose = this.onRequestClose.bind(this);

		this.animatedX = new Animated.Value(0);
		this.animatedOpacity = new Animated.Value(1);

		this.defaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
		this.labelButton = `${formatMessage(i18n.button)}`;
		this.nextLabel = `${formatMessage(i18n.next)} ${this.labelButton}. ${this.defaultDescription}`;
		this.prevLabel = `${formatMessage(i18n.previous)} ${this.labelButton}. ${this.defaultDescription}`;
	}

	onRequestClose() {
		let { dispatch, forceShowChangeLog, showChangeLog } = this.props;
		if (forceShowChangeLog) {
			let { end } = this.onPressPrev();
			if (end) {
				dispatch(hideChangeLog());
				this.setState({
					currentScreen: Screens[0],
				});
			}
		} else if (showChangeLog) {
			let { end } = this.onPressPrev();
			if (end) {
				BackHandler.exitApp();
				this.setState({
					currentScreen: Screens[0],
				});
			}
		}
	}

	onPressNext() {
		let { dispatch, changeLogVersion, appLayout, forceShowChangeLog } = this.props;
		let { currentScreen } = this.state;
		let nextIndex = Screens.indexOf(currentScreen) + 1;
		let nextScreen = Screens[nextIndex];

		let isFinalScreen = Screens.indexOf(currentScreen) === (Screens.length - 1);
		if (isFinalScreen) {
			if (forceShowChangeLog) {
				dispatch(hideChangeLog());
			} else {
				dispatch(setChangeLogVersion(changeLogVersion));
			}
			this.setState({
				currentScreen: Screens[0],
			});
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
		let { dispatch, changeLogVersion, forceShowChangeLog } = this.props;
		if (forceShowChangeLog) {
			dispatch(hideChangeLog());
		} else {
			dispatch(setChangeLogVersion(changeLogVersion));
		}
		this.setState({
			currentScreen: Screens[0],
		});
	}

	render(): Object | null {
		const { currentScreen } = this.state;
		const { appLayout, intl, showChangeLog, onLayout } = this.props;
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
			<Modal
				visible={showChangeLog}
				transparent={false}
				animationType={'slide'}
				presentationStyle={'fullScreen'}
				onRequestClose={this.isIos ? this.noOP : this.onRequestClose}
				supportedOrientations={['portrait', 'landscape']}>
				<SafeAreaView onLayout={onLayout}>
					<NavigationHeader showLeftIcon={false} topMargin={this.isIos} forceHideStatus={!this.isIos}/>
					<ChangeLogPoster h1={h1} h2={h2} appLayout={appLayout}/>
					<ScrollView>
						<Wizard
							intl={intl}
							currentScreen={currentScreen}
							animatedX={animatedX}
							animatedOpacity={animatedOpacity}
							appLayout={appLayout}/>
						<View style={styles.buttonCover}>
							<Text style={textSkip} onPress={this.onPressSkip}>
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
								accessibilityLabel={this.prevLabel}/>
							)}
							{Screens.length > 1 && Screens.map((screen: number, index: number): Object => {
								let backgroundColor = Screens[index] === currentScreen ?
									Theme.Core.brandSecondary : '#00000080';
								return <View style={[stepIndicator, {
									backgroundColor,
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
								accessibilityLabel={this.nextLabel}/>
						</View>
					</ScrollView>
				</SafeAreaView>
			</Modal>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const stepIndicatorSize = Math.floor(deviceWidth * 0.033);
		const maxIconSize = 40;

		const {
			brandSecondary,
			maxSizeFloatingButton,
			shadow: themeShadow,
			paddingFactor,
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
				backgroundColor: brandSecondary,
				...shadow,
			},
			checkIconStyle: {
				color: '#fff',
				fontSize: iconSize,
			},
			textSkip: {
				paddingVertical: 10,
				color: brandSecondary,
				textAlign: 'center',
				fontSize: Math.floor(deviceWidth * 0.039),
			},
			stepIndicatorSize,
		};
	}

	noOP() {
	}
}

const styles = StyleSheet.create({
	buttonCover: {
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
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

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ChangeLogNavigator));

