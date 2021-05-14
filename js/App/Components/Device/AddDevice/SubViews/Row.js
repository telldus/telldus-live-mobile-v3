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
	StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';

import {
	View,
	Text,
	Image,
} from '../../../../../BaseComponents';

import Theme from '../../../../Theme';

const Row = (props: Object): Object => {
	const {
		img,
		name,
		isLast,
		onPress,
		rowProps,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		coverStyle,
		imgStyle,
		textStyle,
	} = getStyles(layout, isLast);

	function onPressRow() {
		if (onPress) {
			onPress({
				name,
				...rowProps,
			});
		}
	}

	return (
		<TouchableOpacity onPress={onPressRow}>
			<View
				level={2}
				style={coverStyle}>
				<Image source={img} style={imgStyle} resizeMode={'contain'}/>
				<Text
					level={26}
					style={textStyle}>
					{name}
				</Text>
			</View>
		</TouchableOpacity>
	);
};

const getStyles = (appLayout: Object, isLast: boolean): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		shadow,
		paddingFactor,
		eulaContentColor,
		fontSizeFactorEight,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const imageW = deviceWidth * 0.15;
	let imageH = deviceWidth * 0.12;
	let paddingVertical = padding / 2;
	const fontSize = deviceWidth * fontSizeFactorEight;

	const sdw = isLast ? shadow : {};

	return {
		coverStyle: {
			flexDirection: 'row',
			alignItems: 'center',
			width: width,
			borderTopWidth: StyleSheet.hairlineWidth,
			borderTopColor: eulaContentColor,
			paddingVertical,
			paddingHorizontal: padding * 2,
			...sdw,
			marginBottom: isLast ? padding : 0,
		},
		imgStyle: {
			height: imageH,
			width: imageW,
		},
		textStyle: {
			marginLeft: padding * 2,
			fontSize,
		},
	};
};

export default (React.memo<Object>(Row): Object);
