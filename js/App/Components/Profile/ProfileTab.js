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
	useCallback,
} from 'react';
import {
	TouchableOpacity,
	Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import {
	View,
	IconTelldus,
	Text,
	ThemedScrollView,
} from '../../../BaseComponents';
import {
	UserInfoBlock,
	LogoutButton,
	LogoutAllAccButton,
} from '../Settings/SubViews';
import {
	EditNameBlock,
	UpdatePasswordBlock,
	PrivacyPolicyLink,
	EulaLink,
	SwitchOrAddAccountButton,
} from './SubViews';
import {
	ViewPremiumBenefitsButton,
	UpgradePremiumButton,
	SubscriptionStatusBlock,
	PremiumInfoContent,
	AutoRenewalBlock,
	SMSBlock,
} from '../Premium/SubViews';
import {
	isAutoRenew,
	isBasicUser,
	getPremiumAccounts,
} from '../../Lib/appUtils';
import capitalize from '../../Lib/capitalize';
import Theme from '../../Theme';

import {
	onSwitchAccount,
	getUserProfile,
	unregisterPushToken,
	logoutSelectedFromTelldus,
	showToast,
	toggleVisibilitySwitchAccountAS,
} from '../../Actions';
import {
	useDialogueBox,
} from '../../Hooks/Dialoguebox';
import {
	useNonHiddenMainTabs,
} from '../../Hooks/Navigation';

import i18n from '../../Translations/common';

const ProfileTab: Object = React.memo<Object>((props: Object): Object => {
	const { screenProps: {
		toggleDialogueBox,
		intl,
	}, navigation } = props;

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		userProfile = {},
		subscriptions = {},
		accounts = {},
		userId,
		firebaseRemoteConfig = {},
		pushToken,
		switchAccountConf = {},
	} = useSelector((state: Object): Object => state.user);
	const { pro, firstname: fn, lastname: ln } = userProfile;
	const {
		isLoggingOut = false,
		...otherSAConfs
	} = switchAccountConf;

	const {
		premiumPurchase = JSON.stringify({enable: false}),
	} = firebaseRemoteConfig;
	const { enable } = JSON.parse(premiumPurchase);

	const {
		firstVisibleTab,
	} = useNonHiddenMainTabs();

	function onPressRedeemGift() {
		navigation.navigate('RedeemGiftScreen');
	}

	const dispatch = useDispatch();
	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const {
		formatMessage,
	} = intl;

	const {
		container,
		body,
		contentCoverStyleENB,
		valueCoverStyleENB,
		textFieldStyleENB,
		labelTextStyleENB,
		style,
		redeemCoverStyle,
		redeemIconStyle,
		redeemTextSyle,
		pHistoryCStyle,
	} = getStyles(layout, {
		isLoggingOut,
	});

	let showAuto = isAutoRenew(subscriptions);
	const isBasic = isBasicUser(pro);
	const premAccounts = getPremiumAccounts(accounts);
	const hasAPremAccount = Object.keys(premAccounts).length > 0;

	function onPressViewPurchaseHistory() {
		navigation.navigate('PurchaseHistoryScreen');
	}

	const onConfirmLogout = useCallback(() => {
		function proceedWithLogout() {
			if (Object.keys(accounts).length === 2) {
				dispatch(toggleVisibilitySwitchAccountAS({
					...otherSAConfs,
					isLoggingOut: true,
				}));
				let otherUserId;
				Object.keys(accounts).forEach((uid: string) => {
					const check1 = uid;
					if (check1 !== userId) {
						otherUserId = check1;
					}
				});
				if (otherUserId) {
					let { accessToken } = accounts[otherUserId];
					dispatch(getUserProfile(accessToken, {
						cancelAllPending: true,
						activeAccount: false,
						performPostSuccess: true,
					})).then((res: Object = {}) => {
						dispatch(onSwitchAccount({
							userId: otherUserId,
						}));

						dispatch(unregisterPushToken(pushToken));
						dispatch(toggleVisibilitySwitchAccountAS({
							...otherSAConfs,
							isLoggingOut: false,
						}));
						dispatch(logoutSelectedFromTelldus({
							userId,
						}));
						const messageOnSuccesSwitch = formatMessage(i18n.switchedToAccount, {
							value: `${res.firstname} ${res.lastname}`,
						});
						dispatch(showToast(messageOnSuccesSwitch));
						navigation.navigate('Tabs', {
							screen: firstVisibleTab,
						});
					}).catch((err: Object) => {
						dispatch(toggleVisibilitySwitchAccountAS({
							...otherSAConfs,
							isLoggingOut: false,
						}));
						toggleDialogueBoxState({
							show: true,
							showHeader: true,
							imageHeader: true,
							text: err.message || formatMessage(i18n.unknownError),
							showPositive: true,
						});
					});
				}
			} else {
				dispatch(toggleVisibilitySwitchAccountAS({
					showAS: true,
					isLoggingOut: true,
				}));
			}
		}

		(() => {
			const premAccsCount = Object.keys(premAccounts).length;
			if (premAccsCount > 1) {
				proceedWithLogout();
			} else {
				const userIdOfOnlyPremAcc = Object.keys(premAccounts)[0];
				if (userIdOfOnlyPremAcc === userId) {
					toggleDialogueBoxState({
						show: true,
						showHeader: true,
						imageHeader: true,
						header: `${formatMessage(i18n.logout)}?`,
						text: formatMessage(i18n.infoLogoutOnlyPremAccount),
						showPositive: true,
						positiveText: formatMessage(i18n.logout),
						onPressPositive: proceedWithLogout,
						showNegative: true,
						closeOnPressNegative: true,
						closeOnPressPositive: true,
						timeoutToCallPositive: 400,
					});
				} else {
					proceedWithLogout();
				}
			}
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		accounts,
		premAccounts,
		pushToken,
		userId,
		firstVisibleTab,
	]);

	const hasMultipleAccounts = Object.keys(accounts).length > 1;
	const isNotiOS = Platform.OS !== 'ios';

	return (
		<ThemedScrollView
			level={3}
			style={container}>
			<View
				level={3}
				style={body}>
				<UserInfoBlock blockContainerStyle={{
					marginBottom: 0,
				}}/>
				<EditNameBlock
					contentCoverStyle={contentCoverStyleENB}
					valueCoverStyle={valueCoverStyleENB}
					textFieldStyle={textFieldStyleENB}
					labelTextStyle={labelTextStyleENB}
					toggleDialogueBox={toggleDialogueBox}
					style={style}
					userProfile={userProfile}/>
				<UpdatePasswordBlock
					navigation={navigation}/>
				<EulaLink/>
				<PrivacyPolicyLink/>
				<SubscriptionStatusBlock
					navigation={navigation}
					enable={enable}
					contentCoverStyle={contentCoverStyleENB}
					valueCoverStyle={valueCoverStyleENB}
					textFieldStyle={textFieldStyleENB}
					labelTextStyle={labelTextStyleENB}
					style={showAuto ? undefined : style}
				/>
				{!isBasic && (<AutoRenewalBlock
					navigation={navigation}
					contentCoverStyle={contentCoverStyleENB}
					valueCoverStyle={valueCoverStyleENB}
					textFieldStyle={textFieldStyleENB}
					labelTextStyle={labelTextStyleENB}
					style={style}
					enablePurchase={enable}
				/>)}
				{(isBasic && enable) && <PremiumInfoContent/>}
				{(isBasic && enable) && <UpgradePremiumButton
					navigation={navigation}/>}
				{enable && (
					<TouchableOpacity onPress={onPressViewPurchaseHistory} style={pHistoryCStyle}>
						<Text
							level={36}
							style={redeemTextSyle}>
							{formatMessage(i18n.viewPurchaseHistory)}
						</Text>
					</TouchableOpacity>
				)}
				{(enable && isNotiOS) && (
					<TouchableOpacity onPress={onPressRedeemGift}>
						<View style={redeemCoverStyle}>
							<IconTelldus
								icon={'gift'}
								style={redeemIconStyle}
								level={36}/>
							<Text
								level={36}
								style={redeemTextSyle}>
								{capitalize(formatMessage(i18n.redeemCard))}
							</Text>
						</View>
					</TouchableOpacity>
				)}
				{!isBasic && (<SMSBlock
					navigation={navigation}
					contentCoverStyle={contentCoverStyleENB}
					valueCoverStyle={valueCoverStyleENB}
					textFieldStyle={textFieldStyleENB}
					labelTextStyle={labelTextStyleENB}
					style={style}
					enablePurchase={enable}/>
				)}
				{(isBasic && enable) && <ViewPremiumBenefitsButton
					navigation={navigation}/>}
				{(hasMultipleAccounts && hasAPremAccount) && <LogoutButton
					buttonAccessibleProp={true}
					toggleDialogueBox={toggleDialogueBox}
					onConfirmLogout={onConfirmLogout}
					label={`${formatMessage(i18n.labelLogOut)} ${fn} ${ln}`}
					isLoggingOut={isLoggingOut}
				/>}
				<LogoutAllAccButton
					buttonAccessibleProp={true}
					toggleDialogueBox={toggleDialogueBox}
					label={hasMultipleAccounts ? formatMessage(i18n.logoutFromAllAccnts) : formatMessage(i18n.labelLogOut)}
					isLoggingOut={isLoggingOut}
				/>
				<SwitchOrAddAccountButton
					disabled={isLoggingOut}/>
			</View>
		</ThemedScrollView>
	);
});

const getStyles = (appLayout: Object, {
	isLoggingOut,
}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		fontSizeFactorEight,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const paddingEditNameBlock = Math.floor(deviceWidth * fontSizeFactorEight);

	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);

	return {
		style: {
			marginBottom: padding / 2,
		},
		contentCoverStyleENB: {
			padding: paddingEditNameBlock,
		},
		valueCoverStyleENB: {
			paddingVertical: 0,
		},
		textFieldStyleENB: {
			fontSize: fontSize,
		},
		labelTextStyleENB: {
			fontSize: fontSize,
		},
		container: {
			flex: 1,
		},
		body: {
			flex: 1,
			paddingHorizontal: padding,
			paddingBottom: padding,
			paddingTop: padding * 1.5,
		},
		pHistoryCStyle: {
			marginTop: padding,
			alignSelf: 'center',
			alignItems: 'center',
			justifyContent: 'center',
		},
		redeemCoverStyle: {
			marginVertical: padding,
			alignSelf: 'center',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
		},
		redeemTextSyle: {
			fontSize: fontSize * 0.9,
		},
		redeemIconStyle: {
			fontSize: fontSize,
			marginRight: 5,
		},
	};
};

export default (ProfileTab: Object);
