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
	useState,
	useCallback,
} from 'react';
import {
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import RNIap from 'react-native-iap';
import { StackActions } from 'react-navigation';// TODO: Update import in 3.15

import {
	View,
	NavigationHeaderPoster,
	Text,
	IconTelldus,
	TouchableButton,
	CheckBoxIconText,
} from '../../../BaseComponents';
import {
	PaymentProvidersBlock,
	Footer,
} from './SubViews';

import {
	getSubscriptionPlans,
	getPaymentOptions,
	capitalizeFirstLetterOfEachWord,
	premiumAboutToExpire,
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

import {
	withInAppPurchaseListeners,
	useIAPSuccessFailureHandle,
} from '../../Hooks/IAP';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

const AdditionalPlansPaymentsScreen = (props: Object): Object => {
	const { navigation, screenProps } = props;
	const {
		layout,
	} = useSelector((state: Object): Object => state.app);
	const {
		subscriptions,
		userProfile,
		visibilityProExpireHeadsup,
		iapTransactionConfig = {},
	} = useSelector((state: Object): Object => state.user);

	const { pro } = userProfile;

	const premAboutExpire = premiumAboutToExpire(subscriptions, pro);
	const isHeadsUp = visibilityProExpireHeadsup === 'show' && premAboutExpire;

	const {
		onGoing = false,
	} = iapTransactionConfig;

	const {
		container,
		contentCover,
		headerCover,
		pMonthTextStyle,
		smsCreditTextStyle,
		prevChargeTextStyle,
		newChargeTextStyle,
		saveTextStyle,
		smsIconStyle,
		buttonStyle,
		cartIconStyle,
		labelStyle,
		premiumIconStyle,
		validityTextStyle,
		checkButtonStyle,
		textStyle,
		backLinkStyle,
		infoContainer,
		infoTextStyle,
		statusIconStyle,
		footerHeight,
	} = getStyles(layout);
	const intl = useIntl();
	const {
		formatMessage,
		formatNumber,
	} = intl;

	const dispatch = useDispatch();

	const [ recurring, setRecurring ] = useState(true);
	const [ selectedIndex, setSeletedIndex ] = useState(0);
	const [ paymentProviderIndex, setPaymentProviderIndex ] = useState(0);

	function onChangeRecurring() {
		setRecurring(!recurring);
	}

	const plans = getSubscriptionPlans().map((item: Object, index: number): Object => {
		const {
			validity,
			cPerMonth,
			smsCredit,
			save,
			prevTotal,
			newTotal,
		} = item;
		function onSelectPlan() {
			setSeletedIndex(index);
		}
		return (
			<TouchableOpacity onPress={onSelectPlan} key={`${index}`}>
				<View style={[contentCover,
					selectedIndex === index ? {
						borderWidth: 3,
						borderColor: Theme.Core.brandSecondary,
					} : undefined,
				]}>
					<View style={headerCover}>
						<IconTelldus icon={'premium'} style={premiumIconStyle}/>
						<Text style={validityTextStyle}>
							{validity === 1 ? `${validity} ${formatMessage(i18n.month)}` : `${formatMessage(i18n.months, {value: validity})}`}
						</Text>
					</View>
					<Text style={pMonthTextStyle}>
						{`€${formatNumber(cPerMonth, {
							minimumFractionDigits: cPerMonth === 3 ? 0 : 2,
						})}/${formatMessage(i18n.month)}`}
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
						{!!save && <Text style={saveTextStyle}>
							{`${formatMessage(i18n.saveLabel).toUpperCase()} ${save}%`}
						</Text>}
						{!!prevTotal && <Text style={prevChargeTextStyle}>
							{`€${formatNumber(prevTotal)}`}
						</Text>}
						<Text style={newChargeTextStyle}>
							{`€${formatNumber(newTotal)} ${formatMessage(i18n.total)}`}
						</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	});

	const {
		name: paymentProvider,
		supportAutoRenew,
	} = getPaymentOptions(formatMessage)[paymentProviderIndex];

	const onSelect = useCallback((index: number, provider: string) => {
		setPaymentProviderIndex(index);
	}, []);

	const {
		successCallback,
		errorCallback,
	} = useIAPSuccessFailureHandle();

	const _successCallback = useCallback((...data: Object) => {
		successCallback(...data).then(() => {
			const popAction = StackActions.pop({
				n: 2,
			});
			navigation.dispatch(popAction);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	React.useEffect((): Function => {
		const { clearListeners } = withInAppPurchaseListeners({
			successCallback: _successCallback,
			errorCallback,
		});
		return clearListeners;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function requestIapSubscription(id: string) {
		try {
			await RNIap.requestSubscription(id, false);
		} catch (err) {
			dispatch(showToast(err.message || formatMessage(i18n.unknownError)));
		}
	}

	function onPress() {
		if (onGoing) {
			return;
		}

		const {
			product,
			smsCredit: credits,
		} = getSubscriptionPlans()[selectedIndex];
		const quantity = 1;
		const options = {
			product,
			quantity,
			subscription: recurring && supportAutoRenew ? 1 : 0,
			paymentProvider,
			returnUrl: 'telldus-live-mobile-common',
		};

		if (Platform.OS === 'ios') {
			requestIapSubscription(product);
		} else {
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
							screensToPop: 4,
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
	}

	function onGoBack() {
		navigation.goBack();
	}

	const showInfo = !recurring || !supportAutoRenew;

	return (
		<View style={container}>
			<NavigationHeaderPoster
				h1={capitalizeFirstLetterOfEachWord('Premium access')}
				h2={formatMessage(i18n.getMoreFeaturesAndBenefits)}
				align={'right'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...screenProps}/>
			<ScrollView style={{
				flex: 1,
				marginBottom: isHeadsUp ? footerHeight : 0,
			}} contentContainerStyle={{
				flexGrow: 1,
				paddingBottom: 20,
			}}>
				<Text style={labelStyle}>{formatMessage(i18n.selectSubscriptionPlan)}</Text>
				{plans}
				<PaymentProvidersBlock onSelect={onSelect}/>
				{supportAutoRenew && <CheckBoxIconText
					style={checkButtonStyle}
					onToggleCheckBox={onChangeRecurring}
					isChecked={recurring}
					text={formatMessage(i18n.renewAnnually)}
					intl={intl}
					textStyle={textStyle}
					iconStyle={recurring ?
						{
							color: '#fff',
							backgroundColor: Theme.Core.brandSecondary,
							borderColor: Theme.Core.brandSecondary,
						}
						:
						{
							color: 'transparent',
							backgroundColor: 'transparent',
							borderColor: Theme.Core.brandSecondary,
						}
					}
				/>
				}
				{showInfo && <View style={infoContainer}>
					<IconTelldus icon={'info'} style={statusIconStyle}/>
					<Text style={infoTextStyle}>
						{!supportAutoRenew ?
							formatMessage(i18n.autoRenewNotSupportedDescription)
							:
							formatMessage(i18n.autoRenewDisabledDescription)
						}
					</Text>
				</View>
				}
				<TouchableButton
					onPress={onPress}
					preScript={<IconTelldus icon={'cart'} style={cartIconStyle}/>}
					text={formatMessage(i18n.upgradeNow)}
					accessibilityLabel={formatMessage(i18n.upgradeNow)}
					accessible={true}
					style={buttonStyle}
					disabled={onGoing}
				/>
				<Text style={backLinkStyle} onPress={onGoBack}>{capitalizeFirstLetterOfEachWord(formatMessage(i18n.backLabel))}</Text>
			</ScrollView>
			{isHeadsUp && <Footer
				navigation={navigation}
				onPressPurchase={onPress}/>}
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const padding = deviceWidth * Theme.Core.paddingFactor;

	const fontSize = Math.floor(deviceWidth * 0.036);

	let footerHeight = Math.floor(deviceWidth * 0.26);
	footerHeight = footerHeight > 100 ? 100 : footerHeight;

	return {
		footerHeight,
		container: {
			flex: 1,
			backgroundColor: Theme.Core.appBackground,
		},
		contentCover: {
			flex: 0,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: '#fff',
			...Theme.Core.shadow,
			marginHorizontal: padding,
			marginVertical: padding / 2,
			padding: padding * 2,
			borderRadius: 2,
		},
		labelStyle: {
			fontSize: fontSize * 1.2,
			color: Theme.Core.rowTextColor,
			marginLeft: padding,
			marginTop: padding * 2,
			padding: 3,
		},
		headerCover: {
			width: '100%',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			paddingBottom: 8,
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: Theme.Core.rowTextColor,
		},
		validityTextStyle: {
			fontSize: fontSize * 1.7,
			color: Theme.Core.eulaContentColor,
			marginLeft: 5,
		},
		premiumIconStyle: {
			fontSize: fontSize * 2.2,
			color: Theme.Core.twine,
		},
		pMonthTextStyle: {
			fontSize: fontSize * 2,
			color: Theme.Core.brandSecondary,
			marginTop: 8,
			fontWeight: 'bold',
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
			marginLeft: 8,
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
		smsIconStyle: {
			fontSize: fontSize * 1.4,
			color: Theme.Core.twine,
			marginRight: 3,
		},
		buttonStyle: {
			marginVertical: fontSize / 2,
			paddingHorizontal: 10,
		},
		cartIconStyle: {
			fontSize: fontSize * 2.2,
			color: '#fff',
			marginRight: 7,
		},
		textStyle: {
			fontSize: Math.floor(deviceWidth * 0.045),
			color: Theme.Core.brandSecondary,
		},
		checkButtonStyle: {
			marginVertical: padding,
		},
		backLinkStyle: {
			fontSize: Math.floor(deviceWidth * 0.045),
			alignSelf: 'center',
			color: Theme.Core.brandSecondary,
			padding: 10,
			marginVertical: padding,
		},
		infoContainer: {
			flex: 1,
			flexDirection: 'row',
			marginTop: padding / 2,
			marginHorizontal: padding,
			marginBottom: padding,
			padding,
			backgroundColor: '#fff',
			...Theme.Core.shadow,
			alignItems: 'center',
			justifyContent: 'space-between',
			borderRadius: 2,
		},
		statusIconStyle: {
			fontSize: deviceWidth * 0.16,
			color: Theme.Core.brandSecondary,
		},
		infoTextStyle: {
			flex: 1,
			fontSize: Theme.Core.infoTextFontSize,
			color: Theme.Core.eulaContentColor,
			flexWrap: 'wrap',
			marginLeft: padding,
		},
	};
};

export default React.memo<Object>(AdditionalPlansPaymentsScreen);
