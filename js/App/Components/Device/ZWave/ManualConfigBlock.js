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
	memo,
} from 'react';
import {
	useSelector,
} from 'react-redux';
import {
	Platform,
} from 'react-native';

import {
	Text,
	View,
	ThemedTextInput,
} from '../../../../BaseComponents';
import {
	useAppTheme,
} from '../../../Hooks/Theme';

import Theme from '../../../Theme';

const ManualConfigBlock = memo<Object>((props: Props): Object => {
	const {
		label,
		inputValue,
		onChangeText,
		onSubmitEditing,
	} = props;

	const {
		colors,
	} = useAppTheme();

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		hItemLabelDef,
		horizontalCover,
		leftBlock,
		rightBlock,
		textFieldStyle,
	} = getStyles({
		layout,
		colors,
	});

	return (
		<View style={horizontalCover}>
			<View style={leftBlock}>
				<Text
					level={3}
					style={hItemLabelDef}>
					{label}
				</Text>
			</View>
			<View style={rightBlock}>
				<ThemedTextInput
					level={23}
					value={inputValue}
					style={textFieldStyle}
					onChangeText={onChangeText}
					onSubmitEditing={onSubmitEditing}
					autoCorrect={false}
					autoFocus={false}
					returnKeyType={'done'}
					keyboardType={Platform.OS === 'ios' ? 'phone-pad' : 'decimal-pad'}
				/>
			</View>
		</View>
	);
});


const getStyles = ({
	layout,
	colors,
}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		fontSizeFactorEight,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);

	return {
		hItemLabelDef: {
			fontSize,
		},
		horizontalCover: {
			flexDirection: 'row',
			marginTop: padding,
			justifyContent: 'space-between',
		},
		leftBlock: {
			flexDirection: 'row',
			width: '60%',
			alignItems: 'center',
		},
		rightBlock: {
			flexDirection: 'row',
			width: '30%',
			alignItems: 'center',
			justifyContent: 'flex-end',
		},
		textFieldStyle: {
			width: '100%',
			paddingBottom: 0,
			paddingTop: 0,
			fontSize,
			textAlign: 'right',
			borderBottomWidth: 1,
			borderBottomColor: colors.inAppBrandSecondary,
		},
	};
};

export default ManualConfigBlock;
