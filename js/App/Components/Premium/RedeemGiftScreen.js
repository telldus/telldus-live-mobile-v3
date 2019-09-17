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
import { ScrollView, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

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

import Theme from '../../Theme';

const RedeemGiftScreen = (props: Object): Object => {
	const { navigation, screenProps } = props;
	const { app: {layout} } = useSelector((state: Object): Object => state);
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
	} = getStyles(layout);

	const [ code, setCode ] = useState('');
	function onChangeText(text: string) {
		setCode(text);
	}

	const dispatch = useDispatch();
	function onPress() {
		dispatch(activateCoupon(code)).then((response: Object) => {
			if (response && response.status === 'success') {
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
				dispatch(showToast('Sorry something went wrong. Please try later.'));
				dispatch(getUserProfile());
			}
		}).catch((err: Object) => {
			dispatch(showToast(err.message || 'Sorry something went wrong. Please try later.'));
			dispatch(getUserProfile());
		});
	}

	return (
		<View style={container}>
			<NavigationHeaderPoster
				h1={'Redeem Gift Card'} h2={'Apply voucher code'}
				align={'right'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...screenProps}/>
			<ScrollView style={{flex: 1}} contentContainerStyle={{ flexGrow: 1 }}>
				<View style={body} >
					<View style={headerCover}>
						<IconTelldus icon={'premium'} style={iconStyle}/>
						<Text style={titleStyleOne}>
							{'Enter'.toUpperCase()}
						</Text>
						<Text style={titleStyleTwo}>
							{' redeem code'.toUpperCase()}
						</Text>
					</View>
					<Text style={bodyStyle}>
                   Enter the code on your gift card/voucher below to redeem it:
					</Text>
					<Text style={labelStyle}>
                   Voucher code
					</Text>
					<TextInput
						value={code}
						style={textFieldStyle}
						onChangeText={onChangeText}
						autoCorrect={false}
						autoFocus={true}
						underlineColorAndroid={Theme.Core.brandSecondary}
						returnKeyType={'done'}
					/>
				</View>
				<TouchableButton
					onPress={onPress}
					text={'Redeem'}
					accessibilityLabel={'redeem'}
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
		textFieldStyle: {
			width: '100%',
			fontSize: fontSize * 1.4,
			marginTop: 5,
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
			color: '#000',
			fontWeight: 'bold',
		},
		iconStyle: {
			fontSize: fontSize * 1.8,
			color: Theme.Core.twine,
		},
		labelStyle: {
			marginTop: 15,
			fontSize: fontSize,
			color: Theme.Core.brandSecondary,
			alignSelf: 'flex-start',
		},
		buttonStyle: {
			marginVertical: fontSize / 2,
			paddingHorizontal: 10,
		},
	};
};

export default RedeemGiftScreen;
