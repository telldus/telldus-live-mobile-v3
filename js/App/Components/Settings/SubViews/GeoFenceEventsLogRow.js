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
import {
	TouchableOpacity,
	LayoutAnimation,
} from 'react-native';
import React, {
	memo,
	useState,
	useCallback,
	useMemo,
} from 'react';
import {
	useSelector,
} from 'react-redux';

import {
	View,
	Text,
	ThemedMaterialIcon,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';
import {
	LayoutAnimations,
} from '../../../Lib';

const GeoFenceEventsLogRow = (props: Object): Object => {
	const {
		label,
		val,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const ignoreExpand = typeof val === 'string';
	const isActions = label === 'arriving actions' || label === 'leaving actions';
	const isCpoints = label === 'checkpoints';

	const {
		rowCover,
		rowLabel,
		rowValue,
	} = getStyles({
		layout,
		column: isActions || isCpoints,
	});

	const [ expand, setExpand ] = useState(ignoreExpand);

	const toggle = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		setExpand(!expand);
	}, [expand]);

	const content = useMemo((): Object | null => {
		if (!val) {
			return null;
		}
		if (ignoreExpand) {
			return (
				<Text
					level={25}
					style={rowValue}>
					{val}
				</Text>
			);
		} else if (isActions) {
			return Object.keys(val).map((items: Object): Object => {
				const val2 = val[items];
				return (
					<View style={{
						flex: 1,
					}}>
						<Text
							level={3}
							style={rowValue}>
							{items}
						</Text>
						{
							Object.keys(val2).map((items2: Object): Object => {
								const {
									uuid,
									...others
								} = val2[items2];
								return (
									<View style={{
										flex: 1,
									}}>
										<Text
											level={3}
											style={rowValue}>
											{uuid}
										</Text>
										<Text
											level={25}
											style={rowValue}>
											{JSON.stringify(others)}
										</Text>
									</View>
								);
							})
						}
					</View>
				);
			});
		} else if (isCpoints) {
			return Object.keys(val).map((items: Object): Object => {
				const val2 = val[items];
				return (
					<View style={{
						flex: 1,
					}}>
						<Text
							level={3}
							style={rowValue}>
							{items}
						</Text>
						<Text
							level={25}
							style={rowValue}>
							{JSON.stringify(val2)}
						</Text>
					</View>
				);
			});
		}
		return <Text
			level={25}
			style={rowValue}>
			{JSON.stringify(val)}
		</Text>;
	}, [ignoreExpand, isActions, rowValue, val, isCpoints]);

	return (
		<View
			level={2}
			style={rowCover}>
			<TouchableOpacity
				onPress={toggle}
				style={{
					flexDirection: 'row',
				}}
			>
				<Text
					level={3}
					style={rowLabel}>
					{label} :
				</Text>
				{!ignoreExpand && <ThemedMaterialIcon
					name={expand ? 'expand-less' : 'expand-more'}
					size={22}
					level={23}/>
				}
			</TouchableOpacity>
			{(expand && !!val && !!content) &&
				content
			}
		</View>
	);
};

const getStyles = ({
	layout,
	column,
}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		fontSizeFactorFour,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorFour);

	return {
		rowCover: {
			flexDirection: column ? 'column' : 'row',
			marginHorizontal: padding,
			padding,
			marginTop: 1,
			flexWrap: column ? 'nowrap' : 'wrap',
		},
		rowLabel: {
			fontSize,
			justifyContent: 'center',
			marginRight: 5,
		},
		rowValue: {
			fontSize,
			justifyContent: 'center',
			marginLeft: 5,
		},
	};
};
export default (memo<Object>(GeoFenceEventsLogRow): Object);
