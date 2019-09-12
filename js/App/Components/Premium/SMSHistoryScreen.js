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
 *
 */

// @flow

'use strict';

import React, { useEffect } from 'react';
import { SectionList } from 'react-native';
import { useSelector } from 'react-redux';

import {
	View,
	NavigationHeaderPoster,
	Text,
} from '../../../BaseComponents';

import Theme from '../../Theme';

const SMSHistoryScreen = (props: Object): Object => {
	const { navigation, screenProps } = props;
	const { app: {layout} } = useSelector((state: Object): Object => state);
	const {
		container,
		rowStyle,
		sectionStyle,
		rowTextStyle1,
		rowTextStyle2,
		rowTextStyle3,
		sectionTextStyle,
		contentContainerStyle,
		toBlock,
	} = getStyles(layout);

	// const dispatch = useDispatch();
	useEffect(() => {
		// dispatch();
	}, []);

	function getStatus(n: number): Object {
		switch (n) {
			case 0:
				return {
					t: 'Pending',
					c: Theme.Core.brandSecondary,
				}
				;
			case 1:
				return {
					t: 'Delivered',
					c: Theme.Core.brandSuccess,
				};
			case 2:
				return {
					t: 'Failed',
					c: Theme.Core.brandDanger,
				};
			default:
				return {
					t: 'Pending',
					c: Theme.Core.brandSecondary,
				};
		}
	}

	function renderItem({item, index, section}: Object): Object {
		const { t, c } = getStatus(item.status);
		return (
			<View style={rowStyle}>
				<Text key={index} style={rowTextStyle1}>{item.date}</Text>
				<View style={toBlock}>
					<Text key={index} style={rowTextStyle2}>{item.to}</Text>
				</View>
				<Text key={index} style={[rowTextStyle3, {color: c}]}>{t}</Text>
			</View>);
	}

	function renderSectionHeader({section: {title}}: Object): Object {
		return (
			<View style={sectionStyle}>
				<Text style={sectionTextStyle}>{title}</Text>
			</View>
		);
	}

	function keyExtractor(item: any, index: any): string {
		return item + index;
	}

	return (
		<View style={container}>
			<NavigationHeaderPoster
				h1={'SMS History'} h2={'Sent SMS Messages'}
				align={'right'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...screenProps}/>
			<SectionList
				renderItem={renderItem}
				renderSectionHeader={renderSectionHeader}
				sections={[
					{title: 'Title1f', data: [{date: 'item1', to: '1237346383', status: 1}, {date: 'item1', to: '123', status: 1}], key: '1'},
					{title: 'Title22', data: [{date: 'item1', to: '1231423144', status: 2}, {date: 'item1', to: '123', status: 1}], key: '2'},
					{title: 'Title333', data: [{date: 'item144', to: '123', status: 0}, {date: 'item1', to: '000123', status: 0}], key: '3'},
				]}
				keyExtractor={keyExtractor}
				contentContainerStyle={contentContainerStyle}/>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const padding = deviceWidth * Theme.Core.paddingFactor;

	const fontSizeRow = Math.floor(deviceWidth * 0.049);
	const fontSizeSection = Math.floor(deviceWidth * 0.045);

	return {
		container: {
			flex: 1,
			backgroundColor: Theme.Core.appBackground,
		},
		rowStyle: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			marginHorizontal: padding,
			backgroundColor: '#fff',
			...Theme.Core.shadow,
			padding: 10,
			marginBottom: padding / 2,
		},
		sectionStyle: {
			paddingHorizontal: padding,
			backgroundColor: '#fff',
			...Theme.Core.shadow,
			paddingVertical: 5,
			marginTop: padding / 2,
			marginBottom: padding,
		},
		rowTextStyle1: {
			fontSize: fontSizeRow,
			color: '#000',
			width: '30%',
			textAlign: 'left',
		},
		toBlock: {
			width: '40%',
		},
		rowTextStyle2: {
			fontSize: fontSizeRow,
			color: '#000',
		},
		rowTextStyle3: {
			fontSize: fontSizeRow,
			color: '#000',
			textAlign: 'right',
			width: '30%',
		},
		sectionTextStyle: {
			fontSize: fontSizeSection,
			color: Theme.Core.rowTextColor,
		},
		contentContainerStyle: {
			marginTop: padding,
		},
	};
};

export default SMSHistoryScreen;
