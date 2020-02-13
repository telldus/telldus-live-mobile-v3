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

import React, { useState } from 'react';
import {
	TouchableOpacity,
} from 'react-native';
import {
	useSelector,
} from 'react-redux';

import {
	View,
	Text,
} from '../../../../BaseComponents';
import Icon from 'react-native-vector-icons/Ionicons';

const ActionSectionHeader = (props: Object): Object => {
	const {
		onToggle,
		title,
	} = props;

	const [collapsed, setCollapsed] = useState(false);

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		container,
		label,
		arrow,
	} = getStyles(layout);

	function toggleHeader() {

		if (onToggle) {
			onToggle(!collapsed);
		}
		setCollapsed(!collapsed);
	}


	return (
		<TouchableOpacity onPress={toggleHeader}>
			<View style={container}>
				<Text style={label}>{title}</Text>
				<Icon
					name={collapsed ? 'ios-arrow-down' : 'ios-arrow-forward'}
					style={arrow}/>
			</View>
		</TouchableOpacity>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const fontSize = deviceWidth * 0.03;

	return {
		container: {
			marginTop: 8,
			flexDirection: 'row',
			alignItems: 'center',
		},
		label: {
			color: '#999',
			fontSize,
		},
		arrow: {
			marginLeft: 8,
			color: '#999',
		},
	};
};

export default ActionSectionHeader;
