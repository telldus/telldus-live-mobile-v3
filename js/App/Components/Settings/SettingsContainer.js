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
import { BackHandler, ScrollView, Platform, KeyboardAvoidingView, LayoutAnimation } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
const isEqual = require('react-fast-compare');
import DeviceInfo from 'react-native-device-info';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

import {
	View,
	NavigationHeaderPoster,
} from '../../../BaseComponents';

import {
	deletePushToken,
	registerPushToken,
	getPhonesList,
} from '../../Actions/User';
import { showToast } from '../../Actions';
import { LayoutAnimations, shouldUpdate } from '../../Lib';

import { pushServiceId } from '../../../Config';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

type Props = {
	screenProps: Object,
	ScreenName: string,
	phonesList: Object,
	pushToken: string,
	deviceName: string,
	deviceId: string,
	openModal: boolean,
	currentScreen: string,

	actions?: Object,
	navigation: Object,
	children: Object,
	onSubmitPushToken: (string, ?string, string) => Promise<any>,
	onSubmitDeviceName: (string, string, string) => Promise<any>,
};

type State = {
	h1: string,
	h2: string,
	infoButton: null | Object,
	isPushSubmitLoading: boolean,
};

class SettingsContainer extends View<Props, State> {

state: State = {
	h1: '',
	h2: '',
	infoButton: null,
	isPushSubmitLoading: false,
};

handleBackPress: () => boolean;
onChildDidMount: (string, string, ?string) => void;
submitPushToken: () => void;
onSubmitDeviceName: (string, string) => Promise<any>;
constructor(props: Props) {
	super(props);

	this.handleBackPress = this.handleBackPress.bind(this);
	this.onChildDidMount = this.onChildDidMount.bind(this);
	this.submitPushToken = this.submitPushToken.bind(this);
	this.onSubmitDeviceName = this.onSubmitDeviceName.bind(this);
}

componentDidMount() {
	BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
}

componentWillUnmount() {
	BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
}

handleBackPress(): boolean {
	let { navigation } = this.props;
	navigation.pop();
	return true;
}

shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
	if (nextProps.ScreenName === nextProps.currentScreen) {
		const isStateEqual = isEqual(this.state, nextState);
		if (!isStateEqual) {
			return true;
		}

		const { screenProps, ...others } = this.props;
		const { screenProps: screenPropsN, ...otherN } = nextProps;
		const { appLayout } = screenProps;
		const { appLayout: appLayoutN } = screenPropsN;
		if (appLayout.width !== appLayoutN.width) {
			return true;
		}

		const propsChange = shouldUpdate(others, otherN, ['currentScreen', 'pushToken', 'phonesList', 'deviceName', 'deviceId', 'openModal']);
		if (propsChange) {
			return true;
		}
		return false;
	}
	return false;
}

onChildDidMount = (h1: string, h2: string, infoButton?: Object | null = null) => {
	this.setState({
		h1,
		h2,
		infoButton: null,
	});
};

submitPushToken() {
	if (Platform.OS === 'android') {
		this.confirmTokenSubmit();
	} else {
		PushNotificationIOS.checkPermissions((permissions: Object) => {
			const { alert, badge, sound } = permissions;
			if (alert || badge || sound) {
				this.confirmTokenSubmit();
			} else {
				const { screenProps } = this.props;
				const { toggleDialogueBox, intl } = screenProps;
				const { formatMessage } = intl;
				const message = formatMessage(i18n.pushPermissionContent);

				toggleDialogueBox({
					show: true,
					showHeader: true,
					text: message,
					header: formatMessage(i18n.pushPermissionHeader),
					showPositive: true,
					positiveText: null,
					showNegative: false,
				});
			}
		});
	}
}

confirmTokenSubmit() {
	this.setState({
		isPushSubmitLoading: true,
	});
	const { screenProps, actions, pushToken, onSubmitPushToken, deviceName, deviceId, phonesList } = this.props;
	const { formatMessage } = screenProps.intl;

	let uniqueId = deviceId ? deviceId : DeviceInfo.getUniqueId();
	for (let key in phonesList) {
		let { deviceId: idInList, token: tokenInList } = phonesList[key];
		// UUID/deviceId already found among push registered devices list
		// - If pushToken in the store matches with token in the list, it
		// must be the same device that is already registered[NO WORRIES THERE]
		// - But if tokens does not match then most probably, two different devices
		// seem to give same UUID/DeviceInfo.getUniqueId().
		// In that case modify deviceId before re-register.
		if (idInList === uniqueId && tokenInList !== pushToken) {
			uniqueId = `${uniqueId}-anomaly`;
		}
	}
	if (pushToken) {
		onSubmitPushToken(pushToken, deviceName, uniqueId).then((response: Object) => {
			let message = formatMessage(i18n.pushRegisterSuccess);
			actions.showToast(message);
			actions.getPhonesList().then(() => {
				this.setState({
					isPushSubmitLoading: false,
				});
				LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
			}).catch(() => {
				this.setState({
					isPushSubmitLoading: false,
				});
				LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
			});
		}).catch((error: Object) => {
			let errorCode = !error.error_description && error.message === 'Network request failed' ?
				`${formatMessage(i18n.networkFailed)}.` : error.message ?
					error.message : error.error_description ?
						error.error_description : error.error ?
							error.error : `${formatMessage(i18n.unknownError)}.`;
			this.showPushRegFailedToast(errorCode);
		});
	} else {
		this.showPushRegFailedToast('Push token missing, please try restarting the app.');
	}
}

showPushRegFailedToast(errorCode: string) {
	const { screenProps, actions } = this.props;
	const { formatMessage } = screenProps.intl;
	let message = formatMessage(i18n.pushRegisterFailed);
	message = `${message}.\nError code: ${errorCode}`;
	actions.showToast(message);
	this.setState({
		isPushSubmitLoading: false,
	});
}

onSubmitDeviceName(token: string, deviceName: string): Promise<any> {
	const { onSubmitDeviceName, deviceId } = this.props;
	let uniqueId = deviceId ? deviceId : DeviceInfo.getUniqueId();
	return onSubmitDeviceName(token, deviceName, uniqueId);
}

render(): Object {
	const { h1, h2, isPushSubmitLoading } = this.state;
	const {
		navigation,
		actions,
		screenProps,
		children,
		phonesList,
		pushToken,
		openModal,
		currentScreen,
	} = this.props;
	const {
		appLayout,
	} = screenProps;

	const {
		container,
		paddingHorizontal,
		body,
	} = this.getStyles(appLayout);

	const importantForAccessibility = openModal ? 'no-hide-descendants' : 'yes';
	return (

		<View
			level={3}
			style={container}>
			<NavigationHeaderPoster
				h1={h1} h2={h2}
				navigation={navigation}
				align={'left'}
				leftIcon={currentScreen === 'MainSettingsScreen' ? 'close' : undefined}
				handleBackPress={this.handleBackPress}
				{...screenProps}/>
			<ScrollView style={container} contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps={'always'}>
				<KeyboardAvoidingView behavior="padding" style={{flex: 1}} contentContainerStyle={{ justifyContent: 'center'}}>
					<View style={body} importantForAccessibility={importantForAccessibility}>
						{React.cloneElement(
							children,
							{
								onDidMount: this.onChildDidMount,
								submitPushToken: this.submitPushToken,
								onSubmitDeviceName: this.onSubmitDeviceName,
								navigation,
								actions,
								paddingHorizontal,
								phonesList,
								pushToken,
								isPushSubmitLoading,
								...screenProps,
								currentScreen,
							},
						)}
					</View>
				</KeyboardAvoidingView>
			</ScrollView>
		</View>
	);
}

getStyles(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const padding = deviceWidth * Theme.Core.paddingFactor;

	return {
		container: {
			flex: 1,
		},
		body: {
			flex: 1,
			padding,
		},
		paddingHorizontal: padding,
	};
}

}

const mapStateToProps = ({user, modal, navigation}: Object): Object => {
	const { phonesList = {}, pushToken, deviceName, deviceId } = user;
	const { openModal } = modal;
	const { screen: currentScreen } = navigation;
	return {
		phonesList,
		pushToken,
		deviceName,
		deviceId,
		openModal,
		currentScreen,
	};
};

const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators({
				deletePushToken,
				showToast,
				getPhonesList,
			}, dispatch),
		},
		onSubmitPushToken: async (token: string, deviceName: string, deviceId: string): Promise<any> => {
			const _deviceName = await DeviceInfo.getDeviceName();
			const manufacturer = await DeviceInfo.getManufacturer();

			let dName = deviceName ? deviceName : _deviceName;
			return dispatch(registerPushToken(token, dName, DeviceInfo.getModel(), manufacturer, DeviceInfo.getSystemVersion(), deviceId, pushServiceId));
		},
		onSubmitDeviceName: async (token: string, deviceName: string, deviceId: string): Promise<any> => {
			const manufacturer = await DeviceInfo.getManufacturer();
			return dispatch(registerPushToken(token, deviceName, DeviceInfo.getModel(), manufacturer, DeviceInfo.getSystemVersion(), deviceId, pushServiceId));
		},
	}
);

export default (connect(mapStateToProps, mapDispatchToProps)(SettingsContainer): Object);
