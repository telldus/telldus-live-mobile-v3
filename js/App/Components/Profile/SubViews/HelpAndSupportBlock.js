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
	Linking,
} from 'react-native';
import { useSelector } from 'react-redux';

import {
	View,
	Text,
	IconTelldus,
} from '../../../../BaseComponents';
import Theme from '../../../Theme';

const HelpAndSupportBlock = (props: Object): Object => {

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		coverOneStyle,
		titleStyle,
		bodyStyle,
		coverTwoStyle,
		iconStyle,
		textStyle,
		padding,
	} = getStyles(layout);

	const BLOCKS = [
		{
			icon: 'faq',
			text: 'FAQ',
			url: 'http://support.telldus.com/kb/index.php',
		},
		{
			icon: 'guide',
			text: 'Guides',
			url: 'https://live.telldus.com/help/guides',
		},
		{
			icon: 'manual',
			text: 'Manuals',
			url: 'https://live.telldus.com/help/manuals',
		},
	];

	const blocks = BLOCKS.map((block: Object, i: number): Object => {
		const {
			icon,
			text,
			url,
		} = block;
		function onPress() {
			Linking.canOpenURL(url).then((supported: boolean): any => {
				if (!supported) {
				  console.log(`Can't handle url: ${url}`);
				} else {
				  return Linking.openURL(url);
				}
			  }).catch((err: Object) => {
				  console.error('An error occurred', err);
			  });
		}

		return (
			<TouchableOpacity onPress={onPress} key={`${i}`}>
				<View style={[coverTwoStyle, {
					marginLeft: padding,
				}]}>
					<IconTelldus icon={icon} style={iconStyle}/>
					<Text style={textStyle}>
						{text}
					</Text>
				</View>
			</TouchableOpacity>
		);
	});

	return (
		<View>
			<View style={coverOneStyle}>
				<Text style={titleStyle}>
                Help & Support
				</Text>
				<Text style={bodyStyle}>
                To help you manage your smart home we provide some assistance in our FAQ, user guides,
                and product manuals. If you still can't find what you are looking for we are here to help.
				</Text>
			</View>
			{blocks}
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const fontSize = Math.floor(deviceWidth * 0.04);

	const padding = deviceWidth * Theme.Core.paddingFactor;

	const blockWidth = (width - (padding * 3)) / 3;

	return {
		padding,
		coverOneStyle: {
			backgroundColor: '#fff',
			...Theme.Core.shadow,
			justifyContent: 'center',
			alignItems: 'center',
			paddingHorizontal: padding,
			paddingVertical: padding * 2,
			marginTop: padding / 2,
		},
		titleStyle: {
			fontSize: fontSize * 1.4,
			color: Theme.Core.brandSecondary,
			textAlign: 'center',
		},
		bodyStyle: {
			fontSize,
			textAlign: 'center',
			color: Theme.Core.rowTextColor,
			marginTop: 10,
		},
		coverTwoStyle: {
			width: blockWidth,
		},
		iconStyle: {
			fontSize: fontSize * 1.4,
			color: Theme.Core.brandSecondary,
			textAlign: 'center',
		},
		textStyle: {
			fontSize: fontSize * 1.4,
			color: Theme.Core.brandSecondary,
			textAlign: 'center',
		},
	};
};

export default HelpAndSupportBlock;
