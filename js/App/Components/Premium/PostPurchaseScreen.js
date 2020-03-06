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
import { StackActions } from '@react-navigation/compat';

import {
	View,
	NavigationHeaderPoster,
	Text,
	IconTelldus,
	TouchableButton,
} from '../../../BaseComponents';

import {
	capitalizeFirstLetterOfEachWord,
} from '../../Lib/appUtils';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

const PostPurchaseScreen = (props: Object): Object => {
	const { navigation, screenProps } = props;
	const { app: {layout} } = useSelector((state: Object): Object => state);
	const {
		container,
		body,
		iconStyle,
		titleStyleOne,
		bodyStyle,
		buttonStyle,
		purchaseInfoCover,
		purchaseInfoIcon,
		purchaseInfoText,
	} = getStyles(layout);

	function onPress() {
		goBack();
	}

	const { formatMessage } = useIntl();
	function getInfo({product, quantity}: Object): Object {
		const postS = ` ${'Premium access'}`;
		switch (product) {
			case 'pro': {// TODO: check with Johannes
				const months = 1 * quantity;
				const preS = months === 1 ? `1 ${formatMessage(i18n.month)}` : formatMessage(i18n.months, {value: months});
				return preS + postS;
			}
			case 'promonth': {
				const months = 1 * quantity;
				const preS = months === 1 ? `1 ${formatMessage(i18n.month)}` : formatMessage(i18n.months, {value: months});
				return preS + postS;
			}
			case 'prohalfyear': {
				const months = 6 * quantity;
				const preS = months === 1 ? `1 ${formatMessage(i18n.month)}` : formatMessage(i18n.months, {value: months});
				return preS + postS;
			}
			case 'proyear': {
				const months = 12 * quantity;
				const preS = months === 1 ? `1 ${formatMessage(i18n.month)}` : formatMessage(i18n.months, {value: months});
				return preS + postS;
			}
			default: {
				const months = 1 * quantity;
				const preS = months === 1 ? `1 ${formatMessage(i18n.month)}` : formatMessage(i18n.months, {value: months});
				return preS + postS;
			}
		}
	}

	const screensToPop = navigation.getParam('screensToPop', 2);

	function goBack() {
		const popAction = StackActions.pop({
			n: screensToPop,
		});
		navigation.dispatch(popAction);
	}

	function onPressTryAgain() {
		const popAction = StackActions.pop({
			n: 2,
		});
		navigation.dispatch(popAction);
	}

	function onPressCancel() {
		const popAction = StackActions.pop({
			n: screensToPop,
		});
		navigation.dispatch(popAction);
	}

	const voucher = navigation.getParam('voucher', false);
	const product = navigation.getParam('product', null);
	const quantity = navigation.getParam('quantity', 1);
	const credits = navigation.getParam('credits', false);
	const success = navigation.getParam('success', false);

	const bodyText = !success ?
		formatMessage(i18n.paymentFailDescription)
		:
		voucher ?
			formatMessage(i18n.codeSuccessDescription)
			:
			formatMessage(i18n.paymentSuccessDescription);

	const title = !success ? formatMessage(i18n.couldNotCompletePurchase) :
		voucher ? formatMessage(i18n.thankYou)
			:
			formatMessage(i18n.purchaseThanks);

	return (
		<View style={container}>
			<NavigationHeaderPoster
				h1={voucher ? capitalizeFirstLetterOfEachWord(formatMessage(i18n.redeemCard)) : capitalizeFirstLetterOfEachWord('Premium access')}
				h2={voucher ? formatMessage(i18n.codeAccepted) : formatMessage(i18n.getMoreFeaturesAndBenefits)}
				align={'right'}
				showLeftIcon={!success}
				leftIcon={success ? undefined : 'close'}
				navigation={navigation}
				{...screenProps}
				handleBackPress={goBack}
				goBack={goBack}/>
			<ScrollView style={{flex: 1}} contentContainerStyle={{ flexGrow: 1 }}>
				<View style={body}>
					<IconTelldus icon={success ? 'premium' : 'info'} style={[iconStyle,
						 success ? { color: Theme.Core.twine } : { color: Theme.Core.brandDanger },
					]}/>
					<Text style={titleStyleOne}>
						{title}
					</Text>
					<Text style={bodyStyle}>
						{bodyText}
					</Text>
					{success &&
					<>
						{product !== 'credits' && <View style={purchaseInfoCover}>
							<IconTelldus icon={'premium'} style={purchaseInfoIcon}/>
							<Text style={purchaseInfoText}>
								{getInfo({product, quantity}).toUpperCase()}
							</Text>
						</View>
						}
						{!!credits && <View style={purchaseInfoCover}>
							<IconTelldus icon={'sms'} style={purchaseInfoIcon}/>
							<Text style={purchaseInfoText}>
								{`${credits} `}{formatMessage(i18n.smsCredits).toUpperCase()}
							</Text>
						</View>
						}
					</>
					}
				</View>
				{success ? <TouchableButton
					onPress={onPress}
					text={formatMessage(i18n.defaultPositiveText)}
					accessibilityLabel={formatMessage(i18n.defaultPositiveText)}
					accessible={true}
					style={buttonStyle}
				/>
					:
					<>
						<TouchableButton
							onPress={onPressTryAgain}
							text={formatMessage(i18n.tryAgain)}
							accessibilityLabel={formatMessage(i18n.tryAgain)}
							accessible={true}
							style={buttonStyle}
						/>
						<TouchableButton
							onPress={onPressCancel}
							text={formatMessage(i18n.defaultNegativeText)}
							accessibilityLabel={formatMessage(i18n.defaultNegativeText)}
							accessible={true}
							style={buttonStyle}
						/>
					</>
				}
			</ScrollView>
		</View>
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
			flex: 0,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: '#fff',
			...Theme.Core.shadow,
			marginHorizontal: padding,
			marginVertical: padding * 2,
			padding: padding * 2,
		},
		bodyStyle: {
			fontSize,
			marginTop: 15,
			textAlign: 'center',
			color: Theme.Core.eulaContentColor,
		},
		titleStyleOne: {
			fontSize: fontSize * 1.3,
			color: Theme.Core.eulaContentColor,
			marginTop: 10,
		},
		iconStyle: {
			fontSize: fontSize * 3.3,
		},
		buttonStyle: {
			marginVertical: fontSize / 2,
			paddingHorizontal: 10,
		},
		purchaseInfoCover: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			marginTop: 15,
		},
		purchaseInfoIcon: {
			fontSize: fontSize * 1.6,
			marginRight: 8,
			color: Theme.Core.twine,
		},
		purchaseInfoText: {
			fontSize,
			fontWeight: 'bold',
			color: Theme.Core.eulaContentColor,
		},
	};
};

export default React.memo<Object>(PostPurchaseScreen);
