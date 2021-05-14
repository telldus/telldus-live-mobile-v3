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
	Linking,
	Platform,
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
	cancelSubscription,
} from '../../Actions/User';
import {
	showToast,
} from '../../Actions/App';
import {
	getUserProfile,
} from '../../Actions/Login';
import {
	isPremiumBonus,
} from '../../Lib/appUtils';
import capitalize from '../../Lib/capitalize';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

const ManageSubscriptionScreen = (props: Object): Object => {
	const { navigation, screenProps } = props;
	const { toggleDialogueBox } = screenProps;
	const {layout} = useSelector((state: Object): Object => state.app);
	const { userProfile = {}, subscriptions = {} } = useSelector((state: Object): Object => state.user);
	const { credits } = userProfile;
	const {
		container,
		body,
		headerCover,
		iconStyle,
		titleStyleOne,
		titleStyleTwo,
		buttonStyle,
		contentOne,
		contentTwo,
	} = getStyles(layout);

	const {
		formatMessage,
	} = useIntl();

	const isPremBonusPeriod = isPremiumBonus(subscriptions);

	const dispatch = useDispatch();
	function onConfirm() {

		if (Platform.OS === 'ios') {
			const majorVersionIOS = parseInt(Platform.Version, 10);
			if (majorVersionIOS >= 12) {
				Linking.openURL('https://apps.apple.com/account/subscriptions');
			} else {
				Linking.openURL('https://buy.itunes.apple.com/WebObjects/MZFinance.woa/wa/manageSubscriptions');
			}
		} else {
			dispatch(cancelSubscription('premium')).then((response: Object) => {
				if (response && response.status === 'success') {
					dispatch(getUserProfile());
					navigation.goBack();
				} else {
					dispatch(showToast(formatMessage(i18n.unknownError)));
					dispatch(getUserProfile());
				}
			}).catch((err: Object) => {
				if (err.message === 'b9e1223e-4ea4-4cdf-97f7-0e23292ef40e') {
					dispatch(showToast(formatMessage(i18n.cancelSubscriptionErrorOne)));
				} else if (err.message === '91dedfc0-809d-4335-a1c6-2b5da68d0ad8') {
					dispatch(showToast(formatMessage(i18n.cancelSubscriptionErrorTwo)));
				} else {
					dispatch(showToast(err.message || formatMessage(i18n.unknownError)));
				}
				dispatch(getUserProfile());
			});
		}
	}

	function onPress() {
		const header = `${formatMessage(i18n.cancelAutoRenew)}?`;
		const text = formatMessage(i18n.cancelAutoRenewDescription);
		toggleDialogueBox({
			show: true,
			showHeader: true,
			header,
			text,
			showPositive: true,
			showNegative: true,
			positiveText: formatMessage(i18n.confirm),
			closeOnPressPositive: true,
			closeOnPressNegative: true,
			onPressPositive: onConfirm,
		});
	}

	const headerArray = formatMessage(i18n.premiumSubscription).split(' ');
	const header = headerArray.map((word: string, index: number): Object => {
		if (word.includes('%')) {
			return (
				<Text style={titleStyleOne} key={`${index}`}>
					{` ${word.replace(/%/g, '')} `}
				</Text>
			);
		}
		return (
			<Text style={titleStyleTwo} key={`${index}`}>
				{word}
			</Text>
		);
	});

	return (
		<View
			level={3}
			style={container}>
			<NavigationHeaderPoster
				h1={capitalize(formatMessage(i18n.premiumAccess))}
				h2={formatMessage(i18n.manageSubscription)}
				align={'left'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...screenProps}/>
			<ScrollView style={{flex: 1}} contentContainerStyle={{ flexGrow: 1 }}>
				<View
					level={2}
					style={body} >
					<View style={headerCover}>
						<IconTelldus icon={'premium'} style={iconStyle}/>
						{header}
					</View>
					<Text style={contentOne}>
						{formatMessage(i18n.manageSubscriptionDescription, {credits})}
					</Text>
					<Text style={contentTwo}>
						{formatMessage(i18n.autoRenewDescription)}
					</Text>
				</View>
				<TouchableButton
					onPress={onPress}
					text={formatMessage(i18n.cancelAutoRenew)}
					accessibilityLabel={formatMessage(i18n.cancelAutoRenew)}
					accessible={true}
					disabled={isPremBonusPeriod}
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
	const {
		fontSizeFactorEight,
	} = Theme.Core;
	const padding = deviceWidth * Theme.Core.paddingFactor;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);

	return {
		container: {
			flex: 1,
		},
		body: {
			flex: 0,
			alignItems: 'center',
			justifyContent: 'center',
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
			fontWeight: 'bold',
			marginLeft: 5,
		},
		titleStyleTwo: {
			fontSize: fontSize * 1.2,
			color: Theme.Core.eulaContentColor,
		},
		iconStyle: {
			fontSize: fontSize * 1.8,
			color: Theme.Core.twine,
		},
		buttonStyle: {
			marginVertical: fontSize / 2,
			paddingHorizontal: 10,
			width: deviceWidth * 0.7,
			maxWidth: width - (padding * 2),
		},
		contentOne: {
			fontSize: fontSize * 0.8,
			color: Theme.Core.eulaContentColor,
			fontWeight: 'bold',
			textAlign: 'center',
			marginTop: padding * 2,
		},
		contentTwo: {
			fontSize: fontSize * 0.8,
			color: Theme.Core.eulaContentColor,
			marginTop: padding * 2,
			textAlign: 'center',
		},
	};
};

export default (React.memo<Object>(ManageSubscriptionScreen): Object);
