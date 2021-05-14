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
	useMemo,
} from 'react';
import {
	TouchableOpacity,
	Linking,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	Text,
	IconTelldus,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

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
		blocksCoverStyle,
	} = getStyles(layout);

	const {
		formatMessage,
	} = useIntl();

	const blocks = useMemo((): Array<Object> => {
		const BLOCKS = [
			{
				icon: 'faq',
				text: formatMessage(i18n.labelFAQ),
				url: 'http://support.telldus.com/kb/index.php',
			},
			{
				icon: 'guide',
				text: formatMessage(i18n.hyperLintText),
				url: 'https://live.telldus.com/help/guides',
			},
			{
				icon: 'manual',
				text: formatMessage(i18n.manuals),
				url: 'https://live.telldus.com/help/manuals',
			},
		];
		return BLOCKS.map((block: Object, i: number): Object => {
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
					<View
						level={2}
						style={[coverTwoStyle, {
							marginLeft: i === 0 ? 0 : padding / 2,
						}]}>
						<IconTelldus
							level={43}
							icon={icon}
							style={iconStyle}/>
						<Text
							level={42}
							style={textStyle}>
							{text}
						</Text>
					</View>
				</TouchableOpacity>
			);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [layout]);

	return (
		<View>
			<View
				level={2}
				style={coverOneStyle}>
				<Text
					level={42}
					style={titleStyle}>
					{formatMessage(i18n.labelHelpAndSupport)}
				</Text>
				<Text
					level={4}
					style={bodyStyle}>
					{formatMessage(i18n.contentHelpAndSupport)}
				</Text>
			</View>
			<View style={blocksCoverStyle}>
				{blocks}
			</View>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		fontSizeFactorFour,
	} = Theme.Core;
	const fontSize = Math.floor(deviceWidth * fontSizeFactorFour);

	const padding = deviceWidth * paddingFactor;

	const blockWidth = (width - (padding * 3)) / 3;

	return {
		padding,
		coverOneStyle: {
			...shadow,
			justifyContent: 'center',
			alignItems: 'center',
			paddingHorizontal: padding,
			paddingVertical: padding * 2,
			marginTop: padding / 2,
		},
		titleStyle: {
			fontSize: fontSize * 1.4,
			textAlign: 'center',
		},
		bodyStyle: {
			fontSize,
			textAlign: 'center',
			marginTop: 10,
		},
		blocksCoverStyle: {
			flexDirection: 'row',
		},
		coverTwoStyle: {
			width: blockWidth,
			...Theme.Core.shadow,
			justifyContent: 'center',
			alignItems: 'center',
			marginTop: padding / 2,
			paddingVertical: padding * 2,
		},
		iconStyle: {
			fontSize: fontSize * 3.4,
			textAlign: 'center',
		},
		textStyle: {
			fontSize,
			textAlign: 'center',
			fontWeight: 'bold',
			marginTop: 5,
		},
	};
};

export default (React.memo<Object>(HelpAndSupportBlock): Object);
