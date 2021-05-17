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

import React, {
	useMemo,
	memo,
} from 'react';

import GeoHeader from '../App/Components/TabViews/img/telldus_geometric_bg.svg';
import ThemedImage from './ThemedImage';

import {
	useAppTheme,
} from '../App/Hooks/Theme';

type Props = {
	headerHeight: number,
    headerWidth: number,

    style?: number | Object | Array<Object>,
};

const GeometricHeader = (props: Props): Object => {

	let {
		style,
		headerWidth,
	} = props;

	const prepareSize = useMemo((): Object => {
		const height = 400, width = 960;

		let requiredHeight = Math.ceil((headerWidth / width) * height);
		return {
			width: headerWidth,
			height: requiredHeight,
		};
	}, [headerWidth]);

	const {
		height,
		width,
	} = prepareSize;

	const {
		colors,
		selectedThemeSet,
	} = useAppTheme();

	if (selectedThemeSet && selectedThemeSet.key === 2) {
		return (
			<ThemedImage
				source={{uri: 'telldus_header_bg'}}
				style={[{
					height,
					width,
				},
				style]}
			/>
		);
	}

	return (
		<GeoHeader
			fill={colors.inAppBrandSecondary}
			style={style}
			height={height}
			width={width}/>
	);
};

GeometricHeader.defaultProps = {
	headerHeight: 20,
	headerWidth: 100,
};

export default (memo<Object>(GeometricHeader): Object);
