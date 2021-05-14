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

import React, { useState, useCallback } from 'react';
import {
	ScrollView,
	StyleSheet,
	TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	NavigationHeaderPoster,
	Text,
	IconTelldus,
	TouchableButton,
} from '../../../BaseComponents';
import {
	PaymentProvidersBlock,
} from './SubViews';
import {
	withTheme,
} from '../HOC/withTheme';

import {
	getSMSPlans,
	getPaymentOptions,
} from '../../Lib/appUtils';
import capitalize from '../../Lib/capitalize';
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

const BuySMSCreditsScreen = (props: Object): Object => {
	const { navigation, screenProps, colors } = props;
	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		container,
		contentCover,
		headerCover,
		pMonthTextStyle,
		saveTextStyle,
		buttonStyle,
		cartIconStyle,
		labelStyle,
		premiumIconStyle,
		validityTextStyle,
		bottomCover,
		saveTextCoverStyle,
	} = getStyles(layout);
	const intl = useIntl();
	const {
		formatMessage,
		formatNumber,
	} = intl;

	const dispatch = useDispatch();

	const [ selectedIndex, setSeletedIndex ] = useState(0);
	const [ paymentProviderIndex, setPaymentProviderIndex ] = useState(0);

	const plans = getSMSPlans().map((item: Object, index: number): Object => {
		const {
			count,
			price,
			save,
		} = item;
		function onSelectPlan() {
			setSeletedIndex(index);
		}
		return (
			<TouchableOpacity onPress={onSelectPlan} key={`${index}`}>
				<View
					level={2}
					style={[contentCover,
						selectedIndex === index ? {
							borderWidth: 3,
							borderColor: colors.inAppBrandSecondary,
						} : undefined,
					]}>
					<View style={headerCover}>
						<IconTelldus icon={'sms'} style={premiumIconStyle}/>
						<Text
							level={26}
							style={validityTextStyle}>
							{`${count} ${formatMessage(i18n.smsCredits)}`}
						</Text>
					</View>
					<View style={bottomCover}>
						<Text
							level={23}
							style={pMonthTextStyle}>
							{`€${formatNumber(price)}`}
						</Text>
						<View style={saveTextCoverStyle}>
							{!!save && <Text style={saveTextStyle}>
								{`${formatMessage(i18n.saveLabel)} ${save}%`}
							</Text>
							}
						</View>
					</View>
				</View>
			</TouchableOpacity>
		);
	});

	const {
		name: paymentProvider,
	} = getPaymentOptions(formatMessage)[paymentProviderIndex];

	const onSelect = useCallback((index: number, provider: string) => {
		setPaymentProviderIndex(index);
	}, []);

	function onPress() {
		const product = 'credits';
		const {
			count,
		} = getSMSPlans()[selectedIndex];
		const options = {
			product,
			quantity: count,
			subscription: 0,
			paymentProvider,
			returnUrl: 'telldus-live-mobile-common',
		};
		dispatch(createTransaction(options, true)).then((response: Object) => {
			if (response && response.id && response.url) {
				navigation.navigate('TransactionWebview', {
					uri: response.url,
					product,
					credits: count,
					quantity: count,
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

	return (
		<View
			level={3}
			style={container}>
			<NavigationHeaderPoster
				h1={capitalize(formatMessage(i18n.premiumAccess))}
				h2={formatMessage(i18n.purchaseSMSCredits)}
				align={'left'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...screenProps}/>
			<ScrollView style={{flex: 1}} contentContainerStyle={{ flexGrow: 1 }}>
				<Text
					level={25}
					style={labelStyle}>{formatMessage(i18n.selectAmountOfCredits)}</Text>
				{plans}
				<PaymentProvidersBlock onSelect={onSelect}/>
				<TouchableButton
					onPress={onPress}
					preScript={<IconTelldus icon={'cart'} style={cartIconStyle}/>}
					text={formatMessage(i18n.purchaseNow)}
					accessibilityLabel={formatMessage(i18n.purchaseNow)}
					accessible={true}
					style={buttonStyle}
				/>
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
		},
		contentCover: {
			flex: 0,
			alignItems: 'center',
			justifyContent: 'center',
			...Theme.Core.shadow,
			marginHorizontal: padding,
			marginVertical: padding / 2,
			padding: padding * 2,
			borderRadius: 2,
		},
		labelStyle: {
			fontSize: fontSize * 1.2,
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
			marginLeft: 5,
		},
		premiumIconStyle: {
			fontSize: fontSize * 2.2,
			color: Theme.Core.twine,
		},
		pMonthTextStyle: {
			flex: 1,
			fontSize: fontSize * 2,
			fontWeight: 'bold',
			textAlign: 'right',
			alignSelf: 'center',
		},
		saveTextCoverStyle: {
			width: '50%',
			alignItems: 'flex-end',
			justifyContent: 'center',
		},
		saveTextStyle: {
			flex: 0,
			fontSize: fontSize * 0.7,
			color: '#fff',
			backgroundColor: Theme.Core.red,
			borderRadius: 4,
			paddingHorizontal: 5,
			paddingVertical: 2,
			textAlign: 'right',
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
		bottomCover: {
			width: '100%',
			flexDirection: 'row',
			alignItems: 'center',
			marginTop: 8,
			justifyContent: 'flex-end',
		},
	};
};

export default (React.memo<Object>(withTheme(BuySMSCreditsScreen)): Object);
