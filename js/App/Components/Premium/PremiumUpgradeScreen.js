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
	useMemo,
	useCallback,
} from 'react';
import {
	ScrollView,
	Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
let dayjs = require('dayjs');
import RNIap, {
	IAPErrorCode,
} from 'react-native-iap';

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
	Footer,
} from './SubViews';
import {
	PrivacyPolicyLink,
	TermsOfService,
} from '../Profile/SubViews';

import {
	getSubscriptionPlans,
	getPaymentOptions,
	premiumAboutToExpire,
} from '../../Lib/appUtils';
import capitalize from '../../Lib/capitalize';
import {
	createTransaction,
	toggleVisibilityProExpireHeadsup,
	updateStatusIAPTransaction,
} from '../../Actions/User';
import {
	showToast,
} from '../../Actions/App';
import {
	getUserProfile,
} from '../../Actions/Login';
import {
	withInAppPurchaseListeners,
	useIAPSuccessFailureHandle,
} from '../../Hooks/IAP';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

const PremiumUpgradeScreen = (props: Object): Object => {
	const { navigation, screenProps } = props;
	const {
		layout,
	} = useSelector((state: Object): Object => state.app);
	const {
		subscriptions,
		userProfile,
		visibilityProExpireHeadsup,
		iapTransactionConfig = {},
		iapProducts = [],
	} = useSelector((state: Object): Object => state.user);
	const { pro } = userProfile;

	const isIos = Platform.OS === 'ios';

	const premAboutExpire = premiumAboutToExpire(subscriptions, pro) && !isIos;
	const isHeadsUp = visibilityProExpireHeadsup === 'show' && premAboutExpire;

	const {
		onGoing = false,
	} = iapTransactionConfig;

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
		footerHeight,
		expireNotifCover,
		expireNotifHeader,
		expireNotifContent,
		contentStyle,
		subsInfoCoverStyle,
	} = getStyles(layout, premAboutExpire);

	const {
		formatMessage,
		formatNumber,
		formatDate,
	} = useIntl();

	const index = isIos ? 2 : 0;
	const {
		cPerMonth,
		smsCredit,
		save,
		prevTotal,
		newTotal,
		product,
		productIdIap,
	} = getSubscriptionPlans()[index];

	let iapPrice;
	iapProducts.forEach((p: Object) => {
		if (productIdIap && p.productId === productIdIap) {
			iapPrice = p.localizedPrice;
		}
	});

	const dispatch = useDispatch();

	const {
		successCallback,
		errorCallback,
	} = useIAPSuccessFailureHandle();

	const _successCallback = useCallback((...data: Object) => {
		successCallback(...data).then(() => {
			navigation.pop();
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	let { clearListeners } = React.useMemo((): Object => {
		return withInAppPurchaseListeners({
			successCallback: _successCallback,
			errorCallback,
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	React.useEffect((): Function => {
		const didFocusSubscription = navigation.addListener(
			'focus',
			(payload: Object) => {
				if (!clearListeners) {
					const listenerData = withInAppPurchaseListeners({
						_successCallback,
						errorCallback,
					});
					// eslint-disable-next-line react-hooks/exhaustive-deps
					clearListeners = listenerData.clearListeners;
				}
			}
		);
		return () => {
			clearListenersIAP();
			didFocusSubscription();
		};
	}, [clearListeners, navigation]);

	async function requestIapSubscription(id: string) {
		try {
			dispatch(updateStatusIAPTransaction({
				onGoing: true,
			}));
			await RNIap.requestSubscription(id, false);
		} catch (err) {
			if (err.code && err.code === IAPErrorCode.E_USER_CANCELLED) {
				return;
			}
			dispatch(showToast(err.message || formatMessage(i18n.unknownError)));
		}
	}

	function onPress() {
		if (isIos) {
			requestIapSubscription(productIdIap);
		} else {
			const credits = smsCredit;
			const { name: paymentProvider } = getPaymentOptions(formatMessage)[0];
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
					navigation.navigate('TransactionWebview', {
						uri: response.url,
						product,
						credits,
						quantity,
						voucher: false,
						screensToPop: 3,
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
	}

	const headerArray = formatMessage(i18n.getMoreWithPremium).split(' ');
	const header = useMemo((): Array<Object> => {
		return headerArray.map((word: string, i: number): Object => {
			if (word.includes('%')) {
				return (
					<Text
						level={26}
						style={titleStyleTwo} key={`${i}`}>
						{` ${word.replace(/%/g, '')}`}
					</Text>
				);
			}
			return (
				<Text
					level={26}
					style={titleStyleOne} key={`${i}`}>
					{word}
				</Text>
			);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		headerArray,
		layout,
	]);

	function onPressGoBack(): boolean {
		dispatch(toggleVisibilityProExpireHeadsup('hide_temp'));
		navigation.pop();
		return true;
	}

	function clearListenersIAP() {
		if (clearListeners) {
			clearListeners();
			clearListeners = null;
		}
	}

	const {
		renewalText,
		smsCreditText,
	 } = React.useMemo((): Object => {
		if (isIos) {
			if (product === 'promonth') {
				return {
					renewalText: formatMessage(i18n.automaticallyRenewMonth),
					smsCreditText: formatMessage(i18n.includingSMSPM, {
						value: smsCredit,
					}),
				};
			}
		}
		return {
			renewalText: formatMessage(i18n.automaticallyRenew),
			smsCreditText: formatMessage(i18n.includingSMS, {
				value: smsCredit,
			}),
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [product, isIos, smsCredit]);

	const pricePerMon = isIos && iapPrice ? iapPrice : `€${formatNumber(cPerMonth, {
		minimumFractionDigits: cPerMonth === 3 ? 0 : 2,
	})}`;

	return (
		<View
			level={3}
			style={container}>
			<NavigationHeaderPoster
				h1={capitalize(formatMessage(i18n.premiumAccess))}
				h2={formatMessage(i18n.getMoreFeaturesAndBenefits)}
				align={'left'}
				showLeftIcon={true}
				leftIcon={'close'}
				goBack={onPressGoBack}
				handleBackPress={onPressGoBack}
				navigation={navigation}
				{...screenProps}/>
			<ScrollView style={{
				flex: 1,
				marginBottom: isHeadsUp ? footerHeight : 0,
			}} contentContainerStyle={{
				flexGrow: 1,
				paddingBottom: 20,
			}}>
				{premAboutExpire && <View
					level={2}
					style={expireNotifCover}>
					<Text
						level={23}
						style={expireNotifHeader}>
						{formatMessage(i18n.premExpireNofifHeader)}!
					</Text>
					<Text
						level={26}
						style={expireNotifContent}>
						{formatMessage(i18n.premExpireNofifContent, {
							expDate: formatDate(dayjs.unix(pro)),
						})}
					</Text>
				</View>
				}
				<View
					level={2}
					style={body} >
					<View style={headerCover}>
						<IconTelldus icon={'premium'} style={iconStyle}/>
						{header}
					</View>
					<Text
						level={23}
						style={pMonthTextStyle}>
						{`${pricePerMon}/${formatMessage(i18n.month)}`}
					</Text>
					{cPerMonth !== newTotal && <Text
						level={26}
						style={annualChargeTextStyle}>
						{formatMessage(i18n.billedAnnually, {
							value: `€${formatNumber(newTotal)}`,
						})}
					</Text>
					}
					<View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
						<IconTelldus icon={'sms'} style={smsIconStyle}/>
						<Text
							level={26}
							style={smsCreditTextStyle}>
							{smsCreditText}
						</Text>
					</View>
					<View style={{flexDirection: 'row', alignItems: 'center', marginTop: 8}}>
						{!!prevTotal && <Text style={prevChargeTextStyle}>
							{`€${formatNumber(prevTotal)}`}
						</Text>}
						{cPerMonth !== newTotal && <Text
							level={26}
							style={newChargeTextStyle}>
							{`€${formatNumber(newTotal)} ${formatMessage(i18n.total)}`}
						</Text>
						}
					</View>
					{!!save && <Text style={saveTextStyle}>
						{`${formatMessage(i18n.saveLabel)} ${save}%`}
					</Text>}
					<Text
						level={26}
						style={autoRenewInfoStyle}>
						{renewalText}
					</Text>
				</View>
				<TouchableButton
					onPress={onPress}
					preScript={<IconTelldus icon={'cart'} style={cartIconStyle}/>}
					text={formatMessage(i18n.upgradeNow)}
					accessibilityLabel={formatMessage(i18n.upgradeNow)}
					accessible={true}
					style={buttonStyle}
					showThrobber={onGoing}
					disabled={onGoing}
				/>
				{!isIos && <AdditionalPlansPayments
					navigation={navigation}
					button={false}
					linkTextStyle={linkTextStyle}
					onPressNavigate={clearListenersIAP}/>
				}
				<ViewPremiumBenefitsButton
					navigation={navigation}
					button={false}
					linkTextStyle={linkTextStyle}/>
				<View
					style={subsInfoCoverStyle}>
					<Text
						level={25}
						style={contentStyle}>
						{formatMessage(i18n.subscriptionAutoRenewInfo)}
					</Text>
					<TermsOfService/>
					<PrivacyPolicyLink/>
				</View>
			</ScrollView>
			{isHeadsUp && <Footer
				navigation={navigation}
				onPressPurchase={onPress}/>}
		</View>
	);
};

const getStyles = (appLayout: Object, premAboutExpire: boolean): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		shadow,
		paddingFactor,
		fontSizeFactorFour,
	} = Theme.Core;
	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * 0.036);

	const footerHeight = Theme.Core.getFooterHeight(deviceWidth);

	return {
		footerHeight,
		container: {
			flex: 1,
		},
		body: {
			flex: 0,
			alignItems: 'center',
			justifyContent: 'center',
			...shadow,
			marginHorizontal: padding,
			marginTop: premAboutExpire ? padding / 2 : padding * 2,
			padding: padding * 2,
			borderRadius: 2,
		},
		headerCover: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
		},
		titleStyleOne: {
			fontSize: fontSize * 1.2,
			marginLeft: 5,
		},
		titleStyleTwo: {
			fontSize: fontSize * 1.2,
			fontWeight: 'bold',
		},
		iconStyle: {
			fontSize: fontSize * 2,
			color: Theme.Core.twine,
		},
		pMonthTextStyle: {
			fontSize: fontSize * 2.6,
			marginTop: 20,
			fontWeight: 'bold',
			textAlign: 'center',
		},
		annualChargeTextStyle: {
			fontSize: fontSize * 1.3,
			textAlign: 'center',
		},
		smsCreditTextStyle: {
			fontSize: fontSize * 0.9,
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
			marginTop: 10,
			textAlign: 'center',
		},
		smsIconStyle: {
			fontSize: fontSize * 1.4,
			color: Theme.Core.twine,
			marginRight: 3,
		},
		buttonStyle: {
			paddingHorizontal: 10,
			marginTop: padding * 3,
			width: width * 0.7,
		},
		cartIconStyle: {
			fontSize: fontSize * 2.2,
			color: '#fff',
			marginRight: 7,
		},
		linkTextStyle: {
			marginTop: padding,
		},
		expireNotifCover: {
			...shadow,
			alignItems: 'center',
			justifyContent: 'center',
			padding: padding * 2,
			marginHorizontal: padding,
			marginTop: padding * 2,
			borderRadius: 2,
		},
		expireNotifHeader: {
			fontSize: fontSize * 1.7,
			textAlign: 'center',
		},
		expireNotifContent: {
			fontSize: fontSize * 1.1,
			marginTop: 5,
			textAlign: 'center',
		},
		contentStyle: {
			textAlign: 'center',
			fontSize: Math.floor(deviceWidth * fontSizeFactorFour),
			marginTop: 10,
			marginBottom: 5,
		},
		subsInfoCoverStyle: {
			marginHorizontal: padding,
			padding,
		},
	};
};

export default (React.memo<Object>(PremiumUpgradeScreen): Object);
