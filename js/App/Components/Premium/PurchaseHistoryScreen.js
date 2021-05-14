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

import React, {
	useEffect,
	useState,
	useCallback,
} from 'react';
import { SectionList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import groupBy from 'lodash/groupBy';
import reduce from 'lodash/reduce';
import { useIntl } from 'react-intl';
import * as RNLocalize from 'react-native-localize';
let dayjs = require('dayjs');

import {
	View,
	NavigationHeaderPoster,
	Text,
	InfoBlock,
	ThemedRefreshControl,
} from '../../../BaseComponents';
import {
	getUserTransactions,
} from '../../Actions/User';

import Theme from '../../Theme';
import i18n from '../../Translations/common';
import capitalize from '../../Lib/capitalize';

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
	const { layout } = useSelector((state: Object): Object => state.app);
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
	const hour12 = !RNLocalize.uses24HourClock();

	const dispatch = useDispatch();
	const [ screenData, setScreenData ] = useState({
		isLoading: true,
		listData: [],
	});
	const { isLoading, listData } = screenData;

	const getData = useCallback(() => {
		(() => {
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
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [listData]);

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const renderItem = useCallback(({item, index, section}: Object): Object => {
		return ((): Object => {
			function getTypeAndMonth({type, quantity}: Object): Object {
				const preS = `${capitalize(formatMessage(i18n.premiumAccess))}, `;
				switch (type) {
					case 'pro': {// TODO: check with Johannes
						const months = 1 * quantity;
						const postS = months === 1 ? `1 ${formatMessage(i18n.month)}` : formatMessage(i18n.months, {value: months});
						return {
							typeInfo: preS + postS,
							level: 5,
						};
					}
					case 'promonth': {
						const months = 1 * quantity;
						const postS = months === 1 ? `1 ${formatMessage(i18n.month)}` : formatMessage(i18n.months, {value: months});
						return {
							typeInfo: preS + postS,
							level: 5,
						};
					}
					case 'prohalfyear': {
						const months = 6 * quantity;
						const postS = months === 1 ? `1 ${formatMessage(i18n.month)}` : formatMessage(i18n.months, {value: months});
						return {
							typeInfo: preS + postS,
							level: 5,
						};
					}
					case 'proyear': {
						const months = 12 * quantity;
						const postS = months === 1 ? `1 ${formatMessage(i18n.month)}` : formatMessage(i18n.months, {value: months});
						return {
							typeInfo: preS + postS,
							level: 5,
						};
					}
					default: {
						const months = 1 * quantity;
						const postS = months === 1 ? `1 ${formatMessage(i18n.month)}` : formatMessage(i18n.months, {value: months});
						return {
							typeInfo: preS + postS,
							level: 5,
						};
					}
				}
			}

			const { typeInfo, level } = getTypeAndMonth(item);

			return (
				<View
					level={2}
					style={rowStyle}
					key={index}>
					<Text
						level={3}
						style={rowTextStyle1}>{formatTime(dayjs.unix(item.date), {
							hour12,
						})}</Text>
					<View style={toBlock}>
						<Text
							level={3}
							style={rowTextStyle2}>{typeInfo}</Text>
					</View>
					<Text
						level={level}
						style={rowTextStyle3}>€{formatNumber(item.price)}</Text>
				</View>);
		}
		)();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [layout]);

	const renderSectionHeader = useCallback(({section: {key}}: Object): Object => {
		return ((): Object => (
			<View
				level={2}
				style={sectionStyle}
				key={key}>
				<Text
					level={4}
					style={sectionTextStyle}>{key}</Text>
			</View>
		))();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [layout]);

	const keyExtractor = useCallback((item: any, index: any): string => {
		return ((): string => (`${item.id}${index}`))();
	}, []);

	return (
		<View
			level={3}
			style={container}>
			<NavigationHeaderPoster
				h1={capitalize(formatMessage(i18n.purchaseHistory))} h2={formatMessage(i18n.yourTransactions)}
				align={'left'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...screenProps}/>
			{(!isLoading && listData.length === 0) ?
				<InfoBlock
					text={formatMessage(i18n.noPurchaseHistory)}
					appLayout={layout}
					infoContainer={emptyCover}
					textStyle={emptyInfo}
					infoIconStyle={statusIconStyle}/>
				:
				<SectionList
					renderItem={renderItem}
					renderSectionHeader={renderSectionHeader}
					sections={listData}
					keyExtractor={keyExtractor}
					contentContainerStyle={contentContainerStyle}
					refreshControl={
						<ThemedRefreshControl
							refreshing={isLoading}
							onRefresh={getData}
						/>
					}
				/>
			}
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const {
		fontSizeFactorThree,
		paddingFactor,
		shadow,
	} = Theme.Core;
	const padding = deviceWidth * paddingFactor;

	const fontSizeRow = Math.floor(deviceWidth * 0.043);
	const fontSizeSection = Math.floor(deviceWidth * fontSizeFactorThree);

	return {
		toIconSize: fontSizeRow * 1.2,
		container: {
			flex: 1,
		},
		rowStyle: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginHorizontal: padding,
			...shadow,
			padding: 10,
			marginBottom: padding / 2,
		},
		emptyCover: {
			flexDirection: 'row',
			marginTop: padding,
			marginHorizontal: padding,
			...shadow,
			padding: padding * 2,
			justifyContent: 'center',
			alignItems: 'center',
			flex: 0,
		},
		emptyInfo: {
			fontSize: fontSizeRow,
			alignSelf: 'center',
			textAlign: 'center',
		},
		statusIconStyle: {
			fontSize: fontSizeRow * 1.7,
			marginRight: 5,
		},
		sectionStyle: {
			paddingHorizontal: padding,
			...shadow,
			paddingVertical: 5,
			marginTop: padding / 2,
			marginBottom: padding,
		},
		rowTextStyle1: {
			fontSize: fontSizeRow,
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
			marginLeft: 3,
			textAlign: 'left',
		},
		rowTextStyle3: {
			fontSize: fontSizeRow,
			textAlign: 'right',
			width: '10%',
		},
		sectionTextStyle: {
			fontSize: fontSizeSection,
		},
		contentContainerStyle: {
			marginTop: padding,
		},
	};
};

export default (React.memo<Object>(PurchaseHistoryScreen): Object);
