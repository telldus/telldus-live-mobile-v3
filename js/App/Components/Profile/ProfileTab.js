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
import { ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';

import {
	View,
	TabBar,
	IconTelldus,
	Text,
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
import Theme from '../../Theme';

import i18n from '../../Translations/common';

const ProfileTab = (props: Object): Object => {
	const { screenProps: {toggleDialogueBox}, navigation } = props;
	const { layout } = useSelector((state: Object): Object => state.app);
	const { userProfile = {}, subscriptions = {}, firebaseRemoteConfig = {} } = useSelector((state: Object): Object => state.user);
	const { pro } = userProfile;

	const { premiumPurchase = '{}'} = firebaseRemoteConfig;
	const { enable } = JSON.parse(premiumPurchase);


	function onPressRedeemGift() {
		navigation.navigate({
			routeName: 'RedeemGiftScreen',
			key: 'RedeemGiftScreen',
		});
	}

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
	} = getStyles(layout);

	let showAuto = false;
	Object.keys(subscriptions).map((key: string) => {
		const {
			product,
			status,
		} = subscriptions[key];
		showAuto = product === 'premium' && status === 'active';
	});
	const isBasic = moment().unix() > pro;

	function onPressViewPurchaseHistory() {
		navigation.navigate({
			routeName: 'PurchaseHistoryScreen',
			key: 'PurchaseHistoryScreen',
		});
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
							View purchase history
						</Text>
					</TouchableOpacity>
				)}
				<TouchableOpacity onPress={onPressRedeemGift}>
					<View style={redeemCoverStyle}>
						<IconTelldus icon={'gift'} style={redeemIconStyle}/>
						<Text style={redeemTextSyle}>
							Redeem gift card
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
				<LogoutButton
					buttonAccessibleProp={true}
					toggleDialogueBox={toggleDialogueBox}
				/>
			</View>
		</ScrollView>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const padding = deviceWidth * Theme.Core.paddingFactor;
	const paddingEditNameBlock = Math.floor(deviceWidth * 0.045);

	const fontSize = Math.floor(deviceWidth * 0.045);

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
