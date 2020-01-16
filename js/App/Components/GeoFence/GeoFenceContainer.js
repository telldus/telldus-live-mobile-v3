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
} from '../../../BaseComponents';
import Theme from '../../Theme';

type Props = {
	addDevice: Object,
	navigation: Object,
	children: Object,
	actions?: Object,
	screenProps: Object,
	ScreenName: string,
};

type State = {
	h1: string,
	h2: string,
	infoButton: null | Object,
	loading: boolean,
	keyboardShown: boolean,
	forceLeftIconVisibilty: boolean,
};

export class GeoFenceContainer extends View<Props, State> {

	handleBackPress: () => boolean;
	_keyboardDidShow: () => void;
	_keyboardDidHide: () => void;

	state = {
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
		if (nextProps.ScreenName === nextProps.screenProps.currentScreen) {
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
		const { navigation, screenProps } = this.props;
		const { forceLeftIconVisibilty } = this.state;

		const { currentScreen } = screenProps;
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
		const {screenProps} = this.props;
		const { currentScreen } = screenProps;
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
		const SCNS = [];
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

	render(): Object {
		const {
			children,
			actions,
			screenProps,
			navigation,
		} = this.props;
		const { appLayout, currentScreen } = screenProps;
		const { h1, h2, infoButton, forceLeftIconVisibilty } = this.state;
		const { height, width } = appLayout;
		const isPortrait = height > width;

		const deviceWidth = isPortrait ? width : height;

		const padding = deviceWidth * Theme.Core.paddingFactor;

		const showLeftIcon = !this.disAllowBackNavigation() || forceLeftIconVisibilty;
		const leftIcon = this.getLeftIcon(currentScreen);
		const goBack = this.getLeftIconPressAction(currentScreen);
		const showPoster = this.shouldShowPoster(currentScreen);

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
							toggleLeftIconVisibilty: this.toggleLeftIconVisibilty,
							showLeftIcon,
						},
					)}
				</KeyboardAvoidingView>
			</View>
		);
	}
}

export const mapStateToProps = (store: Object): Object => {

	return {
	};
};

export const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators({
			}, dispatch),
		},
	}
);

export default connect(mapStateToProps, mapDispatchToProps)(GeoFenceContainer);
