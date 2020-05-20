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
	FloatingButton,
	View,
} from '../../../BaseComponents';
import {
	MapOverlay,
	CurrentPositionMarker,
} from './SubViews';

import {
	setFenceArea,
} from '../../Actions/Fences';
import GeoFenceUtils from '../../Lib/GeoFenceUtils';

import i18n from '../../Translations/common';

type Props = {
	navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
};

const SelectArea = React.memo<Object>((props: Props): Object => {
	const {
		navigation,
		appLayout,
		onDidMount,
	} = props;

	const dispatch = useDispatch();

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const { userId } = useSelector((state: Object): Object => state.user);
	let { location } = useSelector((state: Object): Object => state.fences);
	location = location ? location : {};

	const {
		latitude = 55.70584,
		longitude = 13.19321,
		latitudeDelta = 0.1,
		longitudeDelta = 0.1,
	} = location;
	const region = {
		latitude,
		longitude,
		latitudeDelta,
		longitudeDelta,
	};
	const [initialRegion, setInitialRegion] = useState(region);

	useEffect(() => {
		onDidMount(`1. ${formatMessage(i18n.area)}`, formatMessage(i18n.selectArea));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function onPressNext() {
		const {
			latitude: lat,
			longitude: long,
		} = initialRegion;
		dispatch(setFenceArea(lat, long, GeoFenceUtils.getRadiusFromRegion(initialRegion), userId));
		navigation.navigate('SetAreaName');
	}

	const {
		container,
		mapStyle,
		contentContainerStyle,
	} = getStyles(appLayout);

	function onRegionChangeComplete(reg: Object) {
		setInitialRegion(reg);
	}

	return (
		<View style={{flex: 1}}>
			<ScrollView
				style={container}
				contentContainerStyle={contentContainerStyle}>
				<MapView.Animated
					style={mapStyle}
					loadingEnabled={true}
					showsTraffic={false}
					showsUserLocation={true}
					initialRegion={new MapView.AnimatedRegion(initialRegion)}
					onRegionChangeComplete={onRegionChangeComplete}/>
				<MapOverlay/>
			</ScrollView>
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'right_arrow_key'}}/>
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

export default SelectArea;
