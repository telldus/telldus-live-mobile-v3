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
import { BackHandler, ScrollView, Platform, PushNotificationIOS, KeyboardAvoidingView, LayoutAnimation } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
const isEqual = require('react-fast-compare');
import DeviceInfo from 'react-native-device-info';

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

	actions?: Object,
	navigation: Object,
	children: Object,
	onSubmitPushToken: (string, ?string) => Promise<any>,
	onSubmitDeviceName: (string, string) => Promise<any>,
};

type State = {
	h1: string,
	h2: string,
	infoButton: null | Object,
	isPushSubmitLoading: boolean,
	isDialogueOpen: boolean,
};

class SettingsContainer extends View<Props, State> {

state: State = {
	h1: '',
	h2: '',
	infoButton: null,
	isPushSubmitLoading: false,
	isDialogueOpen: false,
};

handleBackPress: () => void;
onChildDidMount: (string, string, ?string) => void;
submitPushToken: (string) => void;
constructor(props: Props) {
	super(props);

	this.handleBackPress = this.handleBackPress.bind(this);
	this.onChildDidMount = this.onChildDidMount.bind(this);
	this.submitPushToken = this.submitPushToken.bind(this);
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
	if (nextProps.ScreenName === nextProps.screenProps.currentScreen) {
		const isStateEqual = isEqual(this.state, nextState);
		if (!isStateEqual) {
			return true;
		}

		const { screenProps, ...others } = this.props;
		const { screenProps: screenPropsN, ...otherN } = nextProps;
		const { currentScreen, appLayout } = screenProps;
		const { currentScreen: currentScreenN, appLayout: appLayoutN } = screenPropsN;
		if ((currentScreen !== currentScreenN) || (appLayout.width !== appLayoutN.width)) {
			return true;
		}

		const propsChange = shouldUpdate(others, otherN, ['pushToken', 'phonesList', 'deviceName']);
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
					notificationHeader: formatMessage(i18n.pushPermissionHeader),
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
	const { screenProps, actions, pushToken, onSubmitPushToken, deviceName } = this.props;
	const { formatMessage } = screenProps.intl;
	if (pushToken) {
		onSubmitPushToken(pushToken, deviceName).then((response: Object) => {
			let message = formatMessage(i18n.pushRegisterSuccess);
			actions.showToast(message);
			actions.getPhonesList().then(() => {
				this.setState({
					isPushSubmitLoading: false,
				});
				LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
			}).catch(() => {
				this.setState({
					isPushSubmitLoading: false,
				});
				LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
			});
		}).catch(() => {
			let message = formatMessage(i18n.pushRegisterFailed);
			actions.showToast(message);
			this.setState({
				isPushSubmitLoading: false,
			});
		});
	} else {
		let message = formatMessage(i18n.pushRegisterFailed);
		actions.showToast(message);
		this.setState({
			isPushSubmitLoading: false,
		});
	}
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
	} = this.props;
	const {
		appLayout,
		currentScreen,
	} = screenProps;

	const {
		container,
		paddingHorizontal,
		body,
	} = this.getStyles(appLayout);

	const importantForAccessibility = this.state.isDialogueOpen ? 'no-hide-descendants' : 'yes';// TODO: isDialogueOpen is not handled yet

	return (

		<View style={container}>
			<NavigationHeaderPoster
				h1={h1} h2={h2}
				navigation={navigation}
				align={'right'}
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
								onSubmitDeviceName: this.props.onSubmitDeviceName,
								navigation,
								actions,
								paddingHorizontal,
								phonesList,
								pushToken,
								isPushSubmitLoading,
								...screenProps,
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
			backgroundColor: Theme.Core.appBackground,
		},
		body: {
			flex: 1,
			padding,
		},
		paddingHorizontal: padding,
	};
}

}

const mapStateToProps = ({user}: Object): Object => {
	const { phonesList = {}, pushToken, deviceName } = user;
	return {
		phonesList,
		pushToken,
		deviceName,
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
		onSubmitPushToken: (token: string, deviceName: string): Promise<any> => {
			let dName = deviceName ? deviceName : DeviceInfo.getDeviceName();
			return dispatch(registerPushToken(token, dName, DeviceInfo.getModel(), DeviceInfo.getManufacturer(), DeviceInfo.getSystemVersion(), DeviceInfo.getUniqueID(), pushServiceId));
		},
		onSubmitDeviceName: (token: string, deviceName: string): Promise<any> => {
			return dispatch(registerPushToken(token, deviceName, DeviceInfo.getModel(), DeviceInfo.getManufacturer(), DeviceInfo.getSystemVersion(), DeviceInfo.getUniqueID(), pushServiceId));
		},
	}
);

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainer);
