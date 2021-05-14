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
} from '../../../../BaseComponents';
import Theme from '../../../Theme';

import * as modalActions from '../../../Actions/Modal';
import {
	getGateways,
	sendSocketMessage,
	setDeviceName,
	getDevices,
	getDeviceManufacturerInfo,
	showToast,
	processWebsocketMessage,
	addDevice as addDeviceAction,
	setWidgetParamId,
	initiateAdd433MHz,
	deviceAdded,
	registerForWebSocketEvents,
	getDeviceInfoCommon,
} from '../../../Actions';

type Props = {
	addDevice: Object,
	navigation: Object,
	children: Object,
	actions?: Object,
	screenProps: Object,
	currentScreen: string,
	ScreenName: string,
	locale: string,
	enableWebshop: boolean,
	processWebsocketMessage: (string, string, string, Object) => any,
	route: Object,
};

type State = {
	h1: string,
	h2: string,
	infoButton: null | Object,
	loading: boolean,
	keyboardShown: boolean,
	forceLeftIconVisibilty: boolean,
};

export class AddSensorContainer extends View<Props, State> {

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

		this.backButton = {
			back: true,
			onPress: this.goBack,
		};

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
		const { navigation } = this.props;
		const { forceLeftIconVisibilty } = this.state;

		const allowBacknavigation = !this.disAllowBackNavigation() || forceLeftIconVisibilty;
		if (!allowBacknavigation) {
			return true;
		}

		navigation.pop();
		return true;
	}

	disAllowBackNavigation(): boolean {
		const {currentScreen} = this.props;
		const screens = ['AlreadyIncluded', 'IncludeFailed', 'DeviceName', 'NoDeviceFound', 'ExcludeScreen', 'CantEnterInclusion'];
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
		if (CS === 'SelectSensorType') {
			const {
				route,
			} = this.props;
			if (route.params && route.params.singleGateway) {
				return 'close';
			}
		}
		const SCNS = ['SelectLocationAddSensor'];
		return SCNS.indexOf(CS) === -1 ? undefined : 'close';
	}

	render(): Object {
		const {
			children,
			actions,
			screenProps,
			currentScreen,
			navigation,
			addDevice,
			route,
			locale,
			sessionId,
		} = this.props;
		const { appLayout } = screenProps;
		const { h1, h2, infoButton, forceLeftIconVisibilty } = this.state;
		const { height, width } = appLayout;
		const isPortrait = height > width;

		const deviceWidth = isPortrait ? width : height;

		const padding = deviceWidth * Theme.Core.paddingFactor;

		const showLeftIcon = !this.disAllowBackNavigation() || forceLeftIconVisibilty;
		const leftIcon = this.getLeftIcon(currentScreen);

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
					{...screenProps}
					currentScreen={currentScreen}/>
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
							currentScreen,
							navigation,
							paddingHorizontal: padding,
							addDevice,
							processWebsocketMessage: this.props.processWebsocketMessage,
							route,
							locale,
							toggleLeftIconVisibilty: this.toggleLeftIconVisibilty,
							sessionId,
							showLeftIcon,
						},
					)}
				</KeyboardAvoidingView>
			</View>
		);
	}
}

export const mapStateToProps = (store: Object): Object => {
	const { defaultSettings } = store.app;
	const { language = {} } = defaultSettings || {};
	const locale = language.code;

	const { websockets: { session: { id: sessionId } }, user: { firebaseRemoteConfig = {} } } = store;

	const { webshop = JSON.stringify({enable: false}) } = firebaseRemoteConfig;
	const { enable: enableWebshop } = JSON.parse(webshop);

	const {
		screen: currentScreen,
	} = store.navigation;

	return {
		addDevice: store.addDevice,
		locale,
		sessionId,
		enableWebshop,
		currentScreen,
	};
};

export const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators({
				...modalActions,
				getGateways,
				sendSocketMessage,
				setDeviceName,
				getDevices,
				getDeviceManufacturerInfo,
				showToast,
				addDeviceAction,
				setWidgetParamId,
				initiateAdd433MHz,
				registerForWebSocketEvents,
				deviceAdded,
				getDeviceInfoCommon,
			}, dispatch),
		},
		processWebsocketMessage: (gatewayId: string, message: string, title: string, websocket: Object): any => processWebsocketMessage(gatewayId, message, title, dispatch, websocket),
	}
);

export default (connect(mapStateToProps, mapDispatchToProps)(AddSensorContainer): Object);
