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

import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import {
	TextField,
} from 'react-native-material-textfield';

import {
	View,
	NavigationHeaderPoster,
	Text,
	IconTelldus,
	TouchableButton,
} from '../../../BaseComponents';

import {
	activateCoupon,
} from '../../Actions/User';
import {
	showToast,
} from '../../Actions/App';
import {
	getUserProfile,
} from '../../Actions/Login';

import i18n from '../../Translations/common';

import Theme from '../../Theme';

const RedeemGiftScreen = (props: Object): Object => {
	const { navigation, screenProps } = props;
	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		container,
		body,
		textFieldStyle,
		iconStyle,
		titleStyleOne,
		bodyStyle,
		headerCover,
		labelStyle,
		titleStyleTwo,
		buttonStyle,
		textFieldCoverStyle,
		brandSecondary,
	} = getStyles(layout);

	const {
		formatMessage,
	} = useIntl();

	const [ code, setCode ] = useState('');
	function onChangeText(text: string) {
		setCode(text);
	}

	const dispatch = useDispatch();
	function onPress() {
		if (!code || code.trim() === '') {
			screenProps.toggleDialogueBox({
				show: true,
				showHeader: true,
				text: formatMessage(i18n.errorInvalidCode),
				showPositive: true,
				closeOnPressPositive: true,
			});
			return;
		}
		dispatch(activateCoupon(code)).then((response: Object) => {
			if (response && response.status === 'success') {
				dispatch(getUserProfile());
				navigation.navigate({
					routeName: 'PostPurchaseScreen',
					key: 'PostPurchaseScreen',
					params: {
						...response,
						voucher: true,
						success: true,
						screensToPop: 2,
					},
				});
			} else {
				dispatch(showToast(formatMessage(i18n.errorRedeemFailed)));
				dispatch(getUserProfile());
			}
		}).catch((err: Object) => {
			dispatch(showToast(err.message || formatMessage(i18n.errorRedeemFailed)));
			dispatch(getUserProfile());
		});
	}

	const headerArray = formatMessage(i18n.enterRedeemCode).split(' ');
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
				h1={formatMessage(i18n.redeemCard)} h2={formatMessage(i18n.applyVoucherCode)}
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
					<Text style={bodyStyle}>
						{formatMessage(i18n.infoVoucherCode)}
					</Text>
					<TextField
						value={code}
						label={formatMessage(i18n.labelVoucherCode)}
						labelTextStyle={labelStyle}
						baseColor={brandSecondary}
						tintColor={brandSecondary}
						style={textFieldStyle}
						containerStyle={textFieldCoverStyle}
						onChangeText={onChangeText}
						autoCorrect={false}
						autoFocus={true}
						returnKeyType={'done'}
						autoCapitalize={'characters'}
					/>
				</View>
				<TouchableButton
					onPress={onPress}
					text={formatMessage(i18n.labelRedeem)}
					accessibilityLabel={formatMessage(i18n.labelRedeem)}
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

	const fontSize = Math.floor(deviceWidth * 0.045);

	return {
		brandSecondary: Theme.Core.brandSecondary,
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
		textFieldCoverStyle: {
			width: '100%',
			marginTop: 5,
		},
		textFieldStyle: {
			fontSize: fontSize * 1.4,
			color: '#A59F9A',
		},
		bodyStyle: {
			fontSize,
			marginTop: 15,
			textAlign: 'center',
			color: Theme.Core.eulaContentColor,
		},
		titleStyleOne: {
			fontSize: fontSize * 1.2,
			color: Theme.Core.eulaContentColor,
			marginLeft: 5,
		},
		titleStyleTwo: {
			fontSize: fontSize * 1.2,
			color: Theme.Core.eulaContentColor,
			fontWeight: 'bold',
		},
		iconStyle: {
			fontSize: fontSize * 1.8,
			color: Theme.Core.twine,
		},
		labelStyle: {
			fontSize: fontSize,
			color: Theme.Core.brandSecondary,
		},
		buttonStyle: {
			marginVertical: fontSize / 2,
			paddingHorizontal: 10,
		},
	};
};

export default React.memo<Object>(RedeemGiftScreen);
