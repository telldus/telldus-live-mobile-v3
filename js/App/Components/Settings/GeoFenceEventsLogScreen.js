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

import Theme from '../../Theme';

type Props = {
	navigation: Object,
};

function prepareListData(data: Array<Object>, {
	formatDate,
	formatTime,
}: Object): Array<Object> {
	let listData = [];
	data.map((event: Object) => {
		const {
			location = {},
			action,
			extras = {},
			identifier,
		} = event;

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
						key: 'action',
						action,
					},
					{
						key: 'fenceName',
						fenceName: extras.title,
					},
					{
						key: 'extras',
						extras,
					},
					{
						key: 'identifier',
						identifier,
					}],
			});
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
		rowCover,
		rowLabel,
		sectionCover,
		sectionLabel,
		rowValue,
		contentContainerStyle,
		emptyTextStyle,
	} = getStyles(layout);

	const listData = prepareListData(onGeofence, {
		formatDate,
		formatTime,
	});

	const renderRow = useCallback(({item, index}: Object): Object => {
		const {
			key,
			...others
		} = item;
		const val = others[key];

		return (
			<GeoFenceEventsLogRow
				key={key}
				val={val}
				label={key}
				rowValue={rowValue}
				rowLabel={rowLabel}
				rowCover={rowCover}/>
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
				toggleDialogueBoxState({
					show: false,
				});
			},
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<View style={{
			flex: 1,
			backgroundColor: Theme.Core.appBackground,
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
					navigation={navigation}/>
				{listData.length === 0 ?
					<Text style={emptyTextStyle}>
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
		subHeader,
		paddingFactor,
		rowTextColor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * 0.04);

	return {
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
		headerMainStyle: {
			marginBottom: 5,
			color: subHeader,
			fontSize,
		},
		touchableStyle: {
			height: fontSize * 3.1,
		},
		contentCoverStyle: {
			marginBottom: fontSize / 2,
		},
		rowCover: {
			backgroundColor: '#fff',
			flexDirection: 'row',
			marginHorizontal: padding,
			padding,
			marginTop: 1,
			flexWrap: 'wrap',
		},
		rowLabel: {
			fontSize,
			justifyContent: 'center',
			marginRight: 5,
		},
		sectionCover: {
			marginLeft: padding,
			marginBottom: 5,
		},
		rowValue: {
			fontSize,
			justifyContent: 'center',
			marginLeft: 5,
		},
		emptyTextStyle: {
			marginTop: 10,
			color: rowTextColor,
			fontSize,
			alignSelf: 'center',
		},
		sectionLabel: {
			fontSize,
			justifyContent: 'center',
			marginRight: 5,
			marginTop: 5,
		},
	};
};

export default GeoFenceEventsLogScreen;
