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
	Platform,
} from 'react-native';
import { useSelector } from 'react-redux';

import {
	View,
	Text,
	Image,
	EmptyView,
} from '../../../../../BaseComponents';
import {
	useAppTheme,
} from '../../../../Hooks/Theme';

import Theme from '../../../../Theme';

const NumberedBlock = (props: Object): Object => {
	const {
		img: IMG,
		text,
		number,
		blockStyle,
		blockStyleCover,
		rightBlockIItemOne,
		progress,
	} = props;

	const {
		colors,
	} = useAppTheme();

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		markerTextCover,
		markerText,
		blockLeft,
		blockStyleCoverDef,
		blockStyleDef,
		blockRight,
		infoText,
		imageType,
	} = getStyles({
		layout,
		colors,
	});

	return (
		<View
			level={2}
			style={[blockStyleCoverDef, blockStyleCover]}>
			<View style={[blockStyleDef, blockStyle]}>
				<View style={blockLeft}>
					<View style={markerTextCover}/>
					<Text style={markerText}>
						{number}
					</Text>
					{IMG ?
						typeof IMG === 'number' ?
							<Image source={IMG} resizeMode={'contain'} style={imageType}/>
							:
							typeof IMG === 'function' ?
								<IMG
									height={imageType.height}
									width={imageType.width}
									style={imageType}/>
								:
								<EmptyView/>
						:
						<EmptyView/>
					}
				</View>
				<View style={blockRight}>
					<Text
						level={25}
						style={infoText}>
						{text}
					</Text>
					{!!rightBlockIItemOne && rightBlockIItemOne}
				</View>
			</View>
			{!!progress && progress}
		</View>
	);
};

const getStyles = ({
	layout,
	colors,
}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		fontSizeFactorFive,
		fontSizeFactorTen,
	} = Theme.Core;

	const {
		inAppBrandPrimary,
	} = colors;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = deviceWidth * fontSizeFactorTen;

	const markerH = Platform.OS === 'ios' ? deviceWidth * 0.16 : deviceWidth * 0.1;

	return {
		padding,
		blockStyleCoverDef: {
			marginHorizontal: padding,
			...shadow,
			width: width - (2 * padding),
			borderRadius: 2,
			marginBottom: padding / 2,
			alignItems: 'center',
		},
		blockStyleDef: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'stretch',
		},
		blockLeft: {
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'flex-start',
			flex: 1,
			paddingVertical: Platform.OS === 'ios' ? markerH * 0.6 : markerH * 1.2,
		},
		markerTextCover: {
			position: 'absolute',
			top: 0,
			left: 0,
			width: deviceWidth * 0.2,
			height: 0,
			backgroundColor: 'transparent',
			borderStyle: 'solid',
			borderRightWidth: deviceWidth * 0.05,
			borderTopWidth: markerH,
			borderRightColor: 'transparent',
			borderTopColor: inAppBrandPrimary,
			borderTopLeftRadius: 2,
		},
		markerText: {
			position: 'absolute',
			fontSize: deviceWidth * fontSizeFactorFive,
			color: '#fff',
			top: deviceWidth * 0.01,
			left: deviceWidth * 0.06,
		},
		imageType: {
			alignSelf: 'center',
			height: deviceWidth * 0.20,
			width: deviceWidth * 0.17,
			marginTop: padding,
			marginLeft: padding,
		},
		blockRight: {
			width: width * 0.74,
			justifyContent: 'center',
			alignItems: 'flex-start',
			paddingVertical: padding * 2,
			paddingHorizontal: padding,
		},
		infoText: {
			fontSize: fontSizeText,
			flexWrap: 'wrap',
		},
	};
};

export default (React.memo<Object>(NumberedBlock): Object);
