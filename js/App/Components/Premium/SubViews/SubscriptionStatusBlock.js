
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
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import moment from 'moment';

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

	function onPressUpgrade() {
		navigation.navigate('PremiumUpgradeScreen');
	}

	const {
		upgradeSyle,
		labelStyle,
		coverStyle,
		valueText,
		premIconStyle,
		valueCompCoverStyle,
	} = getStyle(layout);

	const isBasic = moment().unix() > pro;

	const accStatus = isBasic ? 'Basic' :
		<View style={valueCompCoverStyle}>
			<IconTelldus icon={'premium'} style={premIconStyle}/>
			<Text style={valueText}>{capitalizeFirstLetterOfEachWord('Premium access')}</Text>
		</View>;

	return (
		<View style={coverStyle}>
			<Text style={labelStyle}> {formatMessage(i18n.subscription)} </Text>
			<SettingsRow
				type={'text'}
				edit={false}
				inLineEditActive={false}
				label={formatMessage(i18n.subscription)}
				value={accStatus}
				appLayout={layout}
				iconValueRight={(isBasic && enable) ? <Text style={upgradeSyle}>{formatMessage(i18n.upgrade)}</Text> : null}
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
		subHeader,
		paddingFactor,
		brandSecondary,
		rowTextColor,
		twine,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const fontSize = deviceWidth * 0.04;

	return {
		coverStyle: {
			marginTop: padding,
		},
		upgradeSyle: {
			color: brandSecondary,
			fontSize: deviceWidth * 0.04,
		},
		labelStyle: {
			color: subHeader,
			fontSize: Math.floor(deviceWidth * 0.045),
		},
		valueText: {
			fontSize,
			color: rowTextColor,
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

export default React.memo<Object>(SubscriptionStatusBlock);
