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
};

const AddEditGeoFence = React.memo<Object>((props: Props): Object => {
	const {
		navigation,
		appLayout,
	} = props;

	const dispatch = useDispatch();

	let { location } = useSelector((state: Object): Object => state.fences);
	location = location ? location : {};

	function onPressNext() {
		dispatch(resetFence());
		navigation.navigate('SelectArea');
	}

	const [ activeFenceIndex, setActiveFenceIndex ] = useState(0);
	const [ currentAccFences, setCurrentAccFences ] = useState([]);

	useEffect(() => {
		(async () => {
			const geofences = await dispatch(getCurrentAccountsFences());
			setCurrentAccFences(geofences);
		})();// TODO : Do render after deleting(now the fences are not in redux)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	function onEditFence(fence: Object) {
		dispatch(setEditFence(fence));
		setActiveFenceIndex(0);
		navigation.navigate('EditGeoFence');
	}

	function renderMarker(fence: Object, index: number): Object {
		if (!fence) {
			return;
		}

		const {
			extras = {},
			...others
		} = fence;

		function onEditFenceInner() {
			const _fence = {
				...extras,
				...others,
			};
			onEditFence(_fence);
		}

		return (
			<MapView.Marker
				key={`${index}`}
				image={{uri: 'marker'}}
				coordinate={{ latitude: extras.latitude, longitude: extras.longitude }}>
				<MapView.Callout onPress={onEditFenceInner}>
					<FenceCallout
						title={extras.title}/>
				</MapView.Callout>
			</MapView.Marker>
		);
	}

	return (
		<View style={{flex: 1}}>
			<ScrollView
				style={container}
				contentContainerStyle={contentContainerStyle}>
				<MapView.Animated
					style={mapStyle}
					initialRegion={region}>
					{
						currentAccFences.map((fence: Object, index: number): () => Object => {
							return renderMarker(fence, index);
						})
					}
					{currentAccFences.length > 0 && <MapView.Circle
						key={`fence-${activeFenceIndex}`}
						center={{
							latitude: currentAccFences[activeFenceIndex].latitude,
							longitude: currentAccFences[activeFenceIndex].longitude,
						}}
						radius={currentAccFences[activeFenceIndex].radius}
						fillColor="rgba(226, 105, 1, 0.3)"
						strokeColor={Theme.Core.brandSecondary}/>
					}
				</MapView.Animated>
			</ScrollView>
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'icon_plus'}}/>
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
