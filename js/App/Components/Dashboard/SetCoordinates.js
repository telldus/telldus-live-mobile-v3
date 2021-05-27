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
	useMemo,
} from 'react';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import {
	LayoutAnimation,
	StyleSheet,
} from 'react-native';
import MapView from 'react-native-maps';
import { useIntl } from 'react-intl';

import {
	View,
	ThemedScrollView,
	FloatingButton,
} from '../../../BaseComponents';

import {
	LayoutAnimations,
	getDefaultMapCoordinates,
} from '../../Lib';
import {
	getCurrentLocation,
} from '../../Actions/GeoFence';
import {
	useAppTheme,
} from '../../Hooks/Theme';

import {
	SelectCoordinatesDD,
} from './SubViews';

import {
	useDialogueBox,
} from '../../Hooks/Dialoguebox';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

const SetCoordinates = memo<Object>((props: Object): Object => {
	const {
		onDidMount,
		navigation,
		route,
	} = props;

	const {
		colorScheme,
	} = useAppTheme();

	const {
		formatMessage,
	} = useIntl();
	const {
		toggleDialogueBoxState,
	} = useDialogueBox();
	const dispatch = useDispatch();

	const deltaDef = 0.05;
	const MANUAL_ID = 'manual';
	const MANUAL_VALUE = formatMessage(i18n.labelManual);

	const { layout } = useSelector((state: Object): Object => state.app);
	const { byId = {} } = useSelector((state: Object): Object => state.gateways);
	const { location: _location = {} } = useSelector((state: Object): Object => state.fences);

	let location: Object = (_location && _location.longitude) ? _location : getDefaultMapCoordinates();

	const {
		selectedType,
		uniqueId,
	} = route.params || {};

	const [
		manualLocation,
		setManualLocation,
	] = useState(location);
	const [
		selectedId,
		setSelectedId,
	] = useState();
	let {
		items,
		itemsObject,
		value,
		key,
	} = useMemo((): Object => {
		let _value = selectedId === MANUAL_ID ? MANUAL_VALUE : '',
			_key = selectedId === MANUAL_ID ? MANUAL_ID : '';
		let _items = [], _itemsObject = {
			[MANUAL_ID]: {
				key: MANUAL_ID,
				value: MANUAL_VALUE,
				longitude: manualLocation.longitude,
				latitude: manualLocation.latitude,
			},
		};
		const byIdKeys = Object.keys(byId);
		if (byIdKeys.length === 0) {
			_value = MANUAL_VALUE;
			_key = MANUAL_ID;
		}
		byIdKeys.forEach((_id: string): Object => {
			const _item = byId[_id];
			if (_id === selectedId || !_value) {
				_value = _item.name;
				_key = _id;
			}
			_items.push({
				key: _id,
				value: _item.name,
				longitude: _item.longitude,
				latitude: _item.latitude,
			});
			_itemsObject = {
				..._itemsObject,
				[_id]: {
					key: _id,
					value: _item.name,
					longitude: _item.longitude,
					latitude: _item.latitude,
				},
			};
		});
		_items.push({
			key: MANUAL_ID,
			value: MANUAL_VALUE,
			longitude: manualLocation.longitude,
			latitude: manualLocation.latitude,
		});
		return {
			items: _items,
			value: _value,
			key: _key,
			itemsObject: _itemsObject,
		};
	}, [MANUAL_VALUE, byId, manualLocation.latitude, manualLocation.longitude, selectedId]);

	const {
		latitude,
		longitude,
	} = itemsObject[key];
	const manual = key === MANUAL_ID;

	useEffect(() => {
		dispatch(getCurrentLocation()).then((res: Object) => {
			const {
				coords = {},
			} = res;
			setManualLocation(coords);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		onDidMount(formatMessage(i18n.headerOnePosition), formatMessage(i18n.headerTwoPosition));
	}, [formatMessage, onDidMount]);

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
		const invalidMessage = formatMessage(i18n.messageInvalidCoordinates);

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
			id: key,
			latitude,
			longitude,
		});
	}, [formatMessage, latitude, longitude, navigation, selectedType, uniqueId, key, showDialogue]);

	const _setConfig = useCallback((_value: string, itemIndex: number, data: Array<any>) => {
		setSelectedId(data[itemIndex].key);
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
	}, []);

	const onRegionChangeComplete = useCallback((reg: Object) => {
		if (manual) {
			setManualLocation(reg);
		}
	}, [manual]);

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
				contentContainerStyle={{flexGrow: 1}}>
				<View style={body}>
					<SelectCoordinatesDD
						setConfig={_setConfig}
						items={items}
						value={value}/>
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
							scrollEnabled={manual}>
							<MapView.Marker.Animated
								image={{uri: colorScheme === 'dark' ? 'marker_white' : 'marker'}}
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

export default (SetCoordinates: Object);
