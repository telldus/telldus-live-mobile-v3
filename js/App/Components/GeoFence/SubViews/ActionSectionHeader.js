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

import React from 'react';
import {
	useSelector,
} from 'react-redux';

import {
	TouchableOpacity,
	Text,
	ThemedMaterialIcon,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

const ActionSectionHeader = React.memo<Object>((props: Object): Object => {
	const {
		onToggle,
		title,
		expanded,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		container,
		label,
		arrow,
	} = getStyles(layout);

	return (
		<TouchableOpacity
			level={2}
			style={container}
			onPress={onToggle}>
			<Text
				level={25}
				style={label}>{title}</Text>
			<ThemedMaterialIcon
				level={21}
				name={'keyboard-arrow-right'} style={[arrow, {
					transform: [{rotateZ: expanded ? '90deg' : '0deg'}],
				}]}/>
		</TouchableOpacity>
	);
});

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		fontSizeFactorFour,
	} = Theme.Core;
	const fontSize = deviceWidth * fontSizeFactorFour;

	const padding = deviceWidth * paddingFactor;

	return {
		container: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			marginBottom: padding / 2,
			...shadow,
			padding,
			marginHorizontal: padding,
			borderRadius: 2,
		},
		label: {
			fontSize,
			marginLeft: padding,
		},
		arrow: {
			fontSize: fontSize * 2,
			marginLeft: 8,
		},
	};
};

export default (ActionSectionHeader: Object);
