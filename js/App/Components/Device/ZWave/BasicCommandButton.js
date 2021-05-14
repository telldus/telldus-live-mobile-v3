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
	Text,
	TouchableOpacity,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

type Props = {
    label: string,
    onPress: Function,
    onPressData?: Object,
    index: number,
    disabled: boolean,
};

const BasicCommandButton = (props: Props): Object => {
	const {
		label,
		onPress,
		onPressData,
		index,
		disabled,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		coverStyle,
		labelStyle,
	} = getStyles({
		layout,
		index,
	});

	return (
		<TouchableOpacity
			style={coverStyle}
			onPress={onPress}
			onPressData={onPressData}
			level={disabled ? 7 : 23}
			disabled={disabled}>
			<Text
				level={disabled ? 13 : 12}
				style={labelStyle}>
				{label}
			</Text>
		</TouchableOpacity>
	);
};

const getStyles = ({
	layout,
	index,
}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const buttonsSpacing = padding / 2;
	const count = 2;
	const buttonWidth = Math.floor((width - (padding * 2) - ((buttonsSpacing * 2) + (padding * 2))) / count);
	const fontSize = Math.floor(buttonWidth * 0.1);

	return {
		coverStyle: {
			justifyContent: 'center',
			alignItems: 'center',
			width: buttonWidth,
			marginRight: (index !== 0 && (index + 1) % count === 0) ? 0 : buttonsSpacing,
			borderRadius: 5,
			padding: padding / 2,
			marginBottom: padding,
			...shadow,
		},
		labelStyle: {
			fontSize,
		},
	};
};

export default (memo<Object>(BasicCommandButton): Object);
