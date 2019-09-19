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
import { ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import {
	View,
	NavigationHeaderPoster,
	Text,
	IconTelldus,
	TouchableButton,
} from '../../../BaseComponents';
import {
	ViewPremiumBenefitsButton,
	AdditionalPlansPayments,
} from './SubViews';

import {
	getSubscriptionPlans,
	getPaymentOptions,
	capitalizeFirstLetterOfEachWord,
} from '../../Lib/appUtils';
import {
	createTransaction,
} from '../../Actions/User';
import {
	showToast,
} from '../../Actions/App';
import {
	getUserProfile,
} from '../../Actions/Login';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

const PremiumUpgradeScreen = (props: Object): Object => {
	const { navigation, screenProps } = props;
	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		container,
		body,
		headerCover,
		iconStyle,
		titleStyleOne,
		titleStyleTwo,
		pMonthTextStyle,
		annualChargeTextStyle,
		smsCreditTextStyle,
		prevChargeTextStyle,
		newChargeTextStyle,
		autoRenewInfoStyle,
		saveTextStyle,
		smsIconStyle,
		buttonStyle,
		cartIconStyle,
		linkTextStyle,
	} = getStyles(layout);

	const {
		formatMessage,
		formatNumber,
	} = useIntl();

	const index = 0;
	const {
		cPerMonth,
		smsCredit,
		save,
		prevTotal,
		newTotal,
	} = getSubscriptionPlans()[index];

	const dispatch = useDispatch();
	function onPress() {
		const product = getSubscriptionPlans()[index].product;
		const credits = getSubscriptionPlans()[index].smsCredit;
		const { name: paymentProvider } = getPaymentOptions(formatMessage)[index];
		const quantity = 1;
		const options = {
			product,
			quantity,
			subscription: 1,
			paymentProvider,
			returnUrl: 'telldus-live-mobile-common',
		};
		dispatch(createTransaction(options, true)).then((response: Object) => {
			if (response && response.id && response.url) {
				navigation.navigate({
					routeName: 'TransactionWebview',
					key: 'TransactionWebview',
					params: {
						uri: response.url,
						product,
						credits,
						quantity,
						voucher: false,
						screensToPop: 3,
					},
				});
			} else {
				dispatch(showToast(formatMessage(i18n.unknownError)));
				dispatch(getUserProfile());
			}
		}).catch((err: Object) => {
			dispatch(showToast(err.message || formatMessage(i18n.unknownError)));
			dispatch(getUserProfile());
		});
	}

	const headerArray = formatMessage(i18n.getMoreWithPremium).split(' ');
	const header = headerArray.map((word: string): Object => {
		if (word.includes('%')) {
			return (
				<Text style={titleStyleTwo}>
					{` ${word.replace(/%/g, '').toUpperCase()}`}
				</Text>
			);
		}
		return (
			<Text style={titleStyleOne}>
				{word.toUpperCase()}
			</Text>
		);
	});

	return (
		<View style={container}>
			<NavigationHeaderPoster
				h1={capitalizeFirstLetterOfEachWord(formatMessage(i18n.premiumAccess))}
				h2={formatMessage(i18n.getMoreFeaturesAndBenefits)}
				align={'right'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...screenProps}/>
			<ScrollView style={{flex: 1}} contentContainerStyle={{ flexGrow: 1 }}>
				<View style={body} >
					<View style={headerCover}>
						<IconTelldus icon={'premium'} style={iconStyle}/>
						{header}
					</View>
					<Text style={pMonthTextStyle}>
						{`€${formatNumber(cPerMonth, {
							minimumFractionDigits: cPerMonth === 3 ? 0 : 2,
						})}/${formatMessage(i18n.month)}`}
					</Text>
					<Text style={annualChargeTextStyle}>
						{formatMessage(i18n.billedAnnually, {
							value: `€${formatNumber(newTotal)}`,
						})}
					</Text>
					<View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
						<IconTelldus icon={'sms'} style={smsIconStyle}/>
						<Text style={smsCreditTextStyle}>
							{formatMessage(i18n.includingSMS, {
								value: smsCredit,
							})}
						</Text>
					</View>
					<View style={{flexDirection: 'row', alignItems: 'center', marginTop: 8}}>
						{!!prevTotal && <Text style={prevChargeTextStyle}>
							{`€${formatNumber(prevTotal)}`}
						</Text>}
						<Text style={newChargeTextStyle}>
							{`€${formatNumber(newTotal)} ${formatMessage(i18n.total)}`}
						</Text>
					</View>
					{!!save && <Text style={saveTextStyle}>
						{`${formatMessage(i18n.saveLabel).toUpperCase()} ${save}%`}
					</Text>}
					<Text style={autoRenewInfoStyle}>
						{formatMessage(i18n.automaticallyRenew)}
					</Text>
				</View>
				<TouchableButton
					onPress={onPress}
					preScript={<IconTelldus icon={'cart'} style={cartIconStyle}/>}
					text={formatMessage(i18n.upgradeNow)}
					accessibilityLabel={formatMessage(i18n.upgradeNow)}
					accessible={true}
					style={buttonStyle}
				/>
				<AdditionalPlansPayments
					navigation={navigation}
					button={false}
					linkTextStyle={linkTextStyle}/>
				<ViewPremiumBenefitsButton
					navigation={navigation}
					button={false}
					linkTextStyle={linkTextStyle}/>
			</ScrollView>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const padding = deviceWidth * Theme.Core.paddingFactor;

	const fontSize = Math.floor(deviceWidth * 0.036);

	return {
		container: {
			flex: 1,
			backgroundColor: Theme.Core.appBackground,
		},
		body: {
			flex: 0,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: '#fff',
			...Theme.Core.shadow,
			marginHorizontal: padding,
			marginVertical: padding * 2,
			padding: padding * 2,
		},
		headerCover: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
		},
		titleStyleOne: {
			fontSize: fontSize * 1.2,
			color: Theme.Core.eulaContentColor,
			marginLeft: 5,
		},
		titleStyleTwo: {
			fontSize: fontSize * 1.2,
			color: '#000',
			fontWeight: 'bold',
		},
		iconStyle: {
			fontSize: fontSize * 2,
			color: Theme.Core.twine,
		},
		pMonthTextStyle: {
			fontSize: fontSize * 2.6,
			color: Theme.Core.brandSecondary,
			marginTop: 20,
			fontWeight: 'bold',
			textAlign: 'center',
		},
		annualChargeTextStyle: {
			fontSize: fontSize * 1.3,
			color: Theme.Core.eulaContentColor,
			textAlign: 'center',
		},
		smsCreditTextStyle: {
			fontSize: fontSize * 0.9,
			color: Theme.Core.eulaContentColor,
			textAlign: 'center',
		},
		prevChargeTextStyle: {
			fontSize: fontSize * 1.2,
			color: Theme.Core.red,
			textAlign: 'center',
			textDecorationLine: 'line-through',
			textDecorationStyle: 'solid',
			textDecorationColor: Theme.Core.red,
		},
		newChargeTextStyle: {
			fontSize: fontSize * 1.2,
			color: Theme.Core.eulaContentColor,
			textAlign: 'center',
			marginLeft: 5,
		},
		saveTextStyle: {
			fontSize: fontSize * 0.8,
			color: '#fff',
			backgroundColor: Theme.Core.red,
			borderRadius: 4,
			paddingHorizontal: 5,
			paddingVertical: 2,
			marginTop: 5,
			textAlign: 'center',
		},
		autoRenewInfoStyle: {
			fontSize: fontSize * 0.8,
			color: Theme.Core.eulaContentColor,
			marginTop: 10,
			textAlign: 'center',
		},
		smsIconStyle: {
			fontSize: fontSize * 1.4,
			color: Theme.Core.twine,
			marginRight: 3,
		},
		buttonStyle: {
			marginTop: padding,
			paddingHorizontal: 10,
		},
		cartIconStyle: {
			fontSize: fontSize * 2.2,
			color: '#fff',
			marginRight: 7,
		},
		linkTextStyle: {
			marginTop: padding,
		},
	};
};

export default PremiumUpgradeScreen;
