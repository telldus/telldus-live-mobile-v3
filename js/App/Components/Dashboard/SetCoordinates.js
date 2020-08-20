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
	useCallback,
	useEffect,
	useState,
} from 'react';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import {
	LayoutAnimation,
	StyleSheet,
	RefreshControl,
} from 'react-native';
import MapView from 'react-native-maps';

import {
	View,
	ThemedScrollView,
	FloatingButton,
} from '../../../BaseComponents';

import {
	LayoutAnimations,
} from '../../Lib';
import {
	getCurrentLocation,
} from '../../Actions/GeoFence';

import {
	SelectCoordinatesDD,
} from './SubViews';

import {
	useDialogueBox,
} from '../../Hooks/Dialoguebox';

import Theme from '../../Theme';

const SetCoordinates = memo<Object>((props: Object): Object => {
	const {
		onDidMount,
		navigation,
		route,
	} = props;

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const { location: _location = {} } = useSelector((state: Object): Object => state.fences);
	let location: {longitude: number, latitude: number} = _location || {};
	const MANUAL_ID = 'manual';
	const MANUAL_VALUE = 'Manual';

	const {
		selectedType,
		uniqueId,
	} = route.params || {};

	const [ config, setConfig ] = useState({
		...location,
		isRefreshing: !location || (!location.longitude && !location.latitude),
		manual: true,
		id: MANUAL_ID,
	});
	const {
		isRefreshing,
		manual,
		latitude,
		longitude,
		id,
	} = config;

	const deltaDef = 0.05;

	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(getCurrentLocation()).then((res: Object) => {
			const {
				coords = {},
			} = res;
			const {
				latitude: lat,
				longitude: lon,
			} = coords;
			setConfig({
				...config,
				longitude: lon,
				latitude: lat,
				isRefreshing: false,
			});
		}).catch(() => {
			setConfig({
				...config,
				isRefreshing: false,
			});
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const { layout } = useSelector((state: Object): Object => state.app);

	useEffect(() => {// TODO: translate
		onDidMount('Set Coordinates', 'Select or manually enter Coordinates');
	}, [onDidMount]);

	const {
		container,
		body,
		mapStyle,
	} = getStyles({layout});

	const showDialogue = useCallback((message: string) => {
		toggleDialogueBoxState({
			show: true,
			showHeader: true,
			imageHeader: true,
			text: message,
			showPositive: true,
		});
	}, [toggleDialogueBoxState]);

	const onPressNext = useCallback((params: Object) => {
		const invalidMessage = 'Invalid Latitude and Longitud. Please enter valid latitude and longitude.'; // TODO: translate
		if (!latitude || !longitude) {
			showDialogue(invalidMessage);
			return;
		}

		const _latitude = parseInt(latitude, 10);
		const _longitude = parseInt(longitude, 10);
		const check1 = _latitude < -90 || _latitude > 90;
		const check2 = _longitude < -180 || _longitude > 180;
		if (check1 || check2) {
			showDialogue(invalidMessage);
			return;
		}

		navigation.navigate('SelectWeatherForecastDay', {
			selectedType,
			uniqueId,
			id,
			latitude,
			longitude,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [latitude, longitude, selectedType, uniqueId, id, showDialogue]);

	const _setConfig = useCallback((_config: Object) => {
		if (_config.latitude && _config.longitude) {
			setConfig({
				...config,
				..._config,
				isRefreshing: false,
			});
		} else {
			setConfig({
				...config,
				..._config,
				...location,
				isRefreshing: false,
			});
		}
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
	}, [config, location]);

	const onRegionChangeComplete = useCallback((reg: Object) => {
		setConfig({
			...config,
			...reg,
		});
	}, [config]);

	const hasCoords = !!longitude && !!latitude;
	const region = hasCoords ? new MapView.AnimatedRegion({
		longitude,
		latitude,
		longitudeDelta: deltaDef,
		latitudeDelta: deltaDef,
	}) : {};

	return (
		<View style={{flex: 1}}>
			<ThemedScrollView
				level={3}
				style={container}
				contentContainerStyle={{flexGrow: 1}}
				refreshControl={
					<RefreshControl
						enabled={false}
						refreshing={isRefreshing}
					/>
				}>
				<View style={body}>
					<SelectCoordinatesDD
						setConfig={_setConfig}
						MANUAL_ID={MANUAL_ID}
						MANUAL_VALUE={MANUAL_VALUE}/>
					<View style={{
						flex: 1,
					}}>
						{hasCoords && <MapView.Animated
							style={mapStyle}
							loadingEnabled={true}
							showsTraffic={false}
							showsUserLocation={true}
							region={region}
							onRegionChangeComplete={onRegionChangeComplete}
							showsMyLocationButton={false}
							followsUserLocation={false}
							scrollEnabled={manual && !isRefreshing}>
							<MapView.Marker.Animated
								image={{uri: 'marker'}}
								coordinate={region}/>
						</MapView.Animated>
						}
					</View>
				</View>
			</ThemedScrollView>
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'right_arrow_key'}}/>
		</View>
	);
});

const getStyles = ({layout}: Object): Object => {

	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		container: {
			flex: 1,
		},
		body: {
			flex: 1,
			paddingHorizontal: padding,
			paddingBottom: padding,
			paddingTop: padding * 1.5,
		},
		mapStyle: {
			...StyleSheet.absoluteFillObject,
		},
	};
};

export default SetCoordinates;
