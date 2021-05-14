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
import { useIntl } from 'react-intl';

import {
	FloatingButton,
	View,
	FullPageActivityIndicator,
	InfoBlock,
	IconTelldus,
	Text,
	TouchableOpacity,
} from '../../../BaseComponents';
import {
	FenceCalloutWithMarker,
	MyLocation,
} from './SubViews';
import HelpOverlay from './HelpOverlay';

import {
	isBasicUser,
} from '../../Lib/appUtils';
import {
	setEditFence,
	resetFence,
} from '../../Actions/Fences';
import {
	getCurrentAccountsFences,
	getCurrentLocation,
	requestIgnoreBatteryOptimizations,
} from '../../Actions/GeoFence';
import {
	useAppTheme,
} from '../../Hooks/Theme';
import Theme from '../../Theme';

import i18n from '../../Translations/common';

type Props = {
    navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
	enableGeoFence: boolean,
	route: Object,
	isHelpVisible: boolean,
	setIsHelpVisible: Function,
};

const overlayFenceRadius = 1000;

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
	const intl = useIntl();
	const {
		formatMessage,
	} = intl;
	const dispatch = useDispatch();

	const fallbackLocation = {
		latitude: 55.70584,
		longitude: 13.19321,
		latitudeDelta: 0.1,
		longitudeDelta: 0.1,
	};

	const {
		colors,
	} = useAppTheme();

	useEffect(() => {
		dispatch(requestIgnoreBatteryOptimizations());
	}, [dispatch]);

	const [ pointCurrentLocation, setPointCurrentLocation ] = useState({});

	let { location = {}, fence } = useSelector((state: Object): Object => state.fences);
	location = {
		...fallbackLocation,
		...location,
	};
	const initialRegion = params.region || location;

	const [ currentAccFences, setCurrentAccFences ] = useState([]);

	const [ region, setRegion ] = useState(initialRegion);
	const [ regionToReset, setRegionToReset ] = useState();
	const [ regionToResume, setRegionToResume ] = useState();
	const [ currenLocationInApp, setCurrenLocationInApp ] = useState();

	const { userProfile = {} } = useSelector((state: Object): Object => state.user);

	const isBasic = isBasicUser(userProfile.pro);

	useEffect(() => {
		if (isHelpVisible) {
			const data = currenLocationInApp || location;
			setCurrentAccFences([{
				extras: {
					...data,
					radius: overlayFenceRadius,
				},
			}]);
		} else {
			(async () => {
				const geofences = await dispatch(getCurrentAccountsFences());
				setCurrentAccFences(geofences);
			})();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		fence,
		isHelpVisible,
	]);

	const [ mapReady, setMapReady ] = useState(false);

	const {
		container,
		mapStyle,
		contentContainerStyle,
		infoContainer,
		infoIconStyle,
		infoTextStyle,
		premInfoContainerStyle,
		premInfoTextStyle,
		premIconStyle,
	} = getStyles({
		appLayout,
		mapReady,
		colors,
	});

	const takeMeToUpgrade = useCallback(() => {
		navigation.navigate('PremiumUpgradeScreen');
	}, [navigation]);

	const onPressNext = useCallback(() => {
		if (isBasic) {
			takeMeToUpgrade();
			return;
		}
		dispatch(resetFence());
		navigation.navigate('SelectArea', {
			region,
		});
	}, [dispatch, isBasic, navigation, region, takeMeToUpgrade]);

	const onEditFence = useCallback((fenceToEdit: Object) => {
		if (isBasic) {
			takeMeToUpgrade();
			return;
		}
		dispatch(setEditFence(fenceToEdit));
		navigation.navigate('EditGeoFence');
	}, [dispatch, isBasic, navigation, takeMeToUpgrade]);

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

	const renderMarker = useCallback((fenceC: Object, index: number): Object => {
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
					onPress={onEditFence}/>
				<MapView.Circle
					center={{
						latitude: extras.latitude,
						longitude: extras.longitude,
					}}
					radius={extras.radius}
					fillColor="rgba(226, 105, 1, 0.3)"
					strokeColor={colors.inAppBrandSecondary}/>
			</React.Fragment>
		);
	}, [colors.inAppBrandSecondary, onEditFence]);

	const closeHelp = useCallback(() => {
		setIsHelpVisible(false);
	}, [setIsHelpVisible]);

	const onUserLocationChange = useCallback((data: Object) => {
		(async () => {
			const {
				latitude: lat1,
				longitude: long1,
			} = currenLocationInApp || {};
			const {
				latitude: lat2,
				longitude: long2,
			} = data.nativeEvent.coordinate;
			if (lat1 !== lat2 || long1 !== long2) {
				setCurrenLocationInApp(data.nativeEvent.coordinate);
			}
		})();
	}, [currenLocationInApp]);

	useEffect(() => {
		(async () => {
			if (regionToReset) {
				setRegionToReset();
			}
			if (!isHelpVisible && regionToResume) {
				setRegion(regionToResume);
				setRegionToReset(regionToResume);
				setRegionToResume();
			}
			if (!isHelpVisible && pointCurrentLocation.x) {
				setPointCurrentLocation({});
			}
			if (isHelpVisible) {
				if (!regionToResume) {
					onPressFocusMyLocation();
					setRegionToResume(region);
				}
				if (mapRef && mapRef.current && typeof pointCurrentLocation.x === 'undefined') {
					const data = currenLocationInApp || location;
					const point = await mapRef.current.pointForCoordinate(data);
					if (point.x > 0 && point.y > 0) {
						setPointCurrentLocation(point);
					}
				}
			}
		})();
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
		currenLocationInApp,
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
				disabled={!true}/>
			{(!enableGeoFence && !isBasic) && <InfoBlock
				text={formatMessage(i18n.messageGFInActive)}
				appLayout={appLayout}
				infoContainer={infoContainer}
				infoIconStyle={infoIconStyle}
				textStyle={infoTextStyle}/>
			}
			{isBasic &&
				<TouchableOpacity
					onPress={takeMeToUpgrade}
					style={premInfoContainerStyle}>
					<IconTelldus
						icon={'premium'}
						style={premIconStyle}/>
					<View style={{
						flex: 1,
						flexDirection: 'row',
						flexWrap: 'wrap',
					}}>
						<Text
							style={premInfoTextStyle}>
							{formatMessage(i18n.geofencePremiumInfo)}
						</Text>
					</View>
				</TouchableOpacity>
			}
			<HelpOverlay
				closeHelp={closeHelp}
				isVisible={isHelpVisible}
				appLayout={appLayout}
				pointCurrentLocation={pointCurrentLocation}
				fenceRadius={overlayFenceRadius}/>
		</View>
	);
});

const getStyles = ({
	appLayout,
	mapReady,
	colors,
}: Object): Object => {
	const {
		statusRed,
	} = colors;
	const {
		darkBG,
		twine,
		paddingFactor,
		fontSizeFactorFour,
	} = Theme.Core;

	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const padding = deviceWidth * paddingFactor;

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
		infoContainer: {
			flex: 0,
			backgroundColor: statusRed,
			opacity: 0.7,
			position: 'absolute',
			top: 0,
			left: 0,
		},
		infoIconStyle: {
			color: '#fff',
			fontSize: Math.floor(deviceWidth * 0.09),
		},
		infoTextStyle: {
			color: '#fff',
		},
		premInfoTextStyle: {
			color: '#fff',
			marginLeft: padding,
			fontSize: Math.floor(deviceWidth * fontSizeFactorFour),
		},
		premIconStyle: {
			color: twine,
			fontSize: Math.floor(deviceWidth * 0.09),
		},
		premInfoContainerStyle: {
			flex: 0,
			flexDirection: 'row',
			justifyContent: 'flex-start',
			alignItems: 'center',
			width: '100%',
			backgroundColor: darkBG,
			opacity: 0.7,
			position: 'absolute',
			padding: padding,
			top: 0,
			left: 0,
		},
	};
};

export default (AddEditGeoFence: Object);
