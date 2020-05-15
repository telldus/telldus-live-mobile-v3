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
} from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	NavigationHeader,
	PosterWithText,
	Text,
} from '../../../BaseComponents';

import Theme from '../../Theme';

type Props = {
	navigation: Object,
};

function prepareListData(data: Object, {
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
				header: `${formatDate(timestamp)} ${formatTime(timestamp)}`,
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
	return listData;
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
			<View style={rowCover}>
				<Text style={rowLabel}>
					{key} :
				</Text>
				{!!val && <Text style={rowValue}>
					{typeof val === 'string' ? val : JSON.stringify(val)}
				</Text>
				}
			</View>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [layout]);

	const renderSectionHeader = useCallback(({section, index}: Object): Object => {
		return (
			<View style={sectionCover}>
				<Text style={sectionLabel}>
					{section.header}
				</Text>
			</View>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [layout]);

	const keyExtractor = useCallback((data: Object): Object => {
		return data.key;
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
					<Text style={sectionLabel}>
                Empty
					</Text>
					:
					<SectionList
						sections={listData}
						renderItem={renderRow}
						renderSectionHeader={renderSectionHeader}
						stickySectionHeadersEnabled={true}
						keyExtractor={keyExtractor}
						contentContainerStyle={contentContainerStyle}/>
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
			color: '#000',
			fontSize,
			justifyContent: 'center',
		},
		sectionCover: {
			marginLeft: padding,
			marginBottom: 5,
		},
		rowValue: {
			color: rowTextColor,
			fontSize,
			justifyContent: 'center',
			marginLeft: 5,
		},
	};
};

export default GeoFenceEventsLogScreen;
