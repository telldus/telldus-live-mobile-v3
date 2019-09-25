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

import React, { useState } from 'react';
import {
	ScrollView,
	LayoutAnimation,
	Platform,
} from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import DeviceInfo from 'react-native-device-info';

import {
	View,
	NavigationHeaderPoster,
	Text,
	IconTelldus,
	TitledInfoBlock,
	TouchableButton,
	Throbber,
} from '../../../BaseComponents';

import {
	getPhonesList,
	deletePushToken,
	registerPushToken,
} from '../../Actions/User';
import {
	showToast,
} from '../../Actions/App';

import {
	linearCUD,
} from '../../Lib/LayoutAnimations';

import { pushServiceId } from '../../../Config';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

const RegisterForPushScreen = (props: Object): Object => {
	const { navigation, screenProps } = props;
	const { layout } = useSelector((state: Object): Object => state.app);
	const { phonesList = {}, pushToken, deviceName, deviceId } = useSelector((state: Object): Object => state.user);
	const {
		container,
		iconStyle,
		fontSize,
		contentCover,
		contentTextStyle,
		contentTitleStyle,
		phoneIconStyle,
		valueTextStyle,
		blockContainerStyle,
		touchableButtonStyle,
		throbberStyle,
		throbberContainerStyle,
		loadingInfoCover,
		loadingTextStyle,
		labelTextStyle,
	} = getStyles(layout);

	const { formatMessage } = useIntl();
	const [isPushSubmitLoading, setIsPushSubmitLoading] = useState(false);
	const [{
		isDeleteTokenLoading,
		deletingToken,
	}, setIsDeleteTokenLoading] = useState({
		isDeleteTokenLoading: false,
		deletingToken: null,
	});

	const dispatch = useDispatch();

	function submitPushToken() {
		if (Platform.OS === 'android') {
			confirmTokenSubmit();
		} else {
			PushNotificationIOS.checkPermissions((permissions: Object) => {
				const { alert, badge, sound } = permissions;
				if (alert || badge || sound) {
					confirmTokenSubmit();
				} else {
					const { toggleDialogueBox } = screenProps;
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

	function confirmTokenSubmit() {
		setIsPushSubmitLoading(true);

		let uniqueId = deviceId ? deviceId : DeviceInfo.getUniqueID();
		for (let key in phonesList) {
			let { deviceId: idInList, token: tokenInList } = phonesList[key];
			// UUID/deviceId already found among push registered devices list
			// - If pushToken in the store matches with token in the list, it
			// must be the same device that is already registered[NO WORRIES THERE]
			// - But if tokens does not match then most probably, two different devices
			// seem to give same UUID/DeviceInfo.getUniqueID().
			// In that case modify deviceId before re-register.
			if (idInList === uniqueId && tokenInList !== pushToken) {
				uniqueId = `${uniqueId}-anomaly`;
			}
		}
		if (pushToken) {
			let dName = deviceName ? deviceName : DeviceInfo.getDeviceName();
			dispatch(registerPushToken(
				pushToken,
				dName,
				DeviceInfo.getModel(),
				DeviceInfo.getManufacturer(),
				DeviceInfo.getSystemVersion(),
				uniqueId,
				pushServiceId)).then((response: Object) => {
				let message = formatMessage(i18n.pushRegisterSuccess);
				dispatch(showToast(message));
				dispatch(getPhonesList());
				setIsPushSubmitLoading(false);
				navigation.goBack();
			}).catch((error: Object) => {
				let errorCode = !error.error_description && error.message === 'Network request failed' ?
					`${formatMessage(i18n.networkFailed)}.` : error.message ?
						error.message : error.error_description ?
							error.error_description : error.error ?
								error.error : `${formatMessage(i18n.unknownError)}.`;
				showPushRegFailedToast(errorCode);
			});
		} else {
			showPushRegFailedToast('Push token missing, please try restarting the app.');
		}
	}

	function showPushRegFailedToast(errorCode: string) {
		let message = formatMessage(i18n.pushRegisterFailed);
		message = `${message}.\nError code: ${errorCode}`;
		dispatch(showToast(message));
		setIsPushSubmitLoading(false);
	}

	function onConfirmDeleteToken(token: string) {
		setIsDeleteTokenLoading({
			isDeleteTokenLoading: true,
			deletingToken: token,
		});
		LayoutAnimation.configureNext(linearCUD(300));
		dispatch(deletePushToken(token)).then(() => {
			setIsDeleteTokenLoading({
				isDeleteTokenLoading: false,
				deletingToken: null,
			});
			dispatch(getPhonesList()).then(() => {
				LayoutAnimation.configureNext(linearCUD(300));
			});
			submitPushToken();
		}).catch(() => {
			setTimeout(() => {
				setIsDeleteTokenLoading({
					isDeleteTokenLoading: false,
					deletingToken: null,
				});
				LayoutAnimation.configureNext(linearCUD(300));
				dispatch(showToast());
			}, 5000);
		});
	}

	function renderBlock({token, name, key, label}: Object): Object {
		function onPressPushSettings() {
			onConfirmDeleteToken(token);
		}

		return (
			<TitledInfoBlock
				key={key}
				label={label}
				icon={'angle-right'}
				iconStyle={iconStyle}
				fontSize={fontSize}
				valueTextStyle={valueTextStyle}
				labelTextStyle={labelTextStyle}
				blockContainerStyle={blockContainerStyle}
				value={name}
				onPress={isLoading ? null : onPressPushSettings}
			/>
		);
	}

	const isLoading = isPushSubmitLoading || isDeleteTokenLoading;

	let phones = [];
	let myPhone;
	const deviceUniqueId = DeviceInfo.getUniqueID();

	let isMine = false;
	let nextLabel = formatMessage(i18n.otherPhone);
	Object.keys(phonesList).map((key: string, i: number): Object => {
		let { token, name, deviceId: uniqueDeviceId } = phonesList[key];
		isMine = false;
		if (deviceUniqueId === uniqueDeviceId) {
			isMine = true;
		}

		if (deletingToken) {
			if (deletingToken === token) {
				if (isMine) {
					myPhone = renderBlock({
						token,
						name,
						key,
						label: formatMessage(i18n.myPhone),
					});
					nextLabel = i === 0 ? formatMessage(i18n.otherPhone) : formatMessage(i18n.yetAnotherPhone);
				} else {
					phones.push(renderBlock({
						token,
						name,
						key,
						label: nextLabel,
					}));
					nextLabel = formatMessage(i18n.yetAnotherPhone);
				}
			} else {
				nextLabel = formatMessage(i18n.yetAnotherPhone);
			}
		} else if (isMine) {
			myPhone = renderBlock({
				token,
				name,
				key,
				label: formatMessage(i18n.myPhone),
			});
			nextLabel = i === 0 ? formatMessage(i18n.otherPhone) : formatMessage(i18n.yetAnotherPhone);
		} else {
			phones.push(renderBlock({
				token,
				name,
				key,
				label: nextLabel,
			}));
			nextLabel = formatMessage(i18n.yetAnotherPhone);
		}
	});
	if (myPhone) {
		phones.unshift(myPhone);
	}

	return (
		<View style={container}>
			<NavigationHeaderPoster
				h1={formatMessage(i18n.registerForPush)} h2={formatMessage(i18n.receiveNotifications)}
				align={'right'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...screenProps}/>
			<ScrollView style={{
				flex: 1,
			}}>
				<View style={contentCover}>
					<IconTelldus icon={'phone'} style={phoneIconStyle}/>
					<Text style={contentTitleStyle}>
						{formatMessage(i18n.replaceAnOldPhone)}
					</Text>
					<Text style={contentTextStyle}>
						{formatMessage(i18n.replaceOldDeviceAndRegisterPush)}
					</Text>
				</View>
				{phones}
				{isDeleteTokenLoading && <View style={loadingInfoCover}>
					<Throbber throbberContainerStyle={throbberContainerStyle} throbberStyle={throbberStyle}/>
					<Text style={loadingTextStyle}>
						{formatMessage(i18n.registeringDeviceForPush)}...
					</Text>
				</View>
				}
				{!isDeleteTokenLoading && <TouchableButton
					text={isPushSubmitLoading ? `${formatMessage(i18n.registering)}...` : formatMessage(i18n.noAddThisAsANewDevice)}
					onPress={isLoading ? null : submitPushToken}
					style={touchableButtonStyle}/>
				}
			</ScrollView>
		</View>

	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const padding = deviceWidth * Theme.Core.paddingFactor;

	const fontSize = Math.floor(deviceWidth * 0.045);

	return {
		container: {
			flex: 1,
			backgroundColor: Theme.Core.appBackground,
		},
		fontSize,
		iconStyle: {
			color: '#8e8e93',
		},
		contentCover: {
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: '#fff',
			...Theme.Core.shadow,
			padding: padding * 1.5,
			marginTop: padding * 1.5,
			marginHorizontal: padding,
			marginBottom: padding / 2,
		},
		contentTextStyle: {
			fontSize: fontSize * 0.9,
			textAlign: 'center',
			color: Theme.Core.rowTextColor,
		},
		contentTitleStyle: {
			fontSize: fontSize * 1.2,
			textAlign: 'center',
			color: Theme.Core.eulaContentColor,
			marginVertical: 10,
		},
		phoneIconStyle: {
			fontSize: fontSize * 4,
			color: Theme.Core.brandSecondary,
		},
		labelTextStyle: {
			color: Theme.Core.eulaContentColor,
		},
		valueTextStyle: {
			marginRight: 15,
			marginLeft: 5,
			textAlign: 'right',
		},
		blockContainerStyle: {
			marginHorizontal: padding,
			marginBottom: padding / 2,
		},
		touchableButtonStyle: {
			marginVertical: padding,
			width: deviceWidth - (padding * 6),
		},
		loadingInfoCover: {
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
		},
		throbberContainerStyle: {
			marginVertical: padding,
			position: 'relative',
			marginRight: 10,
		},
		throbberStyle: {
			fontSize: fontSize * 1.6,
			color: Theme.Core.eulaContentColor,
		},
		loadingTextStyle: {
			fontSize,
			color: Theme.Core.eulaContentColor,
		},
	};
};

export default RegisterForPushScreen;
