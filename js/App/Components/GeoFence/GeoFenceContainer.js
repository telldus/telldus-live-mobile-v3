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
 */

// @flow

'use strict';

import React from 'react';
import { BackHandler, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
const isEqual = require('react-fast-compare');
import Orientation from 'react-native-orientation-locker';

import {
	View,
	NavigationHeaderPoster,
	ThemedSwitch,
	Throbber,
	TouchableOpacity,
	BlockIcon,
} from '../../../BaseComponents';

import {
	toggleFeatureGeoFence,
	stopGeoFence,
	setupGeoFence,
	showToast,
} from '../../Actions';
import Theme from '../../Theme';

import i18n from '../../Translations/common';

type Props = {
	addDevice: Object,
	navigation: Object,
	children: Object,
	actions?: Object,
	screenProps: Object,
	ScreenName: string,
	route: Object,
	currentScreen: string,
	enableGeoFence: boolean,
};

type State = {
	h1: string,
	h2: string,
	infoButton: null | Object,
	loading: boolean,
	keyboardShown: boolean,
	forceLeftIconVisibilty: boolean,
	isGeoFenceLoadingStatus: boolean,
	isHelpVisible: boolean,
};

export class GeoFenceContainer extends View<Props, State> {

	handleBackPress: () => boolean;
	_keyboardDidShow: () => void;
	_keyboardDidHide: () => void;

	pointsToHiddenCave: number;
	openCaveTimeout: any;

	state = {
		h1: '',
		h2: '',
		infoButton: null,
		keyboardShown: false,
		forceLeftIconVisibilty: false,
		isGeoFenceLoadingStatus: false,
		isHelpVisible: false,
	};

	constructor(props: Props) {
		super(props);

		this.handleBackPress = this.handleBackPress.bind(this);
		this._keyboardDidShow = this._keyboardDidShow.bind(this);
		this._keyboardDidHide = this._keyboardDidHide.bind(this);

		this.pointsToHiddenCave = 0;
		this.openCaveTimeout = null;
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		if (nextProps.ScreenName === nextProps.currentScreen) {
			const isStateEqual = isEqual(this.state, nextState);
			if (!isStateEqual) {
				return true;
			}
			const isPropsEqual = isEqual(this.props, nextProps);
			if (!isPropsEqual) {
				return true;
			}
			return false;
		}
		return false;
	}

	_keyboardDidShow() {
		this.setState({
			keyboardShown: true,
		});
	}

	_keyboardDidHide() {
		this.setState({
			keyboardShown: false,
		});
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
		this.clearOpenCaveTimeout();
	}

	handleBackPress(): boolean {
		const { navigation, currentScreen } = this.props;
		const { forceLeftIconVisibilty } = this.state;

		const onLeftPress = this.getLeftIconPressAction(currentScreen);

		const allowBacknavigation = !this.disAllowBackNavigation() || forceLeftIconVisibilty;
		if (allowBacknavigation && onLeftPress) {
			onLeftPress();
			return true;
		}

		if (!allowBacknavigation) {
			return true;
		}

		navigation.pop();
		return true;
	}

	disAllowBackNavigation(): boolean {
		const {currentScreen} = this.props;
		const screens = [];
		return screens.indexOf(currentScreen) !== -1;
	}

	onChildDidMount = (h1: string, h2: string, infoButton?: Object | null = null) => {
		this.setState({
			h1,
			h2,
			infoButton,
		});
	};

	toggleLeftIconVisibilty = (forceLeftIconVisibilty: boolean) => {
		this.setState({
			forceLeftIconVisibilty,
		});
	}

	getLeftIcon = (CS: string): ?string => {
		const SCNS = ['AddEditGeoFence', 'EditGeoFenceAreaFull'];
		return SCNS.indexOf(CS) === -1 ? undefined : 'close';
	}

	getLeftIconPressAction = (CS: string): Function => {
		const EXSCNS = [];
		return EXSCNS.indexOf(CS) === -1 ? undefined : this.closeAdd433MHz;
	}

	closeAdd433MHz = () => {
	}

	shouldShowPoster = (CS: string): Function => {
		const EXSCNS = ['AddEditGeoFence'];
		return EXSCNS.indexOf(CS) === -1;
	}

	isEditMode = (): boolean => {
		const {
			route,
		} = this.props;
		const { isEditMode = false } = route.params || {};
		return isEditMode;
	}

	onValueChange = (enableGeoFence: boolean) => {
		const {
			actions,
			screenProps,
		} = this.props;
		const { formatMessage } = screenProps.intl;

		const messageOnFail = formatMessage(i18n.errortoast);
		if (!enableGeoFence) {
			actions.stopGeoFence().then((res: Object) => {
				if (!res.enabled) {
					actions.toggleFeatureGeoFence({
						enableGeoFence,
					});
					actions.showToast(formatMessage(i18n.gFTurnedOff));
				} else {
					actions.showToast(messageOnFail);
				}
			}).catch(() => {
				actions.showToast(messageOnFail);
			});
		} else {
			this.setState({
				isGeoFenceLoadingStatus: true,
			});
			actions.setupGeoFence(screenProps.intl).then((res: Object) => {
				if (res.enabled) {
					actions.toggleFeatureGeoFence({
						enableGeoFence,
					});
					actions.showToast(formatMessage(i18n.gFTurnedOn));
				} else {
					actions.showToast(messageOnFail);
				}
				this.setState({
					isGeoFenceLoadingStatus: false,
				});
			}).catch(() => {
				this.setState({
					isGeoFenceLoadingStatus: false,
				});
				actions.showToast(messageOnFail);
			});
		}
	}

	clearOpenCaveTimeout = () => {
		clearTimeout(this.openCaveTimeout);
		this.openCaveTimeout = null;
	}

	onPressLogo = () => {
		this.pointsToHiddenCave++;

		if (this.openCaveTimeout) {
			this.clearOpenCaveTimeout();
		}

		this.openCaveTimeout = setTimeout(() => {
			this.pointsToHiddenCave = 0;
		}, 500);

		if (this.pointsToHiddenCave >= 5) {
			this.pointsToHiddenCave = 0;
			this.props.navigation.navigate('AdvancedSettings');
		}
	}

	setIsHelpVisible = (isHelpVisible: boolean) => {
		if (isHelpVisible) {
			Orientation.lockToPortrait();
		} else {
			Orientation.unlockAllOrientations();
		}
		this.setState({
			isHelpVisible,
		});
	}

	showHelp = () => {
		this.setIsHelpVisible(true);
	}

	render(): Object {
		const {
			children,
			actions,
			screenProps,
			navigation,
			route,
			currentScreen,
			enableGeoFence,
		} = this.props;
		const { appLayout } = screenProps;
		const {
			h1,
			h2,
			infoButton,
			forceLeftIconVisibilty,
			isGeoFenceLoadingStatus,
			isHelpVisible,
		} = this.state;
		const { height, width } = appLayout;
		const isPortrait = height > width;

		const deviceWidth = isPortrait ? width : height;

		const padding = deviceWidth * Theme.Core.paddingFactor;

		const showLeftIcon = !this.disAllowBackNavigation() || forceLeftIconVisibilty;
		const leftIcon = this.getLeftIcon(currentScreen);
		const goBack = this.getLeftIconPressAction(currentScreen);
		const showPoster = this.shouldShowPoster(currentScreen);

		const {
			rightIconsCoverStyle,
			helpIconCoverStyle,
			helpIconStyle,
			backgroundMaskStyle,
		} = this.getStyles(appLayout);

		const throbber = <Throbber
			throbberContainerStyle={{
				position: 'relative',
			}}
			throbberStyle={{
				color: '#fff',
			}}/>;

		const help = (
			<TouchableOpacity
				onPress={this.showHelp}
				style={helpIconCoverStyle}>
				<BlockIcon
					backgroundMaskStyle={backgroundMaskStyle}
					iconLevel={15}
					backgroundMask
					icon={'help'}
					style={helpIconStyle}/>
			</TouchableOpacity>
		);

		const rightButton = {
			component:
			<View style={rightIconsCoverStyle}>
				{
					isGeoFenceLoadingStatus ?
						<>
							{help}
							{throbber}
						</>
						:
						<>
							{help}
							<ThemedSwitch
								onValueChange={this.onValueChange}
								backgroundActive={'#fff'}
								backgroundInactive={'#fff'}
								value={enableGeoFence}/>
						</>
				}
			</View>,
			onPress: () => {},
		};

		return (
			<View
				style={{
					flex: 1,
					backgroundColor: Theme.Core.appBackground,
				}}>
				<NavigationHeaderPoster
					h1={h1} h2={h2}
					infoButton={infoButton}
					align={'right'}
					navigation={navigation}
					showLeftIcon={showLeftIcon}
					leftIcon={leftIcon}
					goBack={goBack}
					showPoster={showPoster}
					extraData={{
						enableGeoFence,
						isGeoFenceLoadingStatus,
					}}
					{...screenProps}
					onPressLogo={this.onPressLogo}
					rightButton={currentScreen === 'AddEditGeoFence' ? rightButton : undefined}/>
				<KeyboardAvoidingView
					behavior="padding"
					style={{flex: 1}}
					contentContainerStyle={{
						flexGrow: 1,
						justifyContent: 'center',
					}}
					keyboardVerticalOffset={Platform.OS === 'android' ? -500 : 0}>
					{React.cloneElement(
						children,
						{
							onDidMount: this.onChildDidMount,
							actions,
							...screenProps,
							navigation,
							paddingHorizontal: padding,
							toggleLeftIconVisibilty: this.toggleLeftIconVisibilty,
							showLeftIcon,
							isEditMode: this.isEditMode,
							route,
							enableGeoFence,
							setIsHelpVisible: this.setIsHelpVisible,
							isHelpVisible,
						}
					)}
				</KeyboardAvoidingView>
			</View>
		);
	}

	getStyles = (appLayout: Object): Object => {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const fontSize = deviceWidth * 0.08;
		const maskSize = fontSize * 0.7;

		return {
			rightIconsCoverStyle: {
				flexDirection: 'row',
				alignItems: 'center',
			},
			helpIconCoverStyle: {
				marginRight: 10,
			},
			helpIconStyle: {
				fontSize,
			},
			backgroundMaskStyle: {
				position: 'absolute',
				backgroundColor: '#fff',
				height: maskSize,
				width: maskSize,
				borderRadius: maskSize / 2,
			},
		};
	}
}

export const mapStateToProps = (store: Object): Object => {

	const {
		screen: currentScreen,
	} = store.navigation;

	const {
		defaultSettings = {},
	} = store.app;

	return {
		currentScreen,
		toggleFeatureGeoFence,
		enableGeoFence: typeof defaultSettings.enableGeoFence === 'undefined' ? true : defaultSettings.enableGeoFence,
	};
};

export const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators({
				toggleFeatureGeoFence,
				stopGeoFence,
				setupGeoFence,
				showToast,
			}, dispatch),
		},
	}
);

export default connect(mapStateToProps, mapDispatchToProps)(GeoFenceContainer);
