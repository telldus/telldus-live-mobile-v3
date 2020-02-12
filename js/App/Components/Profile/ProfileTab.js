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
import { useSelector } from 'react-redux';
import moment from 'moment';

import {
	View,
	TabBar,
	IconTelldus,
	Text,
	ActionSheet,
} from '../../../BaseComponents';
import {
	UserInfoBlock,
	LogoutButton,
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
} from '../../Lib/appUtils';
import Theme from '../../Theme';

import AddAccountBlock from './SubViews/AddAccountBlock';

import i18n from '../../Translations/common';

const ProfileTab = (props: Object): Object => {
	const { screenProps: {
		toggleDialogueBox,
		intl,
	}, navigation } = props;
	const { layout } = useSelector((state: Object): Object => state.app);
	const { userProfile = {}, subscriptions = {} } = useSelector((state: Object): Object => state.user);
	const { pro } = userProfile;

	const actionSheetRef = React.useRef();

	function onPressRedeemGift() {
		navigation.navigate({
			routeName: 'RedeemGiftScreen',
			key: 'RedeemGiftScreen',
		});
	}

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
	} = getStyles(layout);

	let showAuto = isAutoRenew(subscriptions);
	const isBasic = moment().unix() > pro;

	function onPressViewPurchaseHistory() {
		navigation.navigate({
			routeName: 'PurchaseHistoryScreen',
			key: 'PurchaseHistoryScreen',
		});
	}

	function onPressAddAccount() {
		if (actionSheetRef.current) {
			actionSheetRef.current.show();
		}
	}

	function closeActionSheet() {
		if (actionSheetRef.current) {
			actionSheetRef.current.hide();
		}
	}

	function onSelectActionSheet(index: number) {
	}

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
				/>
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
				/>)}
				{isBasic && <PremiumInfoContent/>}
				{isBasic && <UpgradePremiumButton
					navigation={navigation}/>}
				<TouchableOpacity onPress={onPressViewPurchaseHistory} style={pHistoryCStyle}>
					<Text style={redeemTextSyle}>
						{formatMessage(i18n.viewPurchaseHistory)}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={onPressRedeemGift}>
					<View style={redeemCoverStyle}>
						<IconTelldus icon={'gift'} style={redeemIconStyle}/>
						<Text style={redeemTextSyle}>
							{formatMessage(i18n.redeemGiftCard)}
						</Text>
					</View>
				</TouchableOpacity>
				{!isBasic && (<SMSBlock
					navigation={navigation}
					contentCoverStyle={contentCoverStyleENB}
					valueCoverStyle={valueCoverStyleENB}
					textFieldStyle={textFieldStyleENB}
					labelTextStyle={labelTextStyleENB}
					style={style}/>
				)}
				{isBasic && <ViewPremiumBenefitsButton
					navigation={navigation}/>}
				<LogoutButton
					buttonAccessibleProp={true}
					toggleDialogueBox={toggleDialogueBox}
				/>
			</View>
			<ActionSheet
				ref={actionSheetRef}
				styles={{
					overlay: actionSheetOverlay,
					body: actionSheetOverlay,
					titleBox: actionSheetTitleBox,
					messageBox: actionSheetMessageBox,
					buttonBox: actionSheetButtonBox,
				}}
				title={
					<View style={actionSheetTitleCover}>
						<Text style={actionSheetTitle} onPress={closeActionSheet}>
							Add Account
						</Text>
					</View>
				}
				options={[
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
				]}
				onPress={onSelectActionSheet}/>
		</ScrollView>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		brandSecondary,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const paddingEditNameBlock = Math.floor(deviceWidth * 0.045);

	const fontSize = Math.floor(deviceWidth * 0.045);
	const fontSizeActionSheetTitle = Math.floor(deviceWidth * 0.05);

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
			height: (fontSize * 2.2) + (padding * 2),
			paddingHorizontal: padding,
			alignItems: 'stretch',
			justifyContent: 'center',
			backgroundColor: '#fff',
		},
		actionSheetTitleBox: {
			height: (fontSizeActionSheetTitle * 3) + 8,
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
