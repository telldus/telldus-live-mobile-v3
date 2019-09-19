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

import React, { useEffect, useState } from 'react';
import { SectionList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import groupBy from 'lodash/groupBy';
import reduce from 'lodash/reduce';
import { useIntl } from 'react-intl';
import moment from 'moment';

import {
	View,
	NavigationHeaderPoster,
	Text,
	IconTelldus,
} from '../../../BaseComponents';
import {
	getUserTransactions,
} from '../../Actions/User';

import {
	capitalizeFirstLetterOfEachWord,
} from '../../Lib/appUtils';
import Theme from '../../Theme';
import i18n from '../../Translations/common';

const prepareListData = (history: Array<Object>): Array<Object> => {
	let result = groupBy(history, (items: Object): any => {
		let date = new Date(items.date * 1000).toDateString();
		return date;
	});
	return reduce(result, (acc: Array<any>, next: Object, index: number): Array<any> => {
		acc.push({
			key: index,
			data: next,
		});
		return acc;
	}, []);
};

const PurchaseHistoryScreen = (props: Object): Object => {
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
		emptyInfo,
		emptyCover,
		statusIconStyle,
	} = getStyles(layout);

	const { formatTime, formatMessage, formatNumber } = useIntl();

	const dispatch = useDispatch();
	const [ screenData, setScreenData ] = useState({
		isLoading: true,
		listData: [],
	});
	const { isLoading, listData } = screenData;
	useEffect(() => {
		getData();
	}, []);

	function getData() {
		setScreenData({
			isLoading: true,
			listData,
		});
		dispatch(getUserTransactions()).then((history: Array<Object>) => {
			setScreenData({
				isLoading: false,
				listData: prepareListData(history),
			});
		}).catch(() => {
			setScreenData({
				isLoading: false,
				listData,
			});
		});
	}

	function getTypeAndMonth({type, quantity}: Object): Object {
		const preS = `${formatMessage(i18n.premiumAccess)}, `;
		switch (type) {
			case 'pro': {// TODO: check with Johannes
				const months = 1 * quantity;
				const postS = months === 1 ? `1 ${formatMessage(i18n.month)}` : formatMessage(i18n.months, {value: months});
				return {
					typeInfo: preS + postS,
					color: Theme.Core.eulaContentColor,
				};
			}
			case 'promonth': {
				const months = 1 * quantity;
				const postS = months === 1 ? `1 ${formatMessage(i18n.month)}` : formatMessage(i18n.months, {value: months});
				return {
					typeInfo: preS + postS,
					color: Theme.Core.eulaContentColor,
				};
			}
			case 'prohalfyear': {
				const months = 6 * quantity;
				const postS = months === 1 ? `1 ${formatMessage(i18n.month)}` : formatMessage(i18n.months, {value: months});
				return {
					typeInfo: preS + postS,
					color: Theme.Core.eulaContentColor,
				};
			}
			case 'proyear': {
				const months = 12 * quantity;
				const postS = months === 1 ? `1 ${formatMessage(i18n.month)}` : formatMessage(i18n.months, {value: months});
				return {
					typeInfo: preS + postS,
					color: Theme.Core.eulaContentColor,
				};
			}
			default: {
				const months = 1 * quantity;
				const postS = months === 1 ? `1 ${formatMessage(i18n.month)}` : formatMessage(i18n.months, {value: months});
				return {
					typeInfo: preS + postS,
					color: Theme.Core.eulaContentColor,
				};
			}
		}
	}

	function renderItem({item, index, section}: Object): Object {
		const { typeInfo, color } = getTypeAndMonth(item);
		return (
			<View style={rowStyle} key={index}>
				<Text style={rowTextStyle1}>{formatTime(moment.unix(item.date))}</Text>
				<View style={toBlock}>
					<Text style={rowTextStyle2}>{typeInfo}</Text>
				</View>
				<Text style={[rowTextStyle3, {color}]}>€{formatNumber(item.price)}</Text>
			</View>);
	}

	function renderSectionHeader({section: {key}}: Object): Object {
		return (
			<View style={sectionStyle} key={key}>
				<Text style={sectionTextStyle}>{key}</Text>
			</View>
		);
	}

	function keyExtractor(item: any, index: any): string {
		return item.id + index;
	}

	return (
		<View style={container}>
			<NavigationHeaderPoster
				h1={capitalizeFirstLetterOfEachWord(formatMessage(i18n.purchaseHistory))} h2={formatMessage(i18n.yourTransactions)}
				align={'right'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...screenProps}/>
			{(!isLoading && listData.length === 0 ) ?
				<View style={emptyCover}>
					<IconTelldus icon={'info'} style={statusIconStyle}/>
					<Text style={emptyInfo}>{formatMessage(i18n.noPurchaseHistory)}</Text>
				</View>
				:
				<SectionList
					renderItem={renderItem}
					renderSectionHeader={renderSectionHeader}
					sections={listData}
					keyExtractor={keyExtractor}
					contentContainerStyle={contentContainerStyle}
					refreshing={isLoading}
					onRefresh={getData}
				/>
			}
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const padding = deviceWidth * Theme.Core.paddingFactor;

	const fontSizeRow = Math.floor(deviceWidth * 0.043);
	const fontSizeSection = Math.floor(deviceWidth * 0.039);

	return {
		toIconSize: fontSizeRow * 1.2,
		container: {
			flex: 1,
			backgroundColor: Theme.Core.appBackground,
		},
		rowStyle: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginHorizontal: padding,
			backgroundColor: '#fff',
			...Theme.Core.shadow,
			padding: 10,
			marginBottom: padding / 2,
		},
		emptyCover: {
			flexDirection: 'row',
			marginTop: padding,
			marginHorizontal: padding,
			backgroundColor: '#fff',
			...Theme.Core.shadow,
			padding: padding * 2,
			justifyContent: 'center',
			alignItems: 'center',
		},
		emptyInfo: {
			fontSize: fontSizeRow,
			color: Theme.Core.brandSecondary,
			alignSelf: 'center',
			textAlign: 'center',
		},
		statusIconStyle: {
			fontSize: fontSizeRow * 1.7,
			color: Theme.Core.brandSecondary,
			marginRight: 5,
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
			width: '25%',
			textAlign: 'left',
		},
		toBlock: {
			width: '65%',
			justifyContent: 'center',
			alignItems: 'flex-start',
		},
		rowTextStyle2: {
			fontSize: fontSizeRow,
			color: '#000',
			marginLeft: 3,
			textAlign: 'left',
		},
		rowTextStyle3: {
			fontSize: fontSizeRow,
			color: '#000',
			textAlign: 'right',
			width: '10%',
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

export default PurchaseHistoryScreen;
