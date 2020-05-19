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

import React, { useEffect, useState } from 'react';
import {
	StyleSheet,
	ScrollView,
	TextInput,
	TouchableOpacity,
} from 'react-native';
import MapView from 'react-native-maps';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	Text,
	TouchableButton,
	EmptyView,
} from '../../../BaseComponents';

import {
	RowWithAngle,
	TimePicker,
	MapOverlay,
	CurrentPositionMarker,
} from './SubViews';

import {
	setFenceActiveTime,
	setFenceTitle,
	setEditFence,
} from '../../Actions/Fences';
import {
	removeGeofence,
	addGeofence,
	ERROR_CODE_FENCE_NO_ACTION,
} from '../../Actions/GeoFence';

import {
	useDialogueBox,
} from '../../Hooks/Dialoguebox';

import GeoFenceUtils from '../../Lib/GeoFenceUtils';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

type Props = {
	navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
};

const EditGeoFence = React.memo<Object>((props: Props): Object => {
	const {
		navigation,
		appLayout,
		onDidMount,
	} = props;

	let { fence = {}, location } = useSelector((state: Object): Object => state.fences);
	location = location ? location : {};
	const {
		latitude: latitudeC = 55.70584,
		longitude: longitudeC = 13.19321,
	} = location;

	const {
		latitude,
		longitude,
		radius,
		title,
		identifier,
	} = fence;

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	useEffect(() => {
		onDidMount(formatMessage(i18n.editValue, {
			value: title,
		}), formatMessage(i18n.editDeleteGF));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [title]);

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
		textFieldStyle,
		rightItemStyle,
		overlayWidth,
	} = getStyles(appLayout);

	const lngDelta = GeoFenceUtils.getLngDeltaFromRadius(latitude, longitude, radius);
	const region = {
		latitude,
		longitude,
		latitudeDelta: lngDelta / 2,
		longitudeDelta: lngDelta,
	};

	function onPress(reg: Object) {
		navigation.navigate('EditGeoFenceAreaFull');
	}

	const [ timeInfo, setTimeInfo ] = useState({
		alwaysActive: true,
		fromHr: 0,
		fromMin: 0,
		toHr: 0,
		toMin: 0,
	});
	const {
		alwaysActive: aA,
		fromHr: fH,
		fromMin: fM,
		toHr: tH,
		toMin: tM,
	} = timeInfo;

	const dispatch = useDispatch();
	const [ areaName, setAreaName ] = useState(fence.title);
	const [ editName, setEditName ] = useState(false);

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	function onSave() {
		dispatch(setFenceActiveTime(aA, fH, fM, tH, tM));
		dispatch(setFenceTitle(areaName));
		dispatch(addGeofence(true)).then(() => {
			navigation.goBack();
		}).catch((err: Object = {}) => {
			let message = 'Could not save fence. Please try again later.'; // TODO: Translate
			if (err.code && err.code === ERROR_CODE_FENCE_NO_ACTION) {
				message = 'No actions are selected to execute on Entry/Exit. Please select any action to perform.'; // TODO: Translate
			}
			toggleDialogueBoxState({
				show: true,
				showHeader: true,
				imageHeader: true,
				text: message,
				showPositive: true,
			});
		});
	}

	function onDelete() {
		dispatch(removeGeofence(identifier));
		dispatch(setEditFence({}));
		navigation.goBack();
	}

	function onEditArriving() {
		navigation.navigate('ArrivingActions', {
			isEditMode: true,
		});
	}

	function onEditLeaving() {
		navigation.navigate('LeavingActions', {
			isEditMode: true,
		});
	}

	function onChangeTime(
		alwaysActive: boolean,
		fromHr: number,
		fromMin: number,
		toHr: number,
		toMin: number,
	) {
		setTimeInfo({
			alwaysActive,
			fromHr,
			fromMin,
			toHr,
			toMin,
		});
	}

	function onEditName() {
		setEditName(true);
	}

	function onSubmitEditing() {
		setEditName(false);
	}

	function onChangeText(value: string) {
		setAreaName(value);
	}

	if (typeof fence.latitude === 'undefined') {
		return <EmptyView/>;
	}

	return (
		<ScrollView
			style={container}
			contentContainerStyle={contentContainerStyle}>
			<View style={rowContainer}>

				<View style={rowStyle}>
					<Text style={leftItemStyle}>
						{formatMessage(i18n.name)}
					</Text>
					{editName ?
						<TextInput
							value={areaName}
							style={textFieldStyle}
							onChangeText={onChangeText}
							onSubmitEditing={onSubmitEditing}
							autoCorrect={false}
							autoFocus={true}
							returnKeyType={'done'}
						/>
						:
						<TouchableOpacity onPress={onEditName} style={rightItemStyle}>
							<Text style={rightTextItemStyle}>
								{areaName}
							</Text>
						</TouchableOpacity>
					}
				</View>
				<RowWithAngle
					labelText={formatMessage(i18n.arrivingActions)}
					onPress={onEditArriving}/>
				<RowWithAngle
					labelText={formatMessage(i18n.leavingActions)}
					onPress={onEditLeaving}/>
				<TimePicker
					onChange={onChangeTime}
					value={{
						alwaysActive: fence.isAlwaysActive,
						fromHr: fence.fromHr,
						fromMin: fence.fromMin,
						toHr: fence.toHr,
						toMin: fence.toMin,
					}}
					labelStyle={leftItemStyle}
					rowStyle={rowStyle}
					appLayout={appLayout}
					intl={intl}/>
			</View>
			<View style={mapCover}>
				<MapView.Animated
					style={mapStyle}
					scrollEnabled={false}
					initialRegion={new MapView.AnimatedRegion(region)}
					region={new MapView.AnimatedRegion(region)}
					onPress={onPress}>
					<CurrentPositionMarker
						latitude={latitudeC}
						longitude={longitudeC}
						appLayout={appLayout}
						tracksViewChanges={false}/>
				</MapView.Animated>
				<MapOverlay
					overlayWidth={overlayWidth}/>
			</View>
			<TouchableButton
				text={i18n.confirmAndSave}
				style={buttonStyle}
				labelStyle={labelStyle}
				onPress={onSave}
				accessible={true}/>
			<TouchableButton
				text={i18n.delete}
				style={[buttonStyle, {
					backgroundColor: Theme.Core.brandDanger,
				}]}
				labelStyle={labelStyle}
				onPress={onDelete}
				accessible={true}
			/>
		</ScrollView>
	);
});

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		eulaContentColor,
		rowTextColor,
		shadow,
		angledRowBorderColor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const fontSize = deviceWidth * 0.04;

	const fontSizeButtonLabel = deviceWidth * 0.033;

	return {
		overlayWidth: deviceWidth - (2 * padding),
		container: {
			flex: 1,
		},
		contentContainerStyle: {
			flexGrow: 1,
			paddingBottom: padding * 4,
		},
		mapCover: {
			marginHorizontal: padding,
			marginTop: padding * 2,
			marginBottom: padding,
			height: deviceWidth * 1.2,
			width: deviceWidth - (2 * padding),
			overflow: 'hidden',
			alignItems: 'center',
			justifyContent: 'center',
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
			backgroundColor: '#fff',
			flexDirection: 'row',
			justifyContent: 'space-between',
			borderColor: angledRowBorderColor,
			borderBottomWidth: StyleSheet.hairlineWidth,
			height: undefined,
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
		textFieldStyle: {
			color: eulaContentColor,
			fontSize,
			textAlign: 'right',
		},
		rightItemStyle: {
			alignItems: 'flex-end',
			justifyContent: 'center',
		},
	};
};

export default EditGeoFence;
