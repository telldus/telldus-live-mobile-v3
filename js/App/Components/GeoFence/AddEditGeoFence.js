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
	useCallback,
	useRef,
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
	FullPageActivityIndicator,
} from '../../../BaseComponents';
import {
	FenceCalloutWithMarker,
	MyLocation,
} from './SubViews';
import HelpOverlay from './HelpOverlay';

import {
	setEditFence,
	resetFence,
} from '../../Actions/Fences';
import {
	getCurrentAccountsFences,
	getCurrentLocation,
} from '../../Actions/GeoFence';

import Theme from '../../Theme';

type Props = {
    navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
	enableGeoFence: boolean,
	route: Object,
	isHelpVisible: boolean,
	setIsHelpVisible: Function,
};

const AddEditGeoFence = React.memo<Object>((props: Props): Object => {
	const {
		navigation,
		appLayout,
		enableGeoFence,
		route,
		isHelpVisible,
		setIsHelpVisible,
	} = props;

	const {
		params = {},
	} = route;

	const mapRef: Object = useRef({});

	const dispatch = useDispatch();

	const fallbackLocation = {
		latitude: 55.70584,
		longitude: 13.19321,
		latitudeDelta: 0.1,
		longitudeDelta: 0.1,
	};

	const [ pointCurrentLocation, setPointCurrentLocation ] = useState({});

	let { location = {}, fence } = useSelector((state: Object): Object => state.fences);
	location = {
		...fallbackLocation,
		...location,
	};
	const initialRegion = params.region || location;

	const [ currentAccFences, setCurrentAccFences ] = useState([]);

	useEffect(() => {
		(async () => {
			const geofences = await dispatch(getCurrentAccountsFences());
			setCurrentAccFences(geofences);
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fence]);

	const [ mapReady, setMapReady ] = useState(false);

	const {
		container,
		mapStyle,
		contentContainerStyle,
	} = getStyles({
		appLayout,
		mapReady,
	});

	const [ region, setRegion ] = useState(initialRegion);
	const [ regionToReset, setRegionToReset ] = useState();
	const [ regionToResume, setRegionToResume ] = useState();

	function onPressNext() {
		dispatch(resetFence());
		navigation.navigate('SelectArea', {
			region,
		});
	}

	const onEditFence = useCallback((fenceToEdit: Object) => {
		dispatch(setEditFence(fenceToEdit));
		navigation.navigate('EditGeoFence');
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onPressFocusMyLocation = useCallback(() => {
		(async () => {
			dispatch(getCurrentLocation());
			const loc = {
				...location,
				latitudeDelta: region.latitudeDelta,
				longitudeDelta: region.longitudeDelta,
			};
			setRegion(loc);
			setRegionToReset(loc);
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location, region]);

	const onRegionChange = useCallback((reg: Object) => {
		setRegion(reg);
	}, []);

	const onMapReady = useCallback(() => {
		setMapReady(true);
	}, []);

	function renderMarker(fenceC: Object, index: number): Object {
		if (!fenceC) {
			return;
		}

		const {
			extras = {},
		} = fenceC;

		return (
			<React.Fragment
				key={`${index}`}>
				<FenceCalloutWithMarker
					fence={fenceC}
					enableGeoFence={enableGeoFence}
					onPress={onEditFence}/>
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

	const closeHelp = useCallback(() => {
		setIsHelpVisible(false);
	}, [setIsHelpVisible]);

	const onUserLocationChange = useCallback((data: Object) => {
		(async () => {
			if (mapRef && mapRef.current) {
				const point = await mapRef.current.pointForCoordinate(data.nativeEvent.coordinate);
				if (point.x > 0 && point.y > 0) {
					setPointCurrentLocation(point);
				}
			}
		})();
	}, [mapRef]);

	useEffect(() => {
		if (regionToReset) {
			setRegionToReset();
		}
		if (!isHelpVisible && regionToResume) {
			setRegion(regionToResume);
			setRegionToReset(regionToResume);
			setRegionToResume();
		}
		if (isHelpVisible && !regionToResume) {
			onPressFocusMyLocation();
			setRegionToResume(region);
		}
		if (mapReady && (!pointCurrentLocation || typeof pointCurrentLocation.x === 'undefined') && location) {
			onUserLocationChange({
				nativeEvent: {
					coordinate: location,
				},
			});
		}
	}, [
		regionToReset,
		regionToResume,
		isHelpVisible,
		region,
		onPressFocusMyLocation,
		location,
		pointCurrentLocation,
		onUserLocationChange,
		mapReady,
	]);

	return (
		<View style={{flex: 1}}>
			<ScrollView
				style={container}
				contentContainerStyle={contentContainerStyle}>
				<MapView.Animated
					ref={mapRef}
					style={mapStyle}
					initialRegion={new AnimatedRegion(region)}
					region={regionToReset ? new AnimatedRegion(regionToReset) : undefined}
					scrollEnabled={enableGeoFence}
					loadingEnabled={false}
					showsTraffic={false}
					showsUserLocation={true}
					showsMyLocationButton={false}
					onRegionChange={onRegionChange}
					onUserLocationChange={onUserLocationChange}
					onMapReady={onMapReady}
					userLocationUpdateInterval={15000}
					userLocationFastestInterval={15000}>
					{
						currentAccFences.map((fenceC: Object, index: number): () => Object => {
							return renderMarker(fenceC, index);
						})
					}
				</MapView.Animated>
				{!mapReady && <FullPageActivityIndicator
					overlayLevel={3}
					color={'#000'}/>}
			</ScrollView>
			<MyLocation
				onPress={onPressFocusMyLocation}/>
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'icon_plus'}}
				disabled={!enableGeoFence}/>
			<HelpOverlay
				closeHelp={closeHelp}
				isVisible={isHelpVisible}
				appLayout={appLayout}
				pointCurrentLocation={pointCurrentLocation}/>
		</View>
	);
});

const getStyles = ({
	appLayout,
	mapReady,
}: Object): Object => {

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
