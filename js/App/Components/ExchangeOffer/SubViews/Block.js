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
import { View, Text, Image } from '../../../../BaseComponents';

import Theme from '../../../Theme';

const Block = (props: Object): Object => {
	const {
		appLayout,
		h1,
		h2,
		body,
		img,
		index,
		addTextOne,
		addTextTwo,
	} = props;

	const {
		contentContainerStyle,
		h1Style,
		h2Style,
		bodyStyle,
		imageCover,
		textsCover,
		padding,
		priceInfoCover,
		priceInfoInnerCover,
		priceInfoOne,
		priceInfoTwo,
		priceInfoThree,
	} = getStyles(appLayout, index);

	return (
		<View
			level={2}
			style={[contentContainerStyle, {
				paddingTop: index === 0 ? padding * 1.5 : 0,
				marginTop: index === 0 ? padding * 1.5 : padding / 2,
				marginBottom: index === 3 ? padding * 1.5 : 0,
			}]}>
			{!!img && <View style={imageCover}>
				<Image source={img} style={{
					flex: 1,
					width: undefined,
					height: undefined,
				}}
				resizeMode="contain"
				resizeMethod="resize"/>
				{index === 0 &&
				(
					<View style={priceInfoCover}>
						<View style={priceInfoInnerCover}>
							<Text
								level={23}
								style={priceInfoOne}>
							799 SEK
							</Text>
							<Text style={priceInfoTwo}>
								{addTextOne}
							</Text>
							<Text style={priceInfoThree}>
								{addTextTwo}
							</Text>
						</View>
					</View>
				)
				}
			</View>
			}
			<View style={[textsCover, {
				paddingTop: index === 0 ? 0 : padding,
				marginTop: index === 0 ? -padding : 0,
			}]}>
				{!!h1 && <Text style={h1Style}>
					{h1}
				</Text>
				}
				{!!h2 && <Text
					level={23}
					style={h2Style}>
					{h2}
				</Text>
				}
				<Text style={bodyStyle}>
					{body}
				</Text>
			</View>
		</View>
	);
};

const getStyles = (appLayout: Object, index: number): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		eulaContentColor,
		rowTextColor,
		brandPrimary,
		fontSizeFactorFour,
		fontSizeFactorOne,
		fontSizeFactorTwelve,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const widthIMG = width - (padding * 2);
	const heightIMG = widthIMG / 2.1428;

	return {
		padding,
		contentContainerStyle: {
			flex: 0,
			alignItems: 'center',
			justifyContent: 'center',
			...shadow,
			borderRadius: 2,
			width: widthIMG,
		},
		imageCover: {
			width: widthIMG,
			height: heightIMG,
			flexDirection: 'row',
		},
		textsCover: {
			paddingHorizontal: padding * 2,
			paddingBottom: padding * 2,
			alignItems: 'center',
			justifyContent: 'center',
		},
		h1Style: {
			fontSize: Math.floor(deviceWidth * fontSizeFactorOne),
			color: eulaContentColor,
			textAlign: 'center',
			fontWeight: 'bold',
		},
		h2Style: {
			fontSize: Math.floor(deviceWidth * fontSizeFactorTwelve),
			marginTop: 8,
			textAlign: 'center',
		},
		bodyStyle: {
			fontSize: Math.floor(deviceWidth * fontSizeFactorTwelve),
			color: rowTextColor,
			marginTop: 8,
		},
		priceInfoCover: {
			alignItems: 'flex-start',
			justifyContent: 'center',
			width: widthIMG * 0.38,
		},
		priceInfoInnerCover: {
			position: 'absolute',
			left: -(padding * 4),
			width: widthIMG * 0.5,
		},
		priceInfoOne: {
			fontSize: Math.floor(deviceWidth * 0.066),
			fontWeight: 'bold',
		},
		priceInfoTwo: {
			marginTop: 3,
			fontSize: Math.floor(deviceWidth * fontSizeFactorFour),
			color: eulaContentColor,
		},
		priceInfoThree: {
			fontSize: Math.floor(deviceWidth * fontSizeFactorTwelve),
			color: brandPrimary,
			fontWeight: 'bold',
		},
	};
};

export default (React.memo<Object>(Block): Object);

