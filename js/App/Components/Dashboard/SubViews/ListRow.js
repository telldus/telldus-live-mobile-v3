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
	Text,
	BlockIcon,
	TouchableOpacity,
	IconTelldus,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

type Props = {
    layout: Object,
    onPress: Function,
    rowData?: any,
    leftIcon?: string,
    rightIcon?: string,
	label?: string,
	coverStyle: Object,
	iconContainerStyle: Object,
	rightIconStyle: Object,
	textStyle: Object,
	leftIconStyle: Object,
};

const ListRow = memo<Object>((props: Props): Object => {
	const {
		layout,
		onPress,
		rowData,
		leftIcon,
		rightIcon,
		label,
		coverStyle,
		iconContainerStyle,
		rightIconStyle,
		textStyle,
		leftIconStyle,
	} = props;

	const {
		coverStyleDef,
		leftIconStyleDef,
		iconContainerStyleDef,
		textStyleDef,
		rightIconStyleDef,
	} = getStyles({layout});

	const _onPress = useCallback(() => {
		if (onPress) {
			onPress(rowData);
		}
	}, [onPress, rowData]);

	return (
		<TouchableOpacity
			level={2}
			onPress={_onPress}
			style={[coverStyleDef, coverStyle]}>
			{!!leftIcon && <BlockIcon
				blockLevel={15}
				iconLevel={46}
				icon={leftIcon}
				style={[leftIconStyleDef, leftIconStyle]}
				containerStyle={[iconContainerStyleDef, iconContainerStyle]}/>}
			{!!label && <Text
				level={25}
				style={[textStyleDef, textStyle]}>
				{label}
			</Text>}
			{!!rightIcon && <IconTelldus
				level={23}
				icon={rightIcon}
				style={[rightIconStyleDef, rightIconStyle]}/>}
		</TouchableOpacity>
	);
});

const getStyles = ({layout}: Object): Object => {

	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		maxSizeRowTextOne,
		fontSizeFactorOne,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	let nameFontSize = Math.floor(deviceWidth * fontSizeFactorOne);
	nameFontSize = nameFontSize > maxSizeRowTextOne ? maxSizeRowTextOne : nameFontSize;

	return {
		coverStyleDef: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginHorizontal: padding,
			marginBottom: padding / 2,
			padding,
			...shadow,
			borderRadius: 2,
		},
		leftIconStyleDef: {
			fontSize: 18,
		},
		textStyleDef: {
			flex: 1,
			marginLeft: 5,
			fontSize: nameFontSize,
		},
		iconContainerStyleDef: {
			borderRadius: 25,
			width: 25,
			height: 25,
			alignItems: 'center',
			justifyContent: 'center',
			marginHorizontal: 5,
		},
		rightIconStyleDef: {
			fontSize: 25,
			alignSelf: 'flex-end',
		},
	};
};

export default (ListRow: Object);
