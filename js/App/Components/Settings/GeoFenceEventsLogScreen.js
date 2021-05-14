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
	useState,
	useMemo,
} from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	SectionList,
} from 'react-native';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import { useIntl } from 'react-intl';
import orderBy from 'lodash/orderBy';

import {
	View,
	NavigationHeader,
	PosterWithText,
	Text,
	TouchableButton,
	ThemedSwitch,
} from '../../../BaseComponents';
import {
	GeoFenceEventsLogRow,
} from './SubViews';

import {
	useDialogueBox,
} from '../../Hooks/Dialoguebox';
import {
	clearAllOnGeoFencesLog,
} from '../../Actions/GeoFence';
import {
	getGeoFenceEvents,
	clearGeoFenceEvents,
} from '../../Actions/LocalStorage';

import Theme from '../../Theme';

type Props = {
	navigation: Object,
};

function prepareListData(data: Array<Object>, {
	formatDate,
	formatTime,
	sQLite,
}: Object): Array<Object> {
	let listData = [];
	data.map((event: Object) => {
		const {
			location = {},
			action,
			extras = {},
			identifier,
			inAppTime,
			checkpoints,
		} = event || {};

		if (sQLite) {
			listData.push({
				header: event.timestamp,
				data: [
					{
						key: 'in app time',
						'in app time': `${formatDate(parseInt(inAppTime, 10))} ${formatTime(parseInt(inAppTime, 10))}`,
					},
					{
						key: 'action',
						action,
					},
					{
						key: 'fence name',
						'fence name': event.title,
					},
					{
						key: 'identifier',
						identifier,
					}],
			});
		} else {
			const {
				timestamp,
				geofence = {},
			} = location;
			const {
				// eslint-disable-next-line no-unused-vars
				extras: extrasDup2,
				...others
			} = geofence;
			const geofenceWithoutDupExtras = {
				...others,
			};

			const {
				arriving,
				leaving,
				title,
				...otherExtras
			} = extras;

			if (timestamp) {
				listData.push({
					header: timestamp,
					data: [
						{
							key: 'location',
							location: {
								...location,
								geofence: geofenceWithoutDupExtras,
							},
						},
						{
							key: 'in app time',
							'in app time': `${formatDate(inAppTime)} ${formatTime(inAppTime)}`,
						},
						{
							key: 'action',
							action,
						},
						{
							key: 'fence name',
							'fence name': title,
						},
						{
							key: 'arriving actions',
							'arriving actions': arriving,
						},
						{
							key: 'leaving actions',
							'leaving actions': leaving,
						},
						{
							key: 'checkpoints',
							'checkpoints': checkpoints,
						},
						{
							key: 'extras',
							extras: otherExtras,
						},
						{
							key: 'identifier',
							identifier,
						}],
				});
			}
		}
	});

	return orderBy(listData, 'header', ['desc']);
}

const GeoFenceEventsLogScreen = memo<Object>((props: Props): Object => {

	const {
		navigation,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);
	const { onGeofence = [] } = useSelector((state: Object): Object => state.geoFence) || {};

	const intl = useIntl();
	const {
		formatDate,
		formatTime,
	} = intl;

	const {
		sectionCover,
		sectionLabel,
		contentContainerStyle,
		emptyTextStyle,
		switchCircleSize,
		switchContainerStyle,
		switchTextStyle,
	} = getStyles(layout);

	const [ sQLite, setSQLite ] = useState(false);

	const _listData = useMemo((): Array<Object> => {
		return prepareListData(onGeofence, {
			formatDate,
			formatTime,
			sQLite,
		});
	}, [formatDate, formatTime, onGeofence, sQLite]);
	const [ listData, setListData ] = useState(_listData);

	const getGeoFenceEventsSQLite = useCallback(async (): Promise<any> => {
		const sQLiteData = await getGeoFenceEvents();
		return sQLiteData;
	}, []);

	const renderRow = useCallback(({item, index}: Object): Object => {
		const {
			key,
			...others
		} = item;
		const val = others[key];
		return (
			<GeoFenceEventsLogRow
				key={`${key}-${index}`}
				val={val}
				label={key}/>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [layout]);

	const renderSectionHeader = useCallback(({section, index}: Object): Object => {
		return (
			<View style={sectionCover}>
				<Text
					level={5}
					style={sectionLabel}>
					{formatDate(section.header)} {formatTime(section.header)}
				</Text>
			</View>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [layout]);

	const keyExtractor = useCallback((data: Object): Object => {
		return data.key;
	}, []);

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();
	const dispatch = useDispatch();
	const onPressClear = useCallback(() => {
		toggleDialogueBoxState({
			show: true,
			showPositive: true,
			showNegative: true,
			positiveText: 'CLEAR',
			showHeader: true,
			header: 'Clear?',
			text: 'All logs will be lost forever!',
			onPressPositive: () => {
				dispatch(clearAllOnGeoFencesLog());
				clearGeoFenceEvents();
				toggleDialogueBoxState({
					show: false,
				});
				setListData(_listData);
				setSQLite(false);
			},
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [_listData]);

	const onValueChange = useCallback(async () => {
		if (!sQLite) {
			const listDataSQL = await getGeoFenceEventsSQLite();
			const _listDataSQL = prepareListData(listDataSQL, {
				formatDate,
				formatTime,
				sQLite: true,
			});
			setListData(_listDataSQL);
		} else {
			setListData(_listData);
		}
		setSQLite(!sQLite);
	}, [sQLite, getGeoFenceEventsSQLite, formatDate, formatTime, _listData]);

	return (
		<View
			level={3}
			style={{
				flex: 1,
			}}>
			<NavigationHeader
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}/>
			<KeyboardAvoidingView
				behavior="padding"
				style={{flex: 1}}
				contentContainerStyle={{ justifyContent: 'center'}}
				enabled
				keyboardVerticalOffset={Platform.OS === 'android' ? -500 : 0}>
				<PosterWithText
					appLayout={layout}
					align={'center'}
					h2={'Events Log'}
					extraData={{sQLite}}
					customComponent={
						<View style={switchContainerStyle}>
							<Text
								level={16}
								style={switchTextStyle}>
                Show SQLite Data:
							</Text>
							<ThemedSwitch
								onValueChange={onValueChange}
								backgroundActive={'#fff'}
								backgroundInactive={'#fff'}
								value={sQLite}
								switchBorderRadius={30}
								circleSize={switchCircleSize}/>
						</View>
					}
					navigation={navigation}/>
				{listData.length === 0 ?
					<Text
						level={2}
						style={emptyTextStyle}>
                Empty
					</Text>
					:
					<>
						<SectionList
							sections={listData}
							renderItem={renderRow}
							renderSectionHeader={renderSectionHeader}
							stickySectionHeadersEnabled={true}
							keyExtractor={keyExtractor}
							contentContainerStyle={contentContainerStyle}/>
						<TouchableButton
							text={'CLEAR LOG'}
							onPress={onPressClear}
							style={{
								marginBottom: 10,
							}}/>
					</>
				}
			</KeyboardAvoidingView>
		</View>
	);
});

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		fontSizeFactorFour,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorFour);

	const switchCircleSize = deviceWidth * 0.06;

	return {
		switchCircleSize,
		contentContainerStyle: {
			flexGrow: 1,
			paddingVertical: padding,
		},
		itemsContainer: {
			flex: 1,
			paddingHorizontal: padding,
			paddingBottom: padding,
			paddingTop: padding * 1.5,
		},
		touchableStyle: {
			height: fontSize * 3.1,
		},
		contentCoverStyle: {
			marginBottom: fontSize / 2,
		},
		sectionCover: {
			marginLeft: padding,
			marginBottom: 5,
		},
		emptyTextStyle: {
			marginTop: 10,
			fontSize,
			alignSelf: 'center',
		},
		sectionLabel: {
			fontSize,
			justifyContent: 'center',
			marginRight: 5,
			marginTop: 5,
		},
		switchTextStyle: {
			fontSize,
			marginRight: 5,
		},
		switchContainerStyle: {
			position: 'absolute',
			flexDirection: 'row',
			justifyContent: 'center',
			alignSelf: 'center',
			right: padding,
			bottom: padding,
		},
	};
};

export default (GeoFenceEventsLogScreen: Object);
