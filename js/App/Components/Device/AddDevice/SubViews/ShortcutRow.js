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

const ShortcutRow = (props: Object): Object => {
	const {
		img,
		name,
		onPress,
		rowProps,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		coverStyle,
		imgStyle,
		textStyle,
		textCoverStyle,
	} = getStyles(layout);

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
			<View style={coverStyle}>
				<Image source={img} style={imgStyle} resizeMode={'contain'}/>
				<View style={textCoverStyle}>
					<Text style={textStyle} numberOfLines={2}>
						{name}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		eulaContentColor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const fontSize = deviceWidth * 0.038;

	const imageSize = Math.floor((deviceWidth - (padding * 3)) / 3);
	const textCoverHeight = fontSize * 3;

	return {
		coverStyle: {
			alignItems: 'center',
			justifyContent: 'center',
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: eulaContentColor,
			marginLeft: padding / 2,
			marginTop: padding / 2,
			backgroundColor: '#fff',
			width: imageSize,
			borderRadius: 2,
		},
		imgStyle: {
			height: imageSize * 0.8,
			width: imageSize,
		},
		textCoverStyle: {
			height: textCoverHeight,
			alignItems: 'center',
			justifyContent: 'center',
		},
		textStyle: {
			color: eulaContentColor,
			margin: padding / 2,
			fontSize,
			flexWrap: 'wrap',
			textAlign: 'center',
		},
	};
};

export default ShortcutRow;
