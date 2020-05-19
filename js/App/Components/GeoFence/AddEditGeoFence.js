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
	useState,
	useEffect,
} from 'react';
import {
	StyleSheet,
	ScrollView,
} from 'react-native';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import MapView, {
	AnimatedRegion,
} from 'react-native-maps';

import {
	FloatingButton,
	View,
} from '../../../BaseComponents';
import {
	FenceCallout,
	CurrentPositionMarker,
} from './SubViews';

import {
	setEditFence,
	resetFence,
} from '../../Actions/Fences';
import {
	getCurrentAccountsFences,
} from '../../Actions/GeoFence';

import Theme from '../../Theme';

type Props = {
    navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
	enableGeoFence: boolean,
};

const AddEditGeoFence = React.memo<Object>((props: Props): Object => {
	const {
		navigation,
		appLayout,
		enableGeoFence,
	} = props;

	const dispatch = useDispatch();

	let { location, fence } = useSelector((state: Object): Object => state.fences);
	location = location ? location : {};

	function onPressNext() {
		dispatch(resetFence());
		navigation.navigate('SelectArea');
	}

	const [ currentAccFences, setCurrentAccFences ] = useState([]);

	useEffect(() => {
		(async () => {
			const geofences = await dispatch(getCurrentAccountsFences());
			setCurrentAccFences(geofences);
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fence]);

	const {
		container,
		mapStyle,
		contentContainerStyle,
	} = getStyles(appLayout);

	const {
		latitude = 55.70584,
		longitude = 13.19321,
		latitudeDelta = 0.1,
		longitudeDelta = 0.1,
	} = location;
	const region = new AnimatedRegion({
		latitude,
		longitude,
		latitudeDelta,
		longitudeDelta,
	});

	function onEditFence(fenceToEdit: Object) {
		dispatch(setEditFence(fenceToEdit));
		navigation.navigate('EditGeoFence');
	}

	function renderMarker(fenceC: Object, index: number): Object {
		if (!fenceC) {
			return;
		}

		const {
			extras = {},
			...others
		} = fenceC;

		function onEditFenceInner() {
			if (!enableGeoFence) {
				return;
			}
			const _fence = {
				...extras,
				...others,
				radius: extras.radius / 1000,
			};
			onEditFence(_fence);
		}

		return (
			<React.Fragment
				key={`${index}`}>
				<MapView.Marker
					image={{uri: 'marker'}}
					coordinate={{ latitude: extras.latitude, longitude: extras.longitude }}>
					<MapView.Callout onPress={onEditFenceInner}>
						<FenceCallout
							title={extras.title}/>
					</MapView.Callout>
				</MapView.Marker>
				<MapView.Circle
					center={{
						latitude: extras.latitude,
						longitude: extras.longitude,
					}}
					radius={extras.radius}
					fillColor="rgba(226, 105, 1, 0.3)"
					strokeColor={Theme.Core.brandSecondary}/>
			</React.Fragment>
		);
	}

	return (
		<View style={{flex: 1}}>
			<ScrollView
				style={container}
				contentContainerStyle={contentContainerStyle}>
				<MapView.Animated
					style={mapStyle}
					initialRegion={region}
					scrollEnabled={enableGeoFence}>
					<CurrentPositionMarker
						latitude={latitude}
						longitude={longitude}
						appLayout={appLayout}
						tracksViewChanges={false}/>
					{
						currentAccFences.map((fenceC: Object, index: number): () => Object => {
							return renderMarker(fenceC, index);
						})
					}
				</MapView.Animated>
			</ScrollView>
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'icon_plus'}}
				disabled={!enableGeoFence}/>
		</View>
	);
});

const getStyles = (appLayout: Object): Object => {

	return {
		container: {
			flex: 1,
		},
		mapStyle: {
			...StyleSheet.absoluteFillObject,
		},
		contentContainerStyle: {
			flexGrow: 1,
		},
	};
};

export default AddEditGeoFence;
