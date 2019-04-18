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
import { Animated, ScrollView, Modal } from 'react-native';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import DeviceInfo from 'react-native-device-info';
import { ifIphoneX } from 'react-native-iphone-x-helper';

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

	nextButton: string;
	skipButton: string;
	doneButton: string;

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
			currentScreen: 1,
		};

		let { formatMessage } = props.intl;

		const appVersion = DeviceInfo.getReadableVersion();
		this.h1 = formatMessage(i18n.changeLogHeaderOne);
		this.h2 = `${formatMessage(i18n.changeLogHeaderTwo)} ${appVersion.substring(0, 4)}`;

		this.nextButton = formatMessage(i18n.next);
		this.skipButton = formatMessage(i18n.skipButton).toUpperCase();
		this.doneButton = formatMessage(i18n.done);

		this.onPressNext = this.onPressNext.bind(this);
		this.onPressPrev = this.onPressPrev.bind(this);
		this.onPressSkip = this.onPressSkip.bind(this);

		this.startAnimationX = this.startAnimationX.bind(this);
		this.startAnimationOpacity = this.startAnimationOpacity.bind(this);
		this.startAnimationParallel = this.startAnimationParallel.bind(this);

		this.animatedX = new Animated.Value(0);
		this.animatedOpacity = new Animated.Value(1);
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
			this.animatedX.setValue(appLayout.width);
			this.animatedOpacity.setValue(0);
			this.startAnimationParallel(0);
		}
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
		let { currentScreen } = this.state;
		let { appLayout, intl, showChangeLog, onLayout } = this.props;
		let { width } = appLayout;
		let { h1, h2 } = this;

		if (!width) {
			return null;
		}

		const isFirstScreen = Screens.indexOf(currentScreen) === 0;
		const isLastScreen = Screens.indexOf(currentScreen) === Screens.length - 1;

		let { stepIndicatorCover, floatingButtonLeft, checkIconStyle, textSkip, stepIndicator, stepIndicatorSize } = this.getStyles(appLayout);

		let inputRange = width ? [-width, 0] : [-100, 0];
		let outputRange = width ? [width, 0] : [-100, 0];

		let inputRangeOpacity = width ? [-width, -width / 2, 0] : [-100, -50, 0];

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
				onRequestClose={this.noOP}
				supportedOrientations={['portrait', 'landscape']}>
				<SafeAreaView onLayout={onLayout} backgroundColor={Theme.Core.appBackground}>
					<NavigationHeader showLeftIcon={false}/>
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
								buttonStyle={floatingButtonLeft}
								iconStyle={styles.buttonIconStyle}/>
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
								buttonStyle={{bottom: 0}}/>
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
		const buttonSize = deviceWidth * 0.134666667;
		const stepIndicatorSize = Math.floor(deviceWidth * 0.033);
		const maxIconSize = 40;

		let iconSize = Math.floor(deviceWidth * 0.07);
		iconSize = iconSize > maxIconSize ? maxIconSize : iconSize;

		return {
			stepIndicatorCover: {
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
				marginBottom: 10,
				height: buttonSize,
				...ifIphoneX({ flex: 1, backgroundColor: Theme.Core.iPhoneXbg }, { flex: 1 }),
			},
			stepIndicator: {
				height: stepIndicatorSize,
				width: stepIndicatorSize,
				borderRadius: stepIndicatorSize / 2,
			},
			floatingButtonLeft: {
				left: deviceWidth * 0.034666667,
				bottom: 0,
			},
			checkIconStyle: {
				color: '#fff',
				fontSize: iconSize,
			},
			textSkip: {
				paddingVertical: 10,
				color: Theme.Core.brandSecondary,
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
		...ifIphoneX({ flex: 1, backgroundColor: Theme.Core.iPhoneXbg }, { flex: 1 }),
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

