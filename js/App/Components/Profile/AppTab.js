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

import React, {
	useEffect,
	useState,
} from 'react';
import {
	Platform,
	LayoutAnimation,
} from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import { useIntl } from 'react-intl';
import DeviceInfo from 'react-native-device-info';

import { pushServiceId } from '../../../Config';

import {
	View,
	SettingsRow,
	Text,
	ThemedScrollView,
} from '../../../BaseComponents';
import {
	AppVersionBlock,
	WhatsNewLink,
	PushInfoBlock,
	DBSortControlBlock,
	LanguageControlBlock,
	SensorLastUpdateModeControlBlock,
	DBNameDisplayControlBlock,
	DBTileDisplayControlBlock,
	TabsBatteryStatusControlBlock,
} from '../Settings/SubViews';
import {
	WidgetFontSizeSetting,
	ThemesBlock,
	ShowHideTabsBlock,
	SetDefaultStartScreenDropDown,
} from './SubViews';

import { LayoutAnimations } from '../../Lib';
import {
	getPhonesList,
	registerPushToken,
} from '../../Actions/User';
import {
	showToast,
	setDBCarousel,
} from '../../Actions/App';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

const AppTab: Object = React.memo<Object>((props: Object): Object => {
	const { screenProps, navigation } = props;
	const intl = useIntl();
	const { formatMessage } = intl;
	const [ isPushSubmitLoading, setIsPushSubmitLoading ] = useState(false);

	const { layout, defaultSettings } = useSelector((state: Object): Object => state.app);
	const {
		phonesList = {},
		pushToken,
		deviceName,
		deviceId,
	} = useSelector((state: Object): Object => state.user);

	const { dbCarousel = true } = defaultSettings;

	const {
		container,
		body,
		touchableStyle,
		labelTextStyle,
		switchStyle,
		titleStyle,
		contentCoverStyle,
		bBSortDropDownContainerStyle,
	} = getStyles(layout);

	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(getPhonesList());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// TODO: Refactor using a hook, handle code repeat(repeat of methods in SettingsContainer).
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
						header: formatMessage(i18n.pushPermissionHeader),
						showPositive: true,
						positiveText: null,
						showNegative: false,
					});
				}
			});
		}
	}

	async function confirmTokenSubmit() {
		setIsPushSubmitLoading(true);

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
			const _deviceName = await DeviceInfo.getDeviceName();
			const manufacturer = await DeviceInfo.getManufacturer();
			let dName = deviceName ? deviceName : _deviceName;
			dispatch(registerPushToken(pushToken, dName, DeviceInfo.getModel(), manufacturer, DeviceInfo.getSystemVersion(), uniqueId, pushServiceId)).then((response: Object) => {
				let message = formatMessage(i18n.pushRegisterSuccess);
				dispatch(showToast(message));
				dispatch(getPhonesList()).then(() => {
					setIsPushSubmitLoading(false);
					LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
				}).catch(() => {
					setIsPushSubmitLoading(false);
					LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
				});
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

	function toggleDBCarousel() {
		dispatch(setDBCarousel(!dbCarousel));
	}

	return (
		<ThemedScrollView
			level={3}
			style={container}>
			<View
				level={3}
				style={body}>
				<AppVersionBlock/>
				<WhatsNewLink/>
				<Text
					level={2}
					style={titleStyle}>
					{formatMessage(i18n.theme)}
				</Text>
				<ThemesBlock/>
				<PushInfoBlock
					navigation={navigation}
					isPushSubmitLoading={isPushSubmitLoading}
					submitPushToken={submitPushToken}
				/>
				<LanguageControlBlock/>
				<ShowHideTabsBlock
					intl={intl}
					layout={layout}/>
				<SetDefaultStartScreenDropDown/>
				<Text
					level={2}
					style={titleStyle}>
					{formatMessage(i18n.dashboard)}
				</Text>
				<DBSortControlBlock
					showLabel={true}
					dropDownContainerStyle={bBSortDropDownContainerStyle}/>
				<DBNameDisplayControlBlock
					dropDownContainerStyle={bBSortDropDownContainerStyle}/>
				<SettingsRow
					label={formatMessage(i18n.autoCycleSenVal)}
					onValueChange={toggleDBCarousel}
					value={dbCarousel}
					appLayout={layout}
					intl={intl}
					labelTextStyle={labelTextStyle}
					touchableStyle={touchableStyle}
					switchStyle={switchStyle}
					style={[contentCoverStyle, {
						marginTop: 0,
					}]}/>
				<DBTileDisplayControlBlock
					dropDownContainerStyle={bBSortDropDownContainerStyle}/>
				<Text
					level={2}
					style={titleStyle}>
					{formatMessage(i18n.dAndSList)}
				</Text>
				<SensorLastUpdateModeControlBlock
					showLabel={true}
					dropDownContainerStyle={bBSortDropDownContainerStyle}/>
				<TabsBatteryStatusControlBlock
					dropDownContainerStyle={bBSortDropDownContainerStyle}/>
				{Platform.OS === 'android' &&
					<WidgetFontSizeSetting
						appLayout={layout}
						intl={intl}/>
				}
			</View>
		</ThemedScrollView>
	);
});

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		fontSizeFactorEight,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);

	return {
		container: {
			flex: 1,
		},
		body: {
			flex: 1,
			paddingHorizontal: padding,
			paddingBottom: padding,
			paddingTop: padding * 1.5,
		},
		labelTextStyle: {
			fontSize,
			justifyContent: 'center',
		},
		touchableStyle: {
			height: fontSize * 3.1,
		},
		switchStyle: {
			transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
		},
		contentCoverStyle: {
			marginBottom: fontSize / 2,
		},
		titleStyle: {
			marginBottom: 5,
			fontSize,
		},
		bBSortDropDownContainerStyle: {
			marginBottom: 0,
			flex: 1,
		},
	};
};

export default (AppTab: Object);
