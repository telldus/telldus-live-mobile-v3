
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
	useCallback,
} from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
let dayjs = require('dayjs');

import {
	SettingsRow,
	Text,
	View,
	IconTelldus,
} from '../../../../BaseComponents';

import {
	capitalizeFirstLetterOfEachWord,
} from '../../../Lib/appUtils';

import i18n from '../../../Translations/common';

import Theme from '../../../Theme';

const SubscriptionStatusBlock = (props: Object): Object => {
	const {
		style,
		contentCoverStyle,
		valueCoverStyle,
		textFieldStyle,
		labelTextStyle,
		navigation,
		enable,
	} = props;

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const { layout } = useSelector((state: Object): Object => state.app);
	const { userProfile = {} } = useSelector((state: Object): Object => state.user);
	const { pro } = userProfile;

	const onPressUpgrade = useCallback(() => {
		navigation.navigate('PremiumUpgradeScreen');
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const {
		upgradeSyle,
		labelStyle,
		coverStyle,
		valueText,
		premIconStyle,
		valueCompCoverStyle,
	} = getStyle(layout);

	const isBasic = dayjs().unix() > pro;

	const accStatus = isBasic ? 'Basic' :
		<View style={valueCompCoverStyle}>
			<IconTelldus icon={'premium'} style={premIconStyle}/>
			<Text
				level={4}
				style={valueText}>{capitalizeFirstLetterOfEachWord(formatMessage(i18n.premiumAccess))}</Text>
		</View>;

	return (
		<View style={coverStyle}>
			<Text
				level={2}
				style={labelStyle}> {formatMessage(i18n.subscription)} </Text>
			<SettingsRow
				type={'text'}
				edit={false}
				inLineEditActive={false}
				label={formatMessage(i18n.subscription)}
				value={accStatus}
				appLayout={layout}
				iconValueRight={(isBasic && enable) ? <Text
					level={37}
					style={upgradeSyle}>{formatMessage(i18n.upgrade)}</Text> : null}
				onPress={false}
				onPressIconValueRight={isBasic ? onPressUpgrade : null}
				intl={intl}
				style={style}
				contentCoverStyle={contentCoverStyle}
				valueCoverStyle={valueCoverStyle}
				textFieldStyle={textFieldStyle}
				labelTextStyle={labelTextStyle}/>
		</View>
	);
};

const getStyle = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		twine,
		fontSizeFactorFour,
		fontSizeFactorEight,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const fontSize = deviceWidth * fontSizeFactorFour;

	return {
		coverStyle: {
			marginTop: padding,
		},
		upgradeSyle: {
			fontSize: deviceWidth * fontSizeFactorFour,
		},
		labelStyle: {
			fontSize: Math.floor(deviceWidth * fontSizeFactorEight),
		},
		valueText: {
			fontSize,
			textAlign: 'right',
			marginLeft: 5,
			textAlignVertical: 'center',
		},
		premIconStyle: {
			fontSize: fontSize * 1.3,
			color: twine,
			textAlignVertical: 'center',
			textAlign: 'right',
		},
		valueCompCoverStyle: {
			flex: 0,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'flex-end',
		},
	};
};

export default (React.memo<Object>(SubscriptionStatusBlock): Object);
