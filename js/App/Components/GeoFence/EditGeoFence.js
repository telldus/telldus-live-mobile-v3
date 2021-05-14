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
	TextInput,
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
	TouchableOpacity,
} from '../../../BaseComponents';

import {
	RowWithAngle,
	TimePicker,
	MapOverlay,
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
import {
	useAppTheme,
} from '../../Hooks/Theme';

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

	let { fence = {} } = useSelector((state: Object): Object => state.fences);

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

	const {
		colors,
	} = useAppTheme();

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
		overlayWidth,
		infoContainer,
		infoTextStyle,
	} = getStyles({
		appLayout,
		colors,
	});

	const lngDelta = GeoFenceUtils.getLngDeltaFromRadius(latitude, longitude, radius);
	const region = {
		latitude,
		longitude,
		latitudeDelta: lngDelta / 2,
		longitudeDelta: lngDelta,
	};

	const onPress = useCallback((reg: Object) => {
		navigation.navigate('EditGeoFenceAreaFull');
	}, [navigation]);

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

	const onSave = useCallback(() => {
		dispatch(setFenceActiveTime(aA, fH, fM, tH, tM));
		dispatch(setFenceTitle(areaName));
		dispatch(addGeofence(true)).then(() => {
			navigation.goBack();
		}).catch((err: Object = {}) => {
			let message = formatMessage(i18n.cantSaveGF);
			if (err.code && err.code === ERROR_CODE_FENCE_NO_ACTION) {
				message = formatMessage(i18n.noActionSelected);
			}
			toggleDialogueBoxState({
				show: true,
				showHeader: true,
				imageHeader: true,
				text: message,
				showPositive: true,
			});
		});
	}, [aA, areaName, dispatch, fH, fM, formatMessage, navigation, tH, tM, toggleDialogueBoxState]);

	const onDelete = useCallback(() => {
		toggleDialogueBoxState({
			show: true,
			showHeader: true,
			imageHeader: true,
			text: formatMessage(i18n.deleteGFenceBody),
			header: `${formatMessage(i18n.deleteGFence)}?`,
			psotiveText: formatMessage(i18n.delete),
			showPositive: true,
			showNegative: true,
			onPressPositive: () => {
				toggleDialogueBoxState({
					show: false,
				});
				dispatch(removeGeofence(identifier));
				dispatch(setEditFence({}));
				navigation.goBack();
			},
			onPressNegative: () => {
				toggleDialogueBoxState({
					show: false,
				});
			},
		});
	}, [dispatch, formatMessage, identifier, navigation, toggleDialogueBoxState]);

	const onEditArriving = useCallback(() => {
		navigation.navigate('ArrivingActions', {
			isEditMode: true,
		});
	}, [navigation]);

	const onEditLeaving = useCallback(() => {
		navigation.navigate('LeavingActions', {
			isEditMode: true,
		});
	}, [navigation]);

	const onChangeTime = useCallback((
		alwaysActive: boolean,
		fromHr: number,
		fromMin: number,
		toHr: number,
		toMin: number,
	) => {
		setTimeInfo({
			alwaysActive,
			fromHr,
			fromMin,
			toHr,
			toMin,
		});
	}, []);

	const onEditName = useCallback(() => {
		setEditName(true);
	}, []);

	const onSubmitEditing = useCallback(() => {
		setEditName(false);
	}, []);

	const onChangeText = useCallback((value: string) => {
		setAreaName(value);
	}, []);

	if (typeof fence.latitude === 'undefined') {
		return <EmptyView/>;
	}

	return (
		<ScrollView
			style={container}
			contentContainerStyle={contentContainerStyle}>
			<View style={rowContainer}>
				<TouchableOpacity
					level={2}
					onPress={onEditName}
					disabled={editName}
					style={rowStyle}>
					<Text
						level={3}
						style={leftItemStyle}>
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
						<Text style={rightTextItemStyle}>
							{areaName}
						</Text>
					}
				</TouchableOpacity>
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
					zoomEnabled={false}
					zoomTapEnabled={false}
					zoomControlEnabled={false}
					rotateEnabled={false}
					pitchEnabled={false}
					initialRegion={new MapView.AnimatedRegion(region)}
					region={new MapView.AnimatedRegion(region)}
					onPress={onPress}
					loadingEnabled={true}
					showsTraffic={false}
					showsUserLocation={true}/>
				<MapOverlay
					overlayWidth={overlayWidth}/>
				<View
					style={infoContainer}>
					<Text style={infoTextStyle}>
						{formatMessage(i18n.tapOnTheMap)}
					</Text>
				</View>
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

const getStyles = ({
	appLayout,
	colors,
}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		eulaContentColor,
		rowTextColor,
		shadow,
		fontSizeFactorFour,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const fontSize = deviceWidth * fontSizeFactorFour;

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
			flexDirection: 'row',
			justifyContent: 'space-between',
			height: undefined,
			marginHorizontal: padding,
			borderRadius: 2,
			marginBottom: padding / 2,
			...shadow,
		},
		leftItemStyle: {
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
			flex: 1,
			color: eulaContentColor,
			fontSize,
			textAlign: 'right',
		},
		infoContainer: {
			flex: 0,
			width: '100%',
			opacity: 0.7,
			backgroundColor: colors.inAppBrandSecondary,
			position: 'absolute',
			top: 0,
			left: 0,
			justifyContent: 'center',
			alignItems: 'center',
			padding,
		},
		infoTextStyle: {
			color: '#fff',
			textAlign: 'center',
			fontSize: fontSize * 0.9,
		},
	};
};

export default (EditGeoFence: Object);
