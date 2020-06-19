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
import MapView from 'react-native-maps';

import {
	View,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

type Props = {
    appLayout: Object,
    longitude: number,
    latitude: number,
    tracksViewChanges: boolean,
};

const CurrentPositionMarker = (props: Props): Object => {
	const {
		appLayout,
		longitude,
		latitude,
		tracksViewChanges,
	} = props;

	const {
		currentLocMarkerStyle,
		currentLocMarkerOuterStyle,
	} = getStyles(appLayout);

	return (
		<MapView.Marker
			title="Current Location"
			coordinate={{ latitude: latitude, longitude: longitude }}
			pinColor={Theme.Core.brandSecondary}
			tracksViewChanges={tracksViewChanges}>
			<View style={currentLocMarkerOuterStyle}>
				<View style={currentLocMarkerStyle}/>
			</View>
		</MapView.Marker>
	);
};

const getStyles = (appLayout: Object): Object => {

	const {
		inactiveSwitchBackground,
		iosToolbarBtnColor,
	} = Theme.Core;

	return {
		currentLocMarkerOuterStyle: {
			borderWidth: 1,
			borderColor: inactiveSwitchBackground,
			backgroundColor: '#fff',
			height: 20,
			width: 20,
			borderRadius: 10,
			alignItems: 'center',
			justifyContent: 'center',
		},
		currentLocMarkerStyle: {
			backgroundColor: iosToolbarBtnColor,
			height: 16,
			width: 16,
			borderRadius: 8,
		},
	};
};

export default React.memo<Object>(CurrentPositionMarker);
