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
 */

// @flow

'use strict';
import React, {
	memo,
} from 'react';
import { useIntl } from 'react-intl';

import {
	View,
	Text,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

const EditDbListSection = memo<Object>((props: Object): Object => {
	const {
		layout,
		header,
	} = props;

	const {
		coverStyle,
		textStyle,
	} = getStyles({layout});

	const {
		formatMessage,
	} = useIntl();

	return (
		<View
			level={2}
			style={coverStyle}>
			<Text
				level={2}
				style={textStyle}>
				{header || formatMessage(i18n.noName)}
			</Text>
		</View>
	);
});

const getStyles = ({layout}: Object): Object => {

	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		fontSizeFactorFive,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	let statusInfoSize = Math.floor(deviceWidth * fontSizeFactorFive);
	statusInfoSize = statusInfoSize > 28 ? 28 : statusInfoSize;

	return {
		coverStyle: {
			marginTop: padding,
			marginBottom: padding / 2,
			...shadow,
			paddingVertical: padding / 2,
		},
		textStyle: {
			marginLeft: padding,
			fontSize: statusInfoSize,
		},
	};
};

export default (EditDbListSection: Object);
