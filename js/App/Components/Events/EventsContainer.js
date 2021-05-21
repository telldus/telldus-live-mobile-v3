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

import {
	View,
	NavigationHeaderPoster,
	ThemedImage,
} from '../../../BaseComponents';

import {
	showToast,
	eventReset,
} from '../../Actions';
import Theme from '../../Theme';
import {
	withTheme,
	PropsThemedComponent,
} from '../HOC/withTheme';

type Props = PropsThemedComponent & {
	navigation: Object,
	children: Object,
	actions?: Object,
	screenProps: Object,
	ScreenName: string,
	route: Object,
	currentScreen: string,
};

type State = {
	h1: string,
	h2: string,
	infoButton: null | Object,
	keyboardShown: boolean,
	forceLeftIconVisibilty: boolean,
};

export class EventsContainer extends View<Props, State> {

	handleBackPress: () => boolean;
	_keyboardDidShow: () => void;
	_keyboardDidHide: () => void;

	state: State = {
		h1: '',
		h2: '',
		infoButton: null,
		keyboardShown: false,
		forceLeftIconVisibilty: false,
	};

	constructor(props: Props) {
		super(props);

		this.handleBackPress = this.handleBackPress.bind(this);
		this._keyboardDidShow = this._keyboardDidShow.bind(this);
		this._keyboardDidHide = this._keyboardDidHide.bind(this);
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

	onChildDidMount: Function = (h1: string, h2: string, infoButton?: Object | null = null) => {
		this.setState({
			h1,
			h2,
			infoButton,
		});
	};

	getLeftIcon: Function = (CS: string): ?string => {
		const SCNS = ['EventsList'];
		return SCNS.indexOf(CS) === -1 ? undefined : 'close';
	};

	getLeftIconPressAction: Function = (CS: string): Function => {
		const EXSCNS = [];
		return EXSCNS.indexOf(CS) === -1 ? undefined : this.closeAdd433MHz;
	};

	closeAdd433MHz: Function = () => {
	};

	shouldShowPoster: Function = (CS: string): Function => {
		const EXSCNS = [];
		return EXSCNS.indexOf(CS) === -1;
	};

	isEditMode: Function = (): boolean => {
		const {
			route,
		} = this.props;
		const { isEditMode = false } = route.params || {};
		return isEditMode;
	};

	onAddNewEvent: Function = () => {
		const {
			navigation,
			actions,
		} = this.props;
		actions.eventReset();
		navigation.navigate('SelectGroupEvent', {
			isEditMode: false,
		});
	};

	render(): Object {
		const {
			children,
			actions,
			screenProps,
			navigation,
			route,
			currentScreen,
		} = this.props;
		const { appLayout } = screenProps;
		const {
			h1,
			h2,
			infoButton,
			forceLeftIconVisibilty,
		} = this.state;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const {
			addIconStyle,
		} = this.getStyles(appLayout);

		const deviceWidth = isPortrait ? width : height;

		const padding = deviceWidth * Theme.Core.paddingFactor;

		const showLeftIcon = !this.disAllowBackNavigation() || forceLeftIconVisibilty;
		const leftIcon = this.getLeftIcon(currentScreen);
		const goBack = this.getLeftIconPressAction(currentScreen);
		const showPoster = this.shouldShowPoster(currentScreen);
		const rightIcon = {
			component: <ThemedImage
				source={{uri: 'icon_plus'}}
				style={addIconStyle}
				level={4}
			/>,
			onPress: this.onAddNewEvent,
		};

		return (
			<View
				level={3}
				style={{
					flex: 1,
				}}>
				<NavigationHeaderPoster
					h1={h1} h2={h2}
					infoButton={infoButton}
					align={'left'}
					navigation={navigation}
					showLeftIcon={showLeftIcon}
					leftIcon={leftIcon}
					rightButton={currentScreen === 'EventsList' ? rightIcon : undefined}
					goBack={goBack}
					showPoster={showPoster}
					{...screenProps}/>
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
							showLeftIcon,
							isEditMode: this.isEditMode,
							route,
						}
					)}
				</KeyboardAvoidingView>
			</View>
		);
	}

	getStyles: Function = (appLayout: Object): Object => {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceHeight = isPortrait ? height : width;
		const {
			fontSizeFactorSix,
		} = Theme.Core;

		const size = Math.floor(deviceHeight * fontSizeFactorSix);
		const fontSizeIcon = size < 20 ? 20 : size;

		return {
			addIconStyle: {
				height: fontSizeIcon,
				width: fontSizeIcon,
			},
		};
	};
}

export const mapStateToProps = (store: Object): Object => {

	const {
		screen: currentScreen,
	} = store.navigation;

	return {
		currentScreen,
	};
};

export const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators({
				showToast,
				eventReset,
			}, dispatch),
		},
	}
);

export default (connect(mapStateToProps, mapDispatchToProps)(withTheme(EventsContainer)): Object);
