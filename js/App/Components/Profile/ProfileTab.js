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

import React from 'react';
import {
	ScrollView,
	TouchableOpacity,
	StyleSheet,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
const gravatar = require('gravatar-api');
import { RadioButtonInput } from 'react-native-simple-radio-button';

import {
	View,
	TabBar,
	IconTelldus,
	Text,
	ActionSheet,
	Image,
	Throbber,
	EmptyView,
	RippleButton,
	CachedImage,
} from '../../../BaseComponents';
import {
	UserInfoBlock,
	LogoutButton,
	LogoutAllAccButton,
} from '../Settings/SubViews';
import {
	EditNameBlock,
	UpdatePasswordBlock,
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
} from '../../Actions';
import {
	useDialogueBox,
} from '../../Hooks/Dialoguebox';

import AddAccountBlock from './SubViews/AddAccountBlock';

import i18n from '../../Translations/common';

const ProfileTab = (props: Object): Object => {
	const { screenProps: {
		toggleDialogueBox,
		intl,
	}, navigation } = props;
	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		userProfile = {},
		subscriptions = {},
		accounts = {},
		userId = '',
		firebaseRemoteConfig = {},
		pushToken,
	} = useSelector((state: Object): Object => state.user);
	const { pro, firstname: fn, lastname: ln } = userProfile;

	const actionSheetRef = React.useRef();

	const { premiumPurchase = JSON.stringify({enable: false}) } = firebaseRemoteConfig;
	const { enable } = JSON.parse(premiumPurchase);

	function onPressRedeemGift() {
		navigation.navigate({
			routeName: 'RedeemGiftScreen',
			key: 'RedeemGiftScreen',
		});
	}

	const dispatch = useDispatch();
	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const [ showAddNewAccount, setShowAddNewAccount ] = React.useState(false);
	const [ switchingId, setSwitchingId ] = React.useState(null);
	const [ isLoggingOut, setIsLoggingOut ] = React.useState(false);

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
		actionSheetTitle,
		actionSheetTitleCover,
		actionSheetOverlay,
		actionSheetTitleBox,
		actionSheetMessageBox,
		actionSheetButtonBox,
		actionSheetButtonOne,
		actionSheetButtonTwo,
		actionSheetButtonOneCover,
		actionSheetButtonTwoCover,
		actionSheetButtonAccCover,
		actionSheetButtonAccText,
		addIconStyle,
		addIconCoverStyle,
		gravatarStyle,
		brandSecondary,
		rbSize,
		rbOuterSize,
		throbberContainerStyle,
		throbberStyle,
	} = getStyles(layout, {
		showAddNewAccount,
		isLoggingOut,
	});

	let showAuto = isAutoRenew(subscriptions);
	const isBasic = isBasicUser(pro);
	const premAccounts = getPremiumAccounts(accounts);
	const hasAPremAccount = Object.keys(premAccounts).length > 0;

	function onPressViewPurchaseHistory() {
		navigation.navigate({
			routeName: 'PurchaseHistoryScreen',
			key: 'PurchaseHistoryScreen',
		});
	}

	function showActionSheet() {
		if (actionSheetRef.current) {
			actionSheetRef.current.show();
		}
	}

	function onPressAddAccount() {
		if (!hasAPremAccount) {
			toggleDialogueBoxState({
				show: true,
				showHeader: true,
				imageHeader: true,
				header: formatMessage(i18n.upgradeToPremium),
				text: 'This is a premium feature. Please buy any of our premium package to enjoy this feature.',
				showPositive: true,
				showNegative: true,
				positiveText: formatMessage(i18n.upgrade).toUpperCase(),
				onPressPositive: () => {
					navigation.navigate('PremiumUpgradeScreen', {}, 'PremiumUpgradeScreen');
				},
				closeOnPressPositive: true,
				timeoutToCallPositive: 200,
			});
			return;
		}
		if (isLoggingOut) {
			return;
		}
		showActionSheet();
	}

	function closeActionSheet(index?: number, callback?: Function) {
		if (actionSheetRef.current) {
			actionSheetRef.current.hide(index, callback);
		}
	}

	function proceedWithLogout() {
		setIsLoggingOut(true);
		if (Object.keys(accounts).length === 2) {
			let otherUserId;
			Object.keys(accounts).forEach((uid: string) => {
				const check1 = uid.trim().toLowerCase();
				if (check1 !== userId.trim().toLowerCase()) {
					otherUserId = check1;
				}
			});
			if (otherUserId) {
				let { accessToken } = accounts[otherUserId];
				dispatch(getUserProfile(accessToken, true)).then(() => {
					dispatch(onSwitchAccount({
						userId: otherUserId,
					}));

					dispatch(unregisterPushToken(pushToken));
					setIsLoggingOut(false);
					dispatch(logoutSelectedFromTelldus({
						userId,
					}));

					dispatch(showToast(`You have switched to the account ${userProfile.email}`));
				}).catch((err: Object) => {
					setIsLoggingOut(false);
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
			showActionSheet();
		}
	}

	function onConfirmLogout() {
		const premAccsCount = Object.keys(premAccounts).length;
		if (premAccsCount > 1) {
			proceedWithLogout();
		} else {
			const userIdOfOnlyPremAcc = Object.keys(premAccounts)[0];
			if (userIdOfOnlyPremAcc.trim().toLowerCase() === userId.trim().toLowerCase()) {
				toggleDialogueBoxState({
					show: true,
					showHeader: true,
					imageHeader: true,
					text: 'You are about to log out from the only premium account. You no longer can access premium features.' +
					' Hence mulitple accounts feature will be disabled. If you would like to log out any way please select any one ' +
					'account that you would like to switch to.',
					showPositive: true,
					positiveText: formatMessage(i18n.logout).toUpperCase(),
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
	}

	function onSelectActionSheet(index: number) {
		if (switchingId) {
			return;
		}
		if (showAddNewAccount) {
			setShowAddNewAccount(false);
			if (index === 0) {
				navigation.navigate({
					routeName: 'LoginScreen',
					key: 'LoginScreen',
				});
			} else if (index === 1) {
				navigation.navigate({
					routeName: 'RegisterScreen',
					key: 'RegisterScreen',
				});
			}
		} else {
			const addNewIndex = Object.keys(accounts).length;
			if (index === addNewIndex) {
				setShowAddNewAccount(true);
				if (actionSheetRef.current) {
					actionSheetRef.current.show();
				}
			} else {
				if (index === -1) {
					setIsLoggingOut(false);
				}
				let userIdKey = Object.keys(accounts)[index];
				if (userIdKey) {
					userIdKey = userIdKey.trim().toLowerCase();
					setSwitchingId(userIdKey);
					const {
						accessToken,
					} = accounts[userIdKey];

					dispatch(getUserProfile(accessToken, true)).then(() => {
						closeActionSheet(undefined, () => {
							// Timeout required to wait for the actions sheet modal to close compeletly. Else toast will disappear
							setTimeout(() => {
								dispatch(showToast(`You have switched to the account ${userProfile.email}`));
							}, 200);
						});
						setSwitchingId(null);
						dispatch(onSwitchAccount({
							userId: userIdKey,
						}));

						if (isLoggingOut) {
							dispatch(unregisterPushToken(pushToken));
							setIsLoggingOut(false);
							dispatch(logoutSelectedFromTelldus({
								userId,
							}));
						}
					}).catch((err: Object) => {
						closeActionSheet();
						setSwitchingId(null);
						setIsLoggingOut(false);
						toggleDialogueBoxState({
							show: true,
							showHeader: true,
							imageHeader: true,
							text: err.message || formatMessage(i18n.unknownError),
							showPositive: true,
						});
					});
				}
			}
		}
	}

	let ACCOUNTS = [];
	const disabledButtonIndexes = [];
	Object.keys(accounts).map((un: string, index: number) => {
		if (!showAddNewAccount) {
			disabledButtonIndexes.push(index);
		}
		const {
			email,
			firstname = '',
			lastname = '',
			accessToken = {},
		} = accounts[un];
		const nameInfo = `${firstname} ${lastname}\n(${email})`;

		let options = {
			email,
			parameters: { 'size': '200', 'd': 'mm' },
		};
		let avatar = gravatar.imageUrl(options);

		const uid = accessToken.userId || '';
		const isSelected = uid.trim().toLowerCase() === userId.trim().toLowerCase();

		function onPressRB() {
			if (isSelected) {
				return;
			}
			onSelectActionSheet(index);
		}
		if (isLoggingOut && isSelected) {
			return;
		}
		ACCOUNTS.push(
			<RippleButton onPress={onPressRB} style={actionSheetButtonAccCover}>
				<CachedImage
					resizeMode={'contain'}
					useQueryParamsInCacheKey={true}
					sourceImg={avatar}
					style={gravatarStyle}/>
				<Text style={actionSheetButtonAccText}>
					{nameInfo.trim()}
				</Text>
				{
					switchingId === uid.trim().toLowerCase() ?
						<Throbber
							throbberContainerStyle={throbberContainerStyle}
							throbberStyle={throbberStyle}/>
						:
						isLoggingOut ?
							<EmptyView/>
							:
							<RadioButtonInput
								isSelected={isSelected}
								buttonSize={rbSize}
								buttonOuterSize={rbOuterSize}
								borderWidth={3}
								buttonInnerColor={brandSecondary}
								buttonOuterColor={brandSecondary}
								onPress={onPressRB}
								obj={{userId: accessToken.userId}}
								index={index}/>
				}
			</RippleButton>
		);
	});

	const hasMultipleAccounts = Object.keys(accounts).length > 1;

	const moreButtons = isLoggingOut ? []
		:
		[<View style={actionSheetButtonAccCover}>
			<View style={addIconCoverStyle}>
				<Image source={{uri: 'icon_plus'}} style={addIconStyle}/>
			</View>
			<Text style={actionSheetButtonAccText}>
	Add Account
			</Text>
		</View>];

	return (
		<ScrollView style={container}>
			<View style={body}>
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
				<AddAccountBlock
					navigation={navigation}
					onPress={onPressAddAccount}/>
				<SubscriptionStatusBlock
					navigation={navigation}
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
				{isBasic && <PremiumInfoContent/>}
				{(isBasic && enable) && <UpgradePremiumButton
					navigation={navigation}/>}
				{enable && (
					<TouchableOpacity onPress={onPressViewPurchaseHistory} style={pHistoryCStyle}>
						<Text style={redeemTextSyle}>
							{formatMessage(i18n.viewPurchaseHistory)}
						</Text>
					</TouchableOpacity>
				)}
				<TouchableOpacity onPress={onPressRedeemGift}>
					<View style={redeemCoverStyle}>
						<IconTelldus icon={'gift'} style={redeemIconStyle}/>
						<Text style={redeemTextSyle}>
							{capitalize(formatMessage(i18n.redeemCard))}
						</Text>
					</View>
				</TouchableOpacity>
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
					label={`${formatMessage(i18n.labelLogOut)}`}
					postScript={` ${fn} ${ln}`}
					isLoggingOut={isLoggingOut}
				/>}
				<LogoutAllAccButton
					buttonAccessibleProp={true}
					toggleDialogueBox={toggleDialogueBox}
					label={hasMultipleAccounts ? 'Log out from all accounts' : formatMessage(i18n.labelLogOut)}
					isLoggingOut={isLoggingOut}
				/>
			</View>
			<ActionSheet
				ref={actionSheetRef}
				extraData={{
					showAddNewAccount,
					items: Object.keys(accounts),
					isLoggingOut,
				}}
				disabledButtonIndexes={disabledButtonIndexes}
				styles={{
					overlay: actionSheetOverlay,
					body: actionSheetOverlay,
					titleBox: actionSheetTitleBox,
					messageBox: actionSheetMessageBox,
					buttonBox: actionSheetButtonBox,
				}}
				title={showAddNewAccount ?
					<View style={actionSheetTitleCover}>
						<Text style={actionSheetTitle} onPress={closeActionSheet}>
							Add Account
						</Text>
					</View>
					:
					isLoggingOut ?
						<View style={actionSheetTitleCover}>
							<Text style={actionSheetTitle} onPress={closeActionSheet}>
							Choose account to switch to
							</Text>
						</View>
						:
						undefined
				}
				options={showAddNewAccount ?
					[
						<View style={actionSheetButtonOneCover}>
							<Text style={actionSheetButtonOne}>
							Log Into Existing Account
							</Text>
						</View>,
						<View style={actionSheetButtonTwoCover}>
							<Text style={actionSheetButtonTwo}>
						Create New Account
							</Text>
						</View>,
					]
					:
					[
						...ACCOUNTS,
						...moreButtons,
					]
				}
				onPress={onSelectActionSheet}/>
		</ScrollView>
	);
};

const getStyles = (appLayout: Object, {showAddNewAccount, isLoggingOut}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		brandSecondary,
		rowTextColor,
		eulaContentColor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const paddingEditNameBlock = Math.floor(deviceWidth * 0.045);

	const fontSize = Math.floor(deviceWidth * 0.045);
	const fontSizeActionSheetTitle = Math.floor(deviceWidth * 0.05);

	const addIconSize = Math.floor(deviceWidth * 0.07);
	const addIconCoverSize = addIconSize + 15;

	const butBoxHeight = (showAddNewAccount || isLoggingOut) ? (fontSize * 2.2) + (padding * 2) : addIconCoverSize * 2;
	const titleBoxHeight = (showAddNewAccount || isLoggingOut) ? (fontSizeActionSheetTitle * 3) + 8 : undefined;

	const rbOuterSize = Math.floor(deviceWidth * 0.055);
	const rbSize = rbOuterSize * 0.5;

	return {
		rbOuterSize,
		rbSize,
		brandSecondary,
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
			backgroundColor: Theme.Core.appBackground,
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
			color: Theme.Core.brandSecondary,
		},
		redeemIconStyle: {
			fontSize: fontSize,
			color: Theme.Core.brandSecondary,
			marginRight: 5,
		},
		actionSheetOverlay: {
			borderTopLeftRadius: 8,
			borderTopRightRadius: 8,
			overflow: 'hidden',
		},
		actionSheetTitleCover: {
			paddingHorizontal: padding,
		},
		actionSheetTitle: {
			fontSize: fontSizeActionSheetTitle,
			color: '#000',
		},
		actionSheetMessageBox: {
			height: undefined,
		},
		actionSheetButtonBox: {
			height: butBoxHeight,
			paddingHorizontal: padding,
			alignItems: 'stretch',
			justifyContent: 'center',
			backgroundColor: '#fff',
		},
		actionSheetTitleBox: {
			height: titleBoxHeight,
			marginBottom: StyleSheet.hairlineWidth,
		},
		actionSheetButtonOneCover: {
			flex: 1,
			backgroundColor: brandSecondary,
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: 8,
			marginTop: 8,
		},
		actionSheetButtonTwoCover: {
			flex: 1,
			alignItems: 'center',
			justifyContent: 'center',
		},
		actionSheetButtonOne: {
			fontSize,
			color: '#fff',
			textAlignVertical: 'center',
			textAlign: 'center',
		},
		actionSheetButtonTwo: {
			fontSize,
			color: brandSecondary,
			textAlignVertical: 'center',
			textAlign: 'center',
		},
		actionSheetButtonAccCover: {
			padding,
			flexDirection: 'row',
			alignItems: 'center',
		},
		actionSheetButtonAccText: {
			fontSize,
			color: '#000',
			textAlignVertical: 'center',
			textAlign: 'left',
			marginHorizontal: padding,
			flex: 1,
		},
		addIconCoverStyle: {
			borderRadius: addIconCoverSize / 2,
			height: addIconCoverSize,
			width: addIconCoverSize,
			borderWidth: 0.5,
			borderColor: rowTextColor,
			alignItems: 'center',
			justifyContent: 'center',
		},
		gravatarStyle: {
			borderRadius: addIconCoverSize / 2,
			height: addIconCoverSize,
			width: addIconCoverSize,
			borderWidth: 0.5,
			borderColor: rowTextColor,
		},
		addIconStyle: {
			height: addIconSize,
			width: addIconSize,
			tintColor: eulaContentColor,
		},
		throbberContainerStyle: {
			backgroundColor: 'transparent',
			position: 'relative',
		},
		throbberStyle: {
			fontSize: rbOuterSize,
			color: brandSecondary,
		},
	};
};

ProfileTab.navigationOptions = ({ navigation }: Object): Object => ({
	tabBarLabel: ({ tintColor }: Object): Object => (
		<TabBar
			icon="user"
			tintColor={tintColor}
			label={i18n.labelProfile}
			accessibilityLabel={i18n.labelAccessibleProfileTab}/>
	),
	tabBarOnPress: ({scene, jumpToIndex}: Object) => {
		navigation.navigate({
			routeName: 'ProfileTab',
			key: 'ProfileTab',
		});
	},
});

export default ProfileTab;
