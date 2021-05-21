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
import { useSelector } from 'react-redux';

import Text from './Text';
import View from './View';
import Icon from './Icon';
import TouchableOpacity from './TouchableOpacity';

import Theme from '../App/Theme';

type Props = {
    title?: string,
    label?: string,
    value?: string | number,
    blockContainerStyle?: Array<any> | Object,
    titleTextStyle?: Array<any> | Object,
    labelTextStyle?: Array<any> | Object,
    valueTextStyle?: Array<any> | Object,
	appLayout: Object,
	icon?: string,
	iconSize?: number,
	iconColor?: string,
	iconStyle?: Array<any> | Object,
	onPress?: () => void,
	renderRightComponent?: Function,
};

const TitledInfoBlock = (props: Props): Object => {
	let {
		title,
		label,
		value,
		blockContainerStyle,
		titleTextStyle,
		labelTextStyle,
		valueTextStyle, icon,
		iconSize,
		iconColor,
		iconStyle,
		onPress,
		renderRightComponent,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const _onPress = useCallback(() => {
		if (onPress) {
			if (typeof onPress === 'function') {
				onPress();
			} else {
				console.warn('Invalid Prop Passed : onPress expects a Function.');
			}
		}
	}, [onPress]);

	let styles = getStyles(layout);
	iconSize = iconSize ? iconSize : styles.iconSize;

	let rightComponent;
	if (renderRightComponent) {
		rightComponent = renderRightComponent();
	}

	return (
		<View style={[styles.blockContainer, blockContainerStyle]}>
			{!!title && (
				<Text
					level={2}
					style={[styles.titleStyle, titleTextStyle]}>
					{title}
				</Text>
			)}
			<TouchableOpacity
				level={2}
				style={styles.infoCover}
				onPress={_onPress}
				disabled={!onPress}>
				<Text
					level={3}
					style={[styles.infoLabel, labelTextStyle]} numberOfLines={1}>
					{label}
				</Text>
				<View style={{
					flex: 1,
					flexDirection: 'row',
					flexWrap: 'wrap',
					alignItems: 'center',
					justifyContent: 'flex-end',
				}}>
					<Text
						level={4}
						style={[ styles.infoValue, valueTextStyle]} numberOfLines={1}>
						{value}
					</Text>
					{!!rightComponent && rightComponent}
				</View>
				{!!icon && (
					<Icon
						level={4}
						name={icon}
						size={iconSize}
						color={iconColor}
						style={[styles.nextIcon, iconStyle]}/>
				)}
			</TouchableOpacity>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		shadow,
		fontSizeFactorEight,
	} = Theme.Core;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);

	return {
		iconSize: Math.floor(deviceWidth * 0.08),
		blockContainer: {
			flex: 0,
			alignItems: 'stretch',
			justifyContent: 'center',
			marginBottom: 10,
			borderRadius: 2,
		},
		titleStyle: {
			marginBottom: 5,
			fontSize,
		},
		infoCover: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			...shadow,
			padding: fontSize,
			borderRadius: 2,
		},
		infoLabel: {
			fontSize,
		},
		infoValue: {
			marginLeft: 8,
			fontSize,
			flexWrap: 'wrap',
		},
		nextIcon: {
			position: 'absolute',
			right: fontSize,
		},
	};
};

export default (memo<Object>(TitledInfoBlock): Object);
