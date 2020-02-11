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
	TouchableOpacity,
} from 'react-native';
import {
	useSelector,
} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
	View,
	Text,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';


const FenceCallout = (props: Object): Object => {
	const {
		title,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		container,
		titleStyle,
		editBtn,
		editIcon,
	} = getStyles(layout);

	return (
		<View style={container}>
			<Text
				style={titleStyle}>
				{title}
			</Text>
			<TouchableOpacity
				style={editBtn}>
				<Icon
					style={editIcon}
					name="mode-edit"/>
			</TouchableOpacity>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		brandSecondary,
		eulaContentColor,
	} = Theme.Core;

	const fontSize = deviceWidth * 0.03;

	return {
		container: {
			flexDirection: 'row',
			alignItems: 'center',
		},
		titleStyle: {
			fontSize,
			color: brandSecondary,
		},
		editBtn: {
			marginLeft: 8,
		},
		editIcon: {
			color: eulaContentColor,
			fontSize,
		},
	};
};

export default FenceCallout;
