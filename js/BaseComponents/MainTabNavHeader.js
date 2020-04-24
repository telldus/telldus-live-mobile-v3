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
	memo,
} from 'react';
import {
	Platform,
} from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';
import {
	useSelector,
} from 'react-redux';

import Header from './Header';

import Theme from '../App/Theme';

type Props = {
	children?: Object,
	logoStyle?: Object,
	rounded?: number,
	searchBar?: ?Object,
	rightButton?: Object,
	leftButton: Object,
	showAttentionCapture: boolean,
	intl: Object,
	forceHideStatus?: boolean,
	style: Object | Array<any>,
	parent?: string,
};

const MainTabNavHeader = memo<Object>((props: Props): Object => {

	const {
		parent,
	} = props;

	const { layout: appLayout } = useSelector((state: Object): Object => state.app);

	const {
		style,
		logoStyle,
	} = getStyles(appLayout, {parent});

	return (
		<Header
			{...props}
			style={style}
			logoStyle={logoStyle}/>
	);
});

const getStyles = (appLayout: Object, {
	parent,
}: Object): Object => {

	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceHeight = isPortrait ? height : width;

	const {
		headerHeightFactor,
	 } = Theme.Core;

	 const { land, port } = headerHeightFactor;

	return {
		style: {
			...Platform.select({
				ios: {
					height: (isIphoneX() ? deviceHeight * 0.08 : deviceHeight * land ),
				},
				android:
					isPortrait ? {
						height: deviceHeight * port,
						alignItems: 'center',
					} : parent === 'Tabs' ? {
						transform: [{rotateZ: '-90deg'}],
						position: 'absolute',
						left: Math.ceil(-deviceHeight * 0.4444),
						top: Math.ceil(deviceHeight * 0.4444),
						width: deviceHeight,
						height: Math.ceil(deviceHeight * land),
					}
						:
						{},
			}),
		},
		logoStyle: {
			...Platform.select({
				android:
					(!isPortrait && parent === 'Tabs') ? {
						position: 'absolute',
						left: deviceHeight * 0.6255,
						top: deviceHeight * 0.0400,
					}
						:
						{},
			}),
		},
	};
};

export default MainTabNavHeader;
