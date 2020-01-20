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
} from '../../../BaseComponents';
import {
	FenceCallout,
} from './SubViews';

import {
	setEditFence,
} from '../../Actions/Fences';

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

	let { fences, location } = useSelector((state: Object): Object => state.fences);
	location = location ? location : {};

	function onPressNext() {
		navigation.navigate({
			routeName: 'SelectArea',
			key: 'SelectArea',
		});
	}

	const dispatch = useDispatch();

	const [ activeFenceIndex, setActiveFenceIndex ] = useState(0);

	const {
		container,
		mapStyle,
		contentContainerStyle,
	} = getStyles(appLayout);

	const {
		latitude = 55.70584,
		longitude = 13.19321,
		latitudeDelta = 0.24442,
		longitudeDelta = 0.24442,
	} = location;
	fences = (fences && fences.length > 0) ? fences : [{
		latitude,
		longitude,
		radius: 3000,
		title: 'Home',
	}];
	const region = new AnimatedRegion({
		latitude,
		longitude,
		latitudeDelta,
		longitudeDelta,
	});

	function setActiveFence(index: number) {
		setActiveFenceIndex(index);
	}

	function onEditFence(index: number) {
		dispatch(setEditFence(index));
		setActiveFenceIndex(0);
		navigation.navigate({
			routeName: 'EditGeoFence',
			key: 'EditGeoFence',
		});
	}

	function renderMarker(fence: Object, index: number): Object {

		function setActiveFenceInner() {
			setActiveFence(index);
		}

		function onEditFenceInner() {
			onEditFence(index);
		}

		return (
			<MapView.Marker
				key={`${index}`}
				image={{uri: 'marker'}}
				title={'Home'}
				coordinate={{ latitude: fence.latitude, longitude: fence.longitude }}
				onPress={setActiveFenceInner}>
				<MapView.Callout onPress={onEditFenceInner}>
					<FenceCallout
						title={fence.title}
						onEdit={onEditFenceInner}
					/>
				</MapView.Callout>
			</MapView.Marker>
		);
	}

	return (
		<ScrollView
			style={container}
			contentContainerStyle={contentContainerStyle}>
			<MapView.Animated
				style={mapStyle}
				initialRegion={region}>
				{
					fences.map((fence: Object, index: number): () => Object => {
						return renderMarker(fence, index);
					})
				}
				<MapView.Circle
					key={`fence-${activeFenceIndex}`}
					center={{
						latitude: fences[activeFenceIndex].latitude,
						longitude: fences[activeFenceIndex].longitude,
					}}
					radius={fences[activeFenceIndex].radius}
					fillColor="rgba(226, 105, 1, 0.3)"
					strokeColor={Theme.Core.brandSecondary}/>

			</MapView.Animated>
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'icon_plus'}}/>
		</ScrollView>
	);
};

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
