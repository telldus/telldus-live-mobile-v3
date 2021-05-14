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
import {
	TouchableOpacity,
} from 'react-native';
import { View, Text, IconTelldus } from '../../../../BaseComponents';

import {
	capitalize,
} from '../../../Lib';
import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

const TellStickExchangeLink = (props: Object): Object => {

	const {
		onPress,
		intl,
		appLayout,
		coverStyle,
		iconStyle,
		textStyle,
	} = props;

	const {
		coverStyleDef,
		iconStyleDef,
		textStyleDef,
	} = getStyles(appLayout);

	return (
		<TouchableOpacity onPress={onPress} disabled={!onPress}>
			<View style={[coverStyleDef, coverStyle]}>
				<IconTelldus
					level={23}
					icon="gift"
					style={[iconStyleDef, iconStyle]}/>
				<Text
					level={23}
					style={[textStyleDef, textStyle]}>
					{capitalize(intl.formatMessage(i18n.tellStickExchangeProgram)).trim()}!
				</Text>
			</View>
		</TouchableOpacity>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		fontSizeFactorFour,
	} = Theme.Core;

	let iconSize = Math.floor(deviceWidth * 0.06);
	iconSize = iconSize > 32 ? 32 : iconSize;

	let textSize = Math.floor(deviceWidth * fontSizeFactorFour);
	textSize = textSize > 28 ? 28 : textSize;

	return {
		coverStyleDef: {
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
		},
		iconStyleDef: {
			fontSize: iconSize,
		},
		textStyleDef: {
			marginLeft: 5,
			textAlignVertical: 'center',
			fontSize: textSize,
		},
	};
};

export default (React.memo<Object>(TellStickExchangeLink): Object);

