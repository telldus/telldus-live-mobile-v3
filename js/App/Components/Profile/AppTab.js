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

import React, { useEffect, useState } from 'react';
import {
	ScrollView,
	Platform,
	LayoutAnimation,
	TouchableOpacity,
} from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import { useIntl } from 'react-intl';
import DeviceInfo from 'react-native-device-info';
import { NavigationActions } from 'react-navigation';

import { pushServiceId } from '../../../Config';

import {
	View,
	TabBar,
	SettingsRow,
	Text,
} from '../../../BaseComponents';
import {
	AppVersionBlock,
	WhatsNewLink,
	PushInfoBlock,
	DBSortControlBlock,
	LanguageControlBlock,
} from '../Settings/SubViews';
import { LayoutAnimations } from '../../Lib';
import {
	getPhonesList,
	registerPushToken,
} from '../../Actions/User';
import {
	showToast,
	setDBCarousel,
	setReportCrash,
} from '../../Actions/App';
import {
	setUserIdentifierFirebaseCrashlytics,
	setUserNameFirebaseCrashlytics,
} from '../../Actions/Analytics';
import {
	resetFence,
} from '../../Actions/Fences';
import {
	useDialogueBox,
} from '../../Hooks/Dialoguebox';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

const AppTab = (props: Object): Object => {
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

	const { dbCarousel = true, reportCrash = true } = defaultSettings;

	const {
		container,
		body,
		touchableStyle,
		labelTextStyle,
		switchStyle,
		titleStyle,
		contentCoverStyle,
		crashLabelCover,
		crashInfoText,
		bBSortDropDownContainerStyle,
	} = getStyles(layout);

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(getPhonesList());
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
			dispatch(registerPushToken(pushToken, dName, DeviceInfo.getModel(), DeviceInfo.getManufacturer(), DeviceInfo.getSystemVersion(), uniqueId, pushServiceId)).then((response: Object) => {
				let message = formatMessage(i18n.pushRegisterSuccess);
				dispatch(showToast(message));
				dispatch(getPhonesList()).then(() => {
					setIsPushSubmitLoading(false);
					LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
				}).catch(() => {
					setIsPushSubmitLoading(false);
					LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
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

	function toggleReportCrash() {
		dispatch(setReportCrash(!reportCrash));
		dispatch(setUserIdentifierFirebaseCrashlytics());
		dispatch(setUserNameFirebaseCrashlytics());
	}

	function onPressCrashInfo() {
		toggleDialogueBoxState({
			show: true,
			showHeader: true,
			imageHeader: true,
			header: formatMessage(i18n.crashReports),
			text: formatMessage(i18n.sendCrashAnonymouslyInfo),
			showPositive: true,
		});
	}

	const { fences } = useSelector((state: Object): Object => state.fences);
	function onPressGeoFence() {
		if (!fences || fences.length === 0) {
			dispatch(resetFence());
			const navigateAction = NavigationActions.navigate({
				routeName: 'GeoFenceNavigator',
				key: 'GeoFenceNavigator',
				action: NavigationActions.navigate({
					routeName: 'SelectArea',
					key: 'SelectArea',
				}),
			  });
			navigation.dispatch(navigateAction);
		} else {
			navigation.navigate({
				routeName: 'GeoFenceNavigator',
				key: 'GeoFenceNavigator',
			});
		}
	}

	return (
		<ScrollView style={container}>
			<View style={body}>
				<AppVersionBlock/>
				<WhatsNewLink/>
				<Text style={{
					padding: 10,
					color: 'red',
					alignSelf: 'center',
					margin: 10,
				}} onPress={onPressGeoFence}>
				Add or Edit Geo Fence
				</Text>
				<PushInfoBlock
					navigation={navigation}
					isPushSubmitLoading={isPushSubmitLoading}
					submitPushToken={submitPushToken}
				/>
				<LanguageControlBlock/>
				<Text style={titleStyle}>
					{formatMessage(i18n.dashboard)}
				</Text>
				<DBSortControlBlock
					showLabel={true}
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
				<Text style={titleStyle}>
					{formatMessage(i18n.crashReports)}
				</Text>
				<SettingsRow
					label={
						<View style={crashLabelCover}>
							<Text style={labelTextStyle}>
								{formatMessage(i18n.sendCrashAnonymously)}
							</Text>
							<TouchableOpacity onPress={onPressCrashInfo}>
								<Text style={crashInfoText}>
									?
								</Text>
							</TouchableOpacity>
						</View>
					}
					onValueChange={toggleReportCrash}
					value={reportCrash}
					appLayout={layout}
					intl={intl}
					labelTextStyle={labelTextStyle}
					touchableStyle={touchableStyle}
					switchStyle={switchStyle}
					style={contentCoverStyle}/>
			</View>
		</ScrollView>
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
		body: {
			flex: 1,
			paddingHorizontal: padding,
			paddingBottom: padding,
			paddingTop: padding * 1.5,
		},
		crashLabelCover: {
			justifyContent: 'center',
			alignItems: 'center',
			flexDirection: 'row',
		},
		labelTextStyle: {
			fontSize,
			color: '#000',
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
			color: '#b5b5b5',
			fontSize,
		},
		crashInfoText: {
			fontSize,
			color: Theme.Core.red,
			fontWeight: 'bold',
			paddingHorizontal: 3,
		},
		bBSortDropDownContainerStyle: {
			marginBottom: 0,
			flex: 1,
		},
	};
};

AppTab.navigationOptions = ({ navigation }: Object): Object => ({
	tabBarLabel: ({ tintColor }: Object): Object => (
		<TabBar
			icon="phone"
			tintColor={tintColor}
			label={i18n.labelApp}
			accessibilityLabel={i18n.labelAccessibleAppTab}/>
	),
	tabBarOnPress: ({scene, jumpToIndex}: Object) => {
		navigation.navigate({
			routeName: 'AppTab',
			key: 'AppTab',
		});
	},
});

export default AppTab;
