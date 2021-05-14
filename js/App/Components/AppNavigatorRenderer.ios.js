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
import { LayoutAnimation } from 'react-native';
import { connect } from 'react-redux';
import { intlShape } from 'react-intl';
const isEqual = require('react-fast-compare');
import appleAuth from '@invertase/react-native-apple-authentication';

import {
	View,
} from '../../BaseComponents';
import AppNavigator from './AppNavigator';

import {
	logoutAfterUnregister,
} from '../Actions';
import {
	LayoutAnimations,
	shouldUpdate,
} from '../Lib';

type Props = {
	appLayout: Object,
	screenReaderEnabled: boolean,
	addingNewLocation: boolean,
	currentScreen: string,
	hasGateways: boolean,
	hiddenTabsCurrentUser: Array<string>,
	defaultStartScreenKey: string,

	intl: intlShape.isRequired,
	dispatch: Function,
	addNewLocation: () => Promise<any>,
	addNewDevice: () => void,
	toggleDialogueBox: (Object) => void,
	navigateToCampaign: () => void,
	addNewSensor: () => void,
};

type State = {
	showAttentionCaptureAddDevice: boolean,
	addNewDevicePressed: boolean,
};

class AppNavigatorRenderer extends View<Props, State> {

	props: Props;
	state: State;

	onCloseSetting: () => void;
	toggleAttentionCapture: (boolean) => void;

	addNewDevice: () => void;
	addNewSensor: () => void;

	clearAppleCredentialRevokedListener: any;

	constructor(props: Props) {
		super(props);

		this.state = {
			showAttentionCaptureAddDevice: false,
			addNewDevicePressed: false,
		};

		this.clearAppleCredentialRevokedListener = null;
	}

	componentDidMount() {
		if (appleAuth.isSupported) {
			this.clearAppleCredentialRevokedListener = appleAuth.onCredentialRevoked(() => {
				this.props.dispatch(logoutAfterUnregister());
			});
		}
	}

	componentWillUnmount() {
		if (this.clearAppleCredentialRevokedListener) {
			this.clearAppleCredentialRevokedListener();
			this.clearAppleCredentialRevokedListener = null;
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const isStateEqual = isEqual(this.state, nextState);
		if (!isStateEqual) {
			return true;
		}

		return shouldUpdate(this.props, nextProps, [
			'appLayout',
			'currentScreen',
			'screenReaderEnabled',
			'hasGateways',
			'addingNewLocation',
			'hiddenTabsCurrentUser',
			'defaultStartScreenKey',
		]);
	}

	addNewDevice = () => {
		this.setState({
			addNewDevicePressed: true,
		}, () => {
			this.props.addNewDevice();
		});
	}

	addNewSensor = () => {
		this.setState({
			addNewSensorPressed: true,
		}, () => {
			this.props.addNewSensor();
		});
	}

	toggleAttentionCapture = (value: boolean) => {
		if (!this.state.addNewDevicePressed) {
			LayoutAnimation.configureNext(LayoutAnimations.linearU(500));
		}
		this.setState({
			showAttentionCaptureAddDevice: value,
		});
	}

	showAttentionCapture(): boolean {
		const { showAttentionCaptureAddDevice, addNewDevicePressed } = this.state;
		const { currentScreen, hasGateways } = this.props;

		return hasGateways && (currentScreen === 'Devices') && showAttentionCaptureAddDevice && !addNewDevicePressed;
	}

	render(): Object {
		const { showAttentionCaptureAddDevice } = this.state;
		const {
			intl,
			appLayout,
			screenReaderEnabled,
			toggleDialogueBox,
			addingNewLocation,
			addNewLocation,
			hiddenTabsCurrentUser,
			defaultStartScreenKey,
		} = this.props;

		const showAttentionCapture = this.showAttentionCapture();
		let screenProps = {
			intl,
			appLayout,
			screenReaderEnabled,
			toggleDialogueBox,
			hideHeader: false,
			toggleAttentionCapture: this.toggleAttentionCapture,
			showAttentionCapture,
			showAttentionCaptureAddDevice,
			source: 'postlogin',
			addingNewLocation,
			addNewSensor: this.addNewSensor,
			addNewDevice: this.addNewDevice,
			addNewLocation,
			hiddenTabsCurrentUser,
			defaultStartScreenKey,
		};

		return (
			<AppNavigator
				screenProps={screenProps}/>
		);
	}
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	const {
		layout,
		screenReaderEnabled,
	} = state.app;

	const {
		userId = '',
	} = state.user;

	const {
		hiddenTabs = {},
		defaultStartScreen = {},
	} = state.navigation;

	const hiddenTabsCurrentUser = hiddenTabs[userId] || [];

	const defaultStartScreenCurrentUser = defaultStartScreen[userId] || {};

	return {
		screenReaderEnabled,
		appLayout: layout,
		currentScreen: state.navigation.screen,
		hiddenTabsCurrentUser,
		defaultStartScreenKey: defaultStartScreenCurrentUser.screenKey,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

module.exports = (connect(mapStateToProps, mapDispatchToProps)(AppNavigatorRenderer): Object);
