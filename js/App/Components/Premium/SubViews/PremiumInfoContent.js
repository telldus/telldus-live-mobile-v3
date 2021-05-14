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

import {
	IconTelldus,
	Text,
	View,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

const PremiumInfoContent = (props: Object): Object => {

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		coverStyle,
		contentStyle,
		titleSyle,
		iconStyle,
	} = getStyle(layout);

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	return (
		<View style={coverStyle}>
			<IconTelldus icon={'premium'} style={iconStyle}/>
			<Text
				level={26}
				style={titleSyle}>
				{formatMessage(i18n.premiumInfoTitle)}
			</Text>
			<Text
				level={25}
				style={contentStyle}>
				{formatMessage(i18n.premiumInfoDescription)}
			</Text>
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

	return {
		coverStyle: {
			marginTop: padding,
			alignSelf: 'center',
			alignItems: 'center',
			justifyContent: 'center',
			marginBottom: padding,
		},
		titleSyle: {
			fontSize: deviceWidth * 0.06,
			fontWeight: 'bold',
		},
		contentStyle: {
			textAlign: 'center',
			fontSize: Math.floor(deviceWidth * fontSizeFactorFour),
			marginTop: 10,
		},
		iconStyle: {
			textAlign: 'center',
			color: Theme.Core.twine,
			fontSize: Math.floor(deviceWidth * 0.2),
		},
	};
};

export default (React.memo<Object>(PremiumInfoContent): Object);
