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

import React, { useEffect } from 'react';
import {
	StyleSheet,
	ScrollView,
} from 'react-native';
import MapView, {
	Circle,
	AnimatedRegion,
} from 'react-native-maps';

import {
	View,
	Text,
	FloatingButton,
	TouchableButton,
} from '../../../BaseComponents';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

type Props = {
	navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
};

const EditGeoFence = (props: Props): Object => {
	const {
		navigation,
		appLayout,
		onDidMount,
	} = props;

	useEffect(() => {
		let name = 'area name';
		onDidMount(`Edit ${name}`, 'Edit or delete geo fence');
	}, []);

	function onPressNext() {
		navigation.navigate({
			routeName: 'AppTab',
			key: 'AppTab',
		});
	}

	const {
		container,
		contentContainerStyle,
		mapStyle,
		rowContainer,
		rowStyle,
		leftItemStyle,
		rightTextItemStyle,
		mapCover,
		buttonStyle,
		labelStyle,
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

	function onSave() {
	}

	function onDelete() {
	}

	return (
		<ScrollView
			style={container}
			contentContainerStyle={contentContainerStyle}>
			<View style={rowContainer}>
				<View style={rowStyle}>
					<Text style={leftItemStyle}>
						Name
					</Text>
					<Text style={rightTextItemStyle}>
						Area name
					</Text>
				</View>
				<View style={rowStyle}>
					<Text style={leftItemStyle}>
						Arriving actions
					</Text>
				</View>
				<View style={rowStyle}>
					<Text style={leftItemStyle}>
						Leaving actions
					</Text>
				</View>
				<View style={rowStyle}>
					<Text style={leftItemStyle}>
						Always active
					</Text>
				</View>
			</View>
			<View style={mapCover}>
				<MapView.Animated
					style={mapStyle}
					ref={setRefMap}
					region={region}>
					<MapView.Marker.Animated
						ref={setRefMarker}
						coordinate={coordinate}>
					</MapView.Marker.Animated>
					<Circle
						center={circleCenter}
						radius={3000}
						fillColor={'#e2690150'}
						strokeColor={Theme.Core.brandSecondary}/>
				</MapView.Animated>
			</View>
			<TouchableButton
				text={i18n.confirmAndSave}
				style={buttonStyle}
				labelStyle={labelStyle}
				onPress={onSave}
				accessible={true}
			/>
			<TouchableButton
				text={i18n.delete}
				style={[buttonStyle, {
					backgroundColor: Theme.Core.brandDanger,
				}]}
				labelStyle={labelStyle}
				onPress={onDelete}
				accessible={true}
			/>
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'right_arrow_key'}}/>
		</ScrollView>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		eulaContentColor,
		rowTextColor,
		shadow,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const fontSize = deviceWidth * 0.04;

	const fontSizeButtonLabel = deviceWidth * 0.033;

	return {
		container: {
			flex: 1,
		},
		contentContainerStyle: {
			flexGrow: 1,
			paddingBottom: padding * 6,
		},
		mapCover: {
			marginHorizontal: padding,
			marginTop: padding * 2,
			marginBottom: padding,
			height: deviceWidth * 0.9,
			width: deviceWidth - (2 * padding),
		},
		mapStyle: {
			borderRadius: 5,
			...StyleSheet.absoluteFillObject,
		},
		rowContainer: {
			marginTop: padding * 3,
		},
		rowStyle: {
			padding: padding * 1.5,
			marginBottom: 1,
			backgroundColor: '#fff',
			flexDirection: 'row',
			justifyContent: 'space-between',
		},
		leftItemStyle: {
			color: eulaContentColor,
			fontSize,
		},
		rightTextItemStyle: {
			color: rowTextColor,
			fontSize,
		},
		buttonStyle: {
			maxWidth: undefined,
			...shadow,
			marginTop: padding,
		},
		labelStyle: {
			fontSize: fontSizeButtonLabel,
		},
	};
};

export default EditGeoFence;
