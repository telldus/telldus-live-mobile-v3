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
	useMemo,
} from 'react';
import { useSelector } from 'react-redux';
import {
	StyleSheet,
} from 'react-native';
import { useIntl } from 'react-intl';

import {
	Text,
	View,
	TouchableOpacity,
} from '../../../../BaseComponents';
import CARD from '../../TabViews/img/payment/payment-provider-card.svg';
import PAYPAL from '../../TabViews/img/payment/payment-provider-paypal.svg';
const PAYMENT_IMAGES = {
	CARD,
	PAYPAL,
};

import {
	withTheme,
} from '../../HOC/withTheme';

import {
	getPaymentOptions,
} from '../../../Lib/appUtils';
import capitalize from '../../../Lib/capitalize';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

const PaymentProvidersBlock = (props: Object): Object => {
	const { style, onSelect, colors } = props;
	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		coverStyle,
		labelStyle,
		contentCoverStyle,
		nameStyle,
		optionsCoverStyle,
		padding,
		innerCoverStyle,
		nameCoverStyle,
		imageWidth,
		imageHeight,
	} = getStyle(layout);

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const [ selectedIndex, setSeletedIndex ] = useState(0);

	const options = useMemo((): Object => {
		return getPaymentOptions(formatMessage).map((option: Object, key: number): Object => {
			const {
				name,
				image,
			} = option;

			function onSelectOption() {
				setSeletedIndex(key);
				onSelect(key, name);
			}

			const IMAGE = PAYMENT_IMAGES[image];

			return (
				<TouchableOpacity
					level={2}
					key={`${key}`}
					style={[contentCoverStyle, {
						marginLeft: (key % 2 === 0) ? 0 : padding / 2,
					}, selectedIndex === key ? {
						borderWidth: 3,
						borderColor: colors.textOnLevelThreeView,
					} : undefined]}
					onPress={onSelectOption}>
					<View style={innerCoverStyle}>
						<View style={nameCoverStyle}>
							<Text
								level={26}
								style={nameStyle}
								numberOfLines={1}>
								{capitalize(name)}
							</Text>
						</View>
						<IMAGE width={imageWidth} height={imageHeight}/>
					</View>
				</TouchableOpacity>
			);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		layout,
		selectedIndex,
	]);

	return (
		<View style={[coverStyle, style]}>
			<Text
				level={25}
				style={labelStyle}>
				{formatMessage(i18n.selectPaymentProvider)}
			</Text>
			<View style={optionsCoverStyle}>
				{options}
			</View>
		</View>
	);
};

const getStyle = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		fontSizeFactorFour,
		paddingFactor,
	} = Theme.Core;
	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorFour);

	const coverWidth = Math.floor((width - ((padding * 2) + (padding / 2))) / 2);
	const imageWidth = (coverWidth - (padding * 2)) * 0.7;

	return {
		padding,
		coverStyle: {
			width: '100%',
			marginTop: padding,
			alignSelf: 'center',
			alignItems: 'flex-start',
			justifyContent: 'center',
		},
		innerCoverStyle: {
			width: '100%',
			justifyContent: 'center',
			alignItems: 'center',
		},
		labelStyle: {
			fontSize: Math.floor(deviceWidth * 0.036) * 1.2,
			marginLeft: padding,
			marginTop: padding * 2,
			padding: 3,
		},
		optionsCoverStyle: {
			marginVertical: padding / 2,
			width: '100%',
			flexDirection: 'row',
			flexWrap: 'wrap',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingHorizontal: padding,
		},
		contentCoverStyle: {
			width: coverWidth,
			alignItems: 'center',
			justifyContent: 'center',
			...Theme.Core.shadow,
			padding,
			borderRadius: 2,
		},
		titleSyle: {
			color: Theme.Core.eulaContentColor,
			fontSize: deviceWidth * 0.06,
			fontWeight: 'bold',
		},
		contentStyle: {
			textAlign: 'center',
			color: Theme.Core.rowTextColor,
			fontSize,
			marginTop: 10,
		},
		iconStyle: {
			textAlign: 'center',
			color: Theme.Core.twine,
			fontSize,
		},
		nameCoverStyle: {
			width: '100%',
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: Theme.Core.rowTextColor,
			paddingBottom: 8,
			marginBottom: 5,
			alignItems: 'center',
			justifyContent: 'center',
		},
		nameStyle: {
			fontSize: fontSize * 1.2,
			textAlign: 'center',
			fontWeight: 'bold',
		},
		imageWidth,
		imageHeight: imageWidth * 0.43,
	};
};

export default (React.memo<Object>(withTheme(PaymentProvidersBlock)): Object);
