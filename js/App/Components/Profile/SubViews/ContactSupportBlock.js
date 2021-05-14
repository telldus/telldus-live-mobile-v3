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
	View,
	Text,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

const ContactSupportBlock = (props: Object): Object => {

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		coverOneStyle,
		titleStyle,
		bodyStyle,
		labelStyle,
	} = getStyles(layout);

	const {
		formatMessage,
	} = useIntl();

	return (
		<View>
			<Text
				style={labelStyle}
				level={2}>
				{formatMessage(i18n.labelContactSupport)}
			</Text>
			<View
				level={2}
				style={coverOneStyle}>
				<Text
					level={42}
					style={titleStyle}>
					{formatMessage(i18n.titleContactSupportBlock)}
				</Text>
				<Text
					style={bodyStyle}
					level={4}>
					{formatMessage(i18n.contentContactSupportBlock)}
				</Text>
			</View>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		fontSizeFactorFour,
		fontSizeFactorEight,
	} = Theme.Core;
	const fontSize = Math.floor(deviceWidth * fontSizeFactorFour);

	const padding = deviceWidth * paddingFactor;

	return {
		padding,
		coverOneStyle: {
			...shadow,
			justifyContent: 'center',
			alignItems: 'center',
			paddingHorizontal: padding,
			paddingVertical: padding * 2,
			marginTop: padding / 2,
		},
		labelStyle: {
			fontSize: Math.floor(deviceWidth * fontSizeFactorEight),
			marginTop: padding * 1.5,
		},
		titleStyle: {
			fontSize: fontSize * 1.2,
			textAlign: 'center',
		},
		bodyStyle: {
			fontSize,
			textAlign: 'center',
			marginTop: 10,
		},
	};
};

export default (React.memo<Object>(ContactSupportBlock): Object);
