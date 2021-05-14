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

import React, { useState, useMemo, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	NavigationHeaderPoster,
	Text,
	IconTelldus,
	TouchableButton,
	MaterialTextInput,
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
import capitalize from '../../Lib/capitalize';

import {
	withTheme,
} from '../HOC/withTheme';

import i18n from '../../Translations/common';

import Theme from '../../Theme';

const RedeemGiftScreen = (props: Object): Object => {
	const { navigation, screenProps, colors } = props;
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
	} = getStyles({
		layout,
		colors,
	});

	const {
		baseColorFour,
	} = colors;

	const {
		toggleDialogueBox,
	} = screenProps;

	const {
		formatMessage,
	} = useIntl();

	const [ code, setCode ] = useState('');
	const onChangeText = useCallback((text: string) => {
		setCode(text);
	}, []);

	const dispatch = useDispatch();
	const onPress = useCallback(() => {
		if (!code || code.trim() === '') {
			toggleDialogueBox({
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
				navigation.navigate('PostPurchaseScreen', {
					...response,
					voucher: true,
					success: true,
					screensToPop: 2,
				});
			} else {
				dispatch(showToast(formatMessage(i18n.errorRedeemFailed)));
				dispatch(getUserProfile());
			}
		}).catch((err: Object) => {
			dispatch(showToast(err.message || formatMessage(i18n.errorRedeemFailed)));
			dispatch(getUserProfile());
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [code]);

	const headerArray = formatMessage(i18n.enterRedeemCode).split(' ');
	const header = useMemo((): Array<Object> => {
		return headerArray.map((word: string): Object => {
			if (word.includes('%')) {
				return (
					<Text
						level={26}
						style={titleStyleTwo}>
						{` ${word.replace(/%/g, '')}`}
					</Text>
				);
			}
			return (
				<Text
					level={26}
					style={titleStyleOne}>
					{word}
				</Text>
			);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		headerArray,
		layout,
	]);

	return (
		<View
			level={3}
			style={container}>
			<NavigationHeaderPoster
				h1={capitalize(formatMessage(i18n.redeemCard))} h2={formatMessage(i18n.applyVoucherCode)}
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
					<Text
						level={26}
						style={bodyStyle}>
						{formatMessage(i18n.infoVoucherCode)}
					</Text>
					<MaterialTextInput
						value={code}
						label={formatMessage(i18n.labelVoucherCode)}
						labelTextStyle={labelStyle}
						baseColor={baseColorFour}
						tintColor={baseColorFour}
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

const getStyles = ({
	layout,
	colors,
}: Object): Object => {
	const { height, width } = layout;
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
			fontSize: fontSize * 1.8,
			color: Theme.Core.twine,
		},
		labelStyle: {
			fontSize: fontSize,
			color: colors.baseColorFour,
		},
		buttonStyle: {
			marginVertical: fontSize / 2,
			paddingHorizontal: 10,
		},
	};
};

export default (React.memo<Object>(withTheme(RedeemGiftScreen)): Object);
