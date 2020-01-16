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
import {
	StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
	View,
	FloatingButton,
	Text,
} from '../../../BaseComponents';
import MapView, {
	AnimatedRegion,
	Circle,
	Callout,
} from 'react-native-maps';
import Theme from '../../Theme';

type Props = {
    navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
};

const AddEditGeoFence = (props: Props): Object => {
	const {
		navigation,
		appLayout,
	} = props;

	function onPressNext() {
		navigation.navigate({
			routeName: 'SelectArea',
			key: 'SelectArea',
		});
	}

	const {
		container,
		mapStyle,
		calloutStyle,
		calloutInnerView,
		editIconSize,
		calloutText,
	} = getStyles(appLayout);

	const region = new AnimatedRegion({
		latitude: 55.70584,
		longitude: 13.19321,
		latitudeDelta: 0.24442,
		longitudeDelta: 0.24442,
	});

	const coordinate = {
		latitude: 55.70584,
		longitude: 13.19321,
	};

	const circleCenter = {
		latitude: 55.70584,
		longitude: 13.19321,
	};

	// eslint-disable-next-line no-unused-vars
	let marker;
	function setRefMarker(ref: any) {
		marker = ref;
	}

	// eslint-disable-next-line no-unused-vars
	let map;
	function setRefMap(ref: any) {
		map = ref;
	}

	function onPressCallout() {
		navigation.navigate({
			routeName: 'EditGeoFence',
			key: 'EditGeoFence',
		});
	}

	return (
		<View style={container}>
			<MapView.Animated
				style={mapStyle}
				ref={setRefMap}
				region={region}>
				<MapView.Marker.Animated
					ref={setRefMarker}
					coordinate={coordinate}>
					<Callout style={calloutStyle} onPress={onPressCallout}>
						<View style={calloutInnerView}>
							<Text style={calloutText}>Area name</Text>
							<Icon name={'edit'} size={editIconSize} color={Theme.Core.rowTextColor}/>
						</View>
					</Callout>
				</MapView.Marker.Animated>
				<Circle
					center={circleCenter}
					radius={3000}
					fillColor={'#e2690150'}
					strokeColor={Theme.Core.brandSecondary}/>
			</MapView.Animated>
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'icon_plus'}}/>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		brandSecondary,
	} = Theme.Core;

	const editIconSize = deviceWidth * 0.04;

	return {
		container: {
			flex: 1,
		},
		mapStyle: {
			...StyleSheet.absoluteFillObject,
		},
		calloutStyle: {
			padding: 5,
		},
		calloutInnerView: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
		},
		editIconSize,
		calloutText: {
			fontSize: editIconSize,
			color: brandSecondary,
			marginRight: 10,
		},
	};
};

export default AddEditGeoFence;
