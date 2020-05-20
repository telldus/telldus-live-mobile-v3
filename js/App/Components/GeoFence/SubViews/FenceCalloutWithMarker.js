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
	useRef,
	useCallback,
} from 'react';
import {
	TouchableOpacity,
} from 'react-native';
import {
	useSelector,
} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView from 'react-native-maps';

import {
	View,
	Text,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';


const FenceCalloutWithMarker = React.memo<Object>((props: Object): Object => {
	const {
		onPress,
		fence,
		enableGeoFence,
	} = props;

	const markerRef = useRef(null);

	const {
		extras = {},
		...others
	} = fence;

	const { layout } = useSelector((state: Object): Object => state.app);

	const _onPress = useCallback(() => {
		if (!enableGeoFence) {
			return;
		}
		const _fence = {
			...extras,
			...others,
			radius: extras.radius / 1000,
		};
		if (markerRef && markerRef.current && markerRef.current.showCallout) {
			markerRef.current.hideCallout();
		}
		onPress(_fence);
	}, [enableGeoFence, extras, onPress, others]);

	const {
		container,
		titleStyle,
		editBtn,
		editIcon,
	} = getStyles(layout);

	return (
		<MapView.Marker
			ref={markerRef}
			image={{uri: 'marker'}}
			coordinate={{ latitude: extras.latitude, longitude: extras.longitude }}>
			<MapView.Callout onPress={_onPress}>
				<View style={container}>
					<Text
						style={titleStyle}>
						{extras.title}
					</Text>
					<TouchableOpacity
						style={editBtn}>
						<Icon
							style={editIcon}
							name="mode-edit"/>
					</TouchableOpacity>
				</View>
			</MapView.Callout>
		</MapView.Marker>
	);
});

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		brandSecondary,
		eulaContentColor,
	} = Theme.Core;

	const fontSize = deviceWidth * 0.03;

	return {
		container: {
			flexDirection: 'row',
			alignItems: 'center',
		},
		titleStyle: {
			fontSize,
			color: brandSecondary,
		},
		editBtn: {
			marginLeft: 8,
		},
		editIcon: {
			color: eulaContentColor,
			fontSize,
		},
	};
};

export default FenceCalloutWithMarker;
