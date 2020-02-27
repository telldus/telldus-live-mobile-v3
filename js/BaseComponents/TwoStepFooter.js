
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

import View from './View';
import Text from './Text';
import IconTelldus from './IconTelldus';

import Theme from '../App/Theme';

const TwoStepFooter = (props: Object): Object => {
	const {
		f1,
		f2,
		f3,
		f1Icon,
		onPressF1,
		onPressF2,
		onPressF3,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		footersCover,
		footerOne,
		footerItem,
		footerText,
		footerTwo,
		f1IconStyle,
	} = getStyles(layout);

	return (
		<View style={footersCover}>
			<View style={footerOne}>
				<TouchableOpacity style={footerItem} onPress={onPressF1}>
					{f1Icon && <IconTelldus icon={f1Icon} style={f1IconStyle}/>}
					<Text style={[footerText, {color: '#fff'}]}>
						{f1}
					</Text>
				</TouchableOpacity>
			</View>
			<View style={footerTwo}>
				<TouchableOpacity style={footerItem} onPress={onPressF2}>
					<Text style={footerText}>
						{f2}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity style={footerItem} onPress={onPressF3}>
					<Text style={footerText}>
						{f3}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const footerHeight = Math.floor(deviceWidth * 0.26);

	const {
		brandSecondary,
	} = Theme.Core;

	return {
		footerHeight,
		footersCover: {
			position: 'absolute',
			alignItems: 'flex-end',
			justifyContent: 'center',
			width: '100%',
			borderTopWidth: StyleSheet.hairlineWidth,
			borderTopColor: '#00000040',
			height: footerHeight,
			maxHeight: 100,
			bottom: 0,
		},
		footerOne: {
			width: '100%',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: brandSecondary,
			height: footerHeight / 2,
			maxHeight: 100,
		},
		footerTwo: {
			width: '100%',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			backgroundColor: '#FAFAFA',
			height: footerHeight / 2,
			maxHeight: 100,
		},
		footerItem: {
			padding: 10,
			alignItems: 'center',
			justifyContent: 'center',
			flexDirection: 'row',
		},
		footerText: {
			fontSize: Math.floor(deviceWidth * 0.04),
			color: brandSecondary,
			fontWeight: 'bold',
			fontFamily: 'Roboto-Regular',
		},
		f1IconStyle: {
			fontSize: Math.floor(deviceWidth * 0.04),
			color: brandSecondary,
		},
	};
};

export default React.memo<Object>(TwoStepFooter);
