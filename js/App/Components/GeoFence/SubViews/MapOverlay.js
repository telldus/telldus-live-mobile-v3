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
	useSelector,
} from 'react-redux';

import {
	View,
	Image,
	ThemedMaterialIcon,
} from '../../../../BaseComponents';

import {
	useAppTheme,
} from '../../../Hooks/Theme';

const MapOverlay = React.memo<Object>((props: Object): Object => {
	const {
		overlayWidth,
	} = props;

	const {
		colorScheme,
	} = useAppTheme();

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		overlayWidth: _overlayWidth,
		mapOverlay,
		mapSpacer,
		markerOverlay,
		marker,
	} = getStyles(layout);

	let overlaySize = overlayWidth || _overlayWidth;

	return (
		<View
			style={mapOverlay}
			pointerEvents={'none'}>
			<View style={mapSpacer} />
			<Image
				source={{uri: 'map_overlay'}}
				style={{width: overlaySize, height: overlaySize, opacity: 0.3}}
				resizeMode={'stretch'}/>
			<View style={mapSpacer} />
			<View
				style={markerOverlay}
				pointerEvents={'none'}>
				<ThemedMaterialIcon
					name={'place'}
					style={marker}
					level={colorScheme === 'dark' ? 14 : 45}/>
			</View>
		</View>
	);
});

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	return {
		overlayWidth: deviceWidth,
		mapOverlay: {
			position: 'absolute',
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
		},
		markerOverlay: {
			position: 'absolute',
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
			alignItems: 'center',
			justifyContent: 'center',
		},
		marker: {
			fontSize: 28,
			backgroundColor: 'rgba(0,0,0,0)',
		},
		mapCircle: {
			width: deviceWidth,
			height: deviceWidth,
			opacity: 0.3,
		},
		mapSpacer: {
			flex: 1,
			backgroundColor: 'rgba(0,0,0,0.3)',
		},
	};
};

export default (MapOverlay: Object);
