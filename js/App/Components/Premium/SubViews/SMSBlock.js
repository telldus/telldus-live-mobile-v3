
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
import {
	Platform,
} from 'react-native';

import {
	SettingsRow,
	Text,
	View,
} from '../../../../BaseComponents';

import {
	capitalizeFirstLetterOfEachWord,
} from '../../../Lib/appUtils';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

const SMSBlock = (props: Object): Object => {
	const {
		style,
		contentCoverStyle,
		valueCoverStyle,
		textFieldStyle,
		labelTextStyle,
		navigation,
		enablePurchase,
	} = props;

	const isIos = Platform.OS === 'ios';

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const { layout } = useSelector((state: Object): Object => state.app);
	const { userProfile = {} } = useSelector((state: Object): Object => state.user);
	const { credits = 0 } = userProfile;

	const onPressViewHistory = useCallback(() => {
		navigation.navigate('SMSHistoryScreen');
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onPressBuyCredits = useCallback(() => {
		navigation.navigate('BuySMSCreditsScreen');
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const {
		coverStyle,
		linkTextStyle,
		buyCreditsStyle,
	} = getStyle(layout);

	return (
		<>
			<View style={coverStyle}>
				<SettingsRow
					type={'text'}
					edit={false}
					inLineEditActive={false}
					label={formatMessage(i18n.smsCredits)}
					value={`${credits}`}
					appLayout={layout}
					iconValueRight={
						(enablePurchase && !isIos) ?
							<Text
								level={37}
								style={buyCreditsStyle}>
								{capitalizeFirstLetterOfEachWord(formatMessage(i18n.buyCredits))}
							</Text>
							:
							undefined
					}
					onPressIconValueRight={(enablePurchase && !isIos) ? onPressBuyCredits : undefined}
					onPress={false}
					intl={intl}
					style={style}
					contentCoverStyle={contentCoverStyle}
					valueCoverStyle={valueCoverStyle}
					textFieldStyle={textFieldStyle}
					labelTextStyle={labelTextStyle}/>
			</View>
			<Text
				level={36}
				style={linkTextStyle}
				onPress={onPressViewHistory}>{formatMessage(i18n.viewSMSHistory)}</Text>
		</>
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
	const fontSize = deviceWidth * fontSizeFactorFour;

	return {
		coverStyle: {
			marginTop: padding,
		},
		linkTextStyle: {
			marginTop: padding / 2,
			alignSelf: 'center',
			fontSize: fontSize * 0.9,
			textAlignVertical: 'center',
			textAlign: 'center',
			padding: 5,
		},
		buyCreditsStyle: {
			fontSize: deviceWidth * fontSizeFactorFour,
		},
	};
};

export default (React.memo<Object>(SMSBlock): Object);
