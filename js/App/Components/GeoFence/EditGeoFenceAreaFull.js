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
	useEffect,
	useState,
	useCallback,
} from 'react';
import {
	StyleSheet,
	ScrollView,
} from 'react-native';
import MapView from 'react-native-maps';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	FloatingButton,
} from '../../../BaseComponents';

import {
	MapOverlay,
} from './SubViews';

import {
	setFenceArea,
} from '../../Actions/Fences';

import GeoFenceUtils from '../../Lib/GeoFenceUtils';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

type Props = {
	navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
};

const EditGeoFenceAreaFull = React.memo<Object>((props: Props): Object => {
	const {
		navigation,
		appLayout,
		onDidMount,
	} = props;

	let { fence } = useSelector((state: Object): Object => state.fences);

	const {
		latitude,
		longitude,
		radius,
		title,
	} = fence;

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	useEffect(() => {
		onDidMount(formatMessage(i18n.editValue, {
			value: title,
		}), formatMessage(i18n.editArea));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [title]);

	const {
		mapStyle,
		contentContainerStyle,
		container,
	} = getStyles(appLayout);

	const lngDelta = GeoFenceUtils.getLngDeltaFromRadius(latitude, longitude, radius);
	const region = {
		latitude,
		longitude,
		latitudeDelta: lngDelta / 2,
		longitudeDelta: lngDelta,
	};
	const [initialRegion, setInitialRegion] = useState(region);

	const onRegionChangeComplete = useCallback((reg: Object) => {
		setInitialRegion(reg);
	}, []);

	const dispatch = useDispatch();
	const { userId } = useSelector((state: Object): Object => state.user);

	const onPressNext = useCallback(() => {
		const {
			latitude: lat,
			longitude: long,
		} = initialRegion;
		dispatch(setFenceArea(
			lat,
			long,
			GeoFenceUtils.getRadiusFromRegion(initialRegion),
			userId,
		));
		navigation.goBack();
	}, [dispatch, initialRegion, navigation, userId]);

	return (
		<View style={{
			flex: 1,
		}}>
			<ScrollView
				style={container}
				contentContainerStyle={contentContainerStyle}>
				<MapView.Animated
					style={mapStyle}
					initialRegion={new MapView.AnimatedRegion(initialRegion)}
					onRegionChangeComplete={onRegionChangeComplete}
					loadingEnabled={true}
					showsTraffic={false}
					showsUserLocation={true}/>
				<MapOverlay/>
			</ScrollView>
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'right_arrow_key'}}/>
		</View>
	);
});

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
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
		mapStyle: {
			...StyleSheet.absoluteFillObject,
		},
		contentContainerStyle: {
			flexGrow: 1,
		},
		mapCover: {
			flex: 1,
			marginHorizontal: padding,
			marginTop: padding * 2,
			marginBottom: padding,
			height: deviceWidth * 1.2,
			width: deviceWidth - (2 * padding),
		},
	};
};

export default (EditGeoFenceAreaFull: Object);
