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
	useCallback,
} from 'react';

import {
	TouchableOpacity,
	Text,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

type Props = {
    layout: Object,
    onPress: (string) => void,
    label: string,
	typeId: string,
	selected: boolean,
};

const TypeBlock = memo<Object>((props: Props): Object => {

	const {
		layout,
		onPress,
		label,
		typeId,
		selected,
	} = props;

	const {
		boxStyle,
		textStyle,
	} = getStyles({layout, selected});

	const _onPress = useCallback(() => {
		if (onPress) {
			onPress(typeId);
		}
	}, [onPress, typeId]);

	return (
		<TouchableOpacity
			style={boxStyle}
			onPress={_onPress}>
			<Text
				style={textStyle}>
				{label.toUpperCase()}
			</Text>
		</TouchableOpacity>
	);
});

const getStyles = ({layout, selected}: Object): Object => {

	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		brandSecondary,
		fontSizeFactorFour,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorFour);

	return {
		boxStyle: {
			marginLeft: padding / 2,
			width: (width - (padding * 2.5)) / 2,
			...shadow,
			backgroundColor: selected ? brandSecondary : '#fff',
			padding: padding * 3,
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: 2,
			marginTop: padding / 2,
		},
		textStyle: {
			fontSize: fontSize * 1.2,
			color: selected ? '#fff' : brandSecondary,
			textAlign: 'center',
			fontWeight: '500',
		},
	};
};

export default (TypeBlock: Object);
