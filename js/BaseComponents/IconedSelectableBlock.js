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
import {
	useSelector,
} from 'react-redux';

import RippleButton from './RippleButton';
import View from './View';
import Text from './Text';
import IconTelldus from './IconTelldus';
import ThemedMaterialIcon from './ThemedMaterialIcon';

import {
	useAppTheme,
} from '../App/Hooks/Theme';
import Theme from '../App/Theme';

type Props = {
    icon?: string,
    h1?: string,
    h2?: string,
    renderIcon?: Function,
    onPress?: Function,
    onPressData?: any,
    enabled?: boolean,
    coverStyle?: Object,
    h1CoverStyle?: Object,
    h2CoverStyle?: Object,
    arrowStyle?: Object,
};

const IconedSelectableBlock = (props: Props): Object => {
	const {
		icon,
		h1,
		h2,
		renderIcon,
		onPress,
		onPressData,
		enabled,
		coverStyle,
		h1CoverStyle,
		h2CoverStyle,
		arrowStyle,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		colors,
	} = useAppTheme();

	const {
		coverStyleDef,
		leftIconStyle,
		headersCoverStyle,
		h1CoverStyleDef,
		h2CoverStyleDef,
		leftBlockCoverStyle,
		arrowStyleDef,
	} = getStyles({
		layout,
		colors,
		enabled,
	});

	const _icon = typeof renderIcon === 'function' ? renderIcon() : undefined;

	return (
		<RippleButton
			style={{flex: 0}}
			onPress={onPress}
			onPressData={onPressData}>
			<View style={[coverStyleDef, coverStyle]}>
				{!!icon && (
					<View
						style={leftBlockCoverStyle}>
						<IconTelldus
							icon={icon}
							style={leftIconStyle}/>
					</View>
				)}
				{!!_icon && _icon}
				<View style={headersCoverStyle}>
					{!!h1 && (
						<Text
							style={[h1CoverStyleDef, h1CoverStyle]}>
							{h1}
						</Text>
					)}
					{!!h2 && (
						<Text
							style={[h2CoverStyleDef, h2CoverStyle]}>
							{h2}
						</Text>
					)}
				</View>
				<ThemedMaterialIcon
					name={'keyboard-arrow-right'}
					style={[arrowStyleDef, arrowStyle]}/>
			</View>
		</RippleButton>
	);
};

const getStyles = ({
	layout,
	colors,
	enabled,
}: Object): Object => {

	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		shadow,
		paddingFactor,
	} = Theme.Core;

	const {
		iconTwoColorBlock,
		card,
		colorBlockDisabled,
		iconOneColorBlockEnabled,
		iconOneColorBlockDisabled,
		baseColorFour,
		headerOneColorBlockDisabled,
		infoOneColorBlockEnabled,
		infoOneColorBlockDisabled,
		iconTwoColorBlockDisabled,
	} = colors;

	const padding = deviceWidth * paddingFactor;
	const rowHeight = deviceWidth * 0.27;

	const colorBackground = enabled ? card : colorBlockDisabled;
	const colorHeaderOneText = enabled ? baseColorFour : headerOneColorBlockDisabled;
	const colorIcon = enabled ? iconOneColorBlockEnabled : iconOneColorBlockDisabled;
	const colorIconTwo = enabled ? iconTwoColorBlock : iconTwoColorBlockDisabled;

	const iconSize = rowHeight * 0.5;
	const h1FontSize = deviceWidth * 0.065;
	const h2FontSize = deviceWidth * 0.033;

	const rowWidth = width - (padding * 2);

	return {
		coverStyleDef: {
			...shadow,
			backgroundColor: colorBackground,
			marginHorizontal: padding,
			flexDirection: 'row',
			padding,
			width: rowWidth,
			marginTop: padding / 2,
			height: rowHeight,
			alignItems: 'center',
			borderRadius: 2,
			justifyContent: 'space-between',
		},
		leftBlockCoverStyle: {
			width: rowWidth * 0.2,
		},
		leftIconStyle: {
			fontSize: iconSize,
			color: colorIcon,
		},
		headersCoverStyle: {
			marginHorizontal: padding,
			flex: 1,
		},
		h1CoverStyleDef: {
			fontSize: h1FontSize,
			color: colorHeaderOneText,
		},
		h2CoverStyleDef: {
			fontSize: h2FontSize,
			color: enabled ? infoOneColorBlockEnabled : infoOneColorBlockDisabled,
		},
		arrowStyleDef: {
			color: colorIconTwo,
			fontSize: rowHeight * 0.5,
		},
	};
};

export default (memo<Object>(IconedSelectableBlock): Object);
