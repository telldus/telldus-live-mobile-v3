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
import { useSelector } from 'react-redux';

import {
	Text,
	View,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

type Props = {
	nodeName: string,
};

const NodeRelationBlock = memo<Object>((props: Props): Object => {
	const {
		nodeName,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		coverStyle,
		textStyle,
	} = getStyles(layout);

	return (
		<View
			style={coverStyle}>
			<Text
				level={4}
				style={textStyle}>
				{nodeName}
			</Text>
		</View>
	);
});

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		fontSizeFactorEight,
	} = Theme.Core;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);
	const padding = deviceWidth * paddingFactor;

	return {
		coverStyle: {
			justifyContent: 'space-between',
			flexDirection: 'row',
			alignItems: 'center',
			marginTop: padding / 2,
		},
		textStyle: {
			fontSize,
		},
	};
};


export default (NodeRelationBlock: Object);
