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

import Text from './Text';
import View from './View';
import BlockIcon from './BlockIcon';

import Theme from '../App/Theme';

const InfoBlock = (props: Object): Object => {
	const {
		text,
		appLayout,
		infoIconStyle,
		infoContainer,
	} = props;

	const {
		infoContainerDef,
		infoIconStyleDef,
		textStyle,
		blockIconContainerStyle,
	} = getStyles(appLayout);

	return (
		<View style={[infoContainerDef, infoContainer]}>
			<BlockIcon
				icon={'info'}
				style={[infoIconStyleDef, infoIconStyle]}
				containerStyle={blockIconContainerStyle}/>
			<View style={{
				flex: 1,
				flexDirection: 'row',
				flexWrap: 'wrap',
			}}>
				<Text style={textStyle}>
					{text}
				</Text>
			</View>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		shadow,
		paddingFactor,
		brandSecondary,
		eulaContentColor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeBody = deviceWidth * 0.042;

	return {
		infoContainerDef: {
			flex: 1,
			flexDirection: 'row',
			marginBottom: padding / 2,
			padding: padding,
			backgroundColor: '#fff',
			...shadow,
			alignItems: 'center',
			justifyContent: 'space-between',
			borderRadius: 2,
		},
		blockIconContainerStyle: {
			backgroundColor: 'transparent',
		},
		infoIconStyleDef: {
			fontSize: deviceWidth * 0.14,
			color: brandSecondary,
		},
		textStyle: {
			flex: 1,
			fontSize: fontSizeBody,
			color: eulaContentColor,
			flexWrap: 'wrap',
			marginLeft: padding,
		},
	};
};

export default InfoBlock;
