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
	useMemo,
	memo,
	useCallback,
	useEffect,
} from 'react';
import {
	useSelector,
} from 'react-redux';

import {
	TouchableOpacity,
	Text,
	ThemedScrollView,
	View,
} from '../../../BaseComponents';

import Theme from '../../Theme';

type Props = {
    onDidMount: Function,
	navigation: Object,
	route: Object,
};

const BLOCKS = [
	{
		label: 'Group',
		screenName: 'SetEventGroupName',
	},
	{
		label: 'Event',
		screenName: 'SetEventName',
	},
];

const SelectGroupEvent = memo<Object>((props: Props): Object => {
	const {
		onDidMount,
		navigation,
		route,
	} = props;
	const {
		params = {},
	} = route;

	useEffect(() => {
		onDidMount('Select type', 'Select group or event to add'); // TODO: Translate
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const {
		layout,
	} = useSelector((state: Object): Object => state.app) || {};
	const {
		boxStyle,
		textStyle,
		containerStyle,
	} = getStyles({
		layout,
	});

	const onPress = useCallback(({
		screenName,
	}: Object) => {
		navigation.navigate(screenName, {
			...params,
		});
	}, [navigation, params]);

	const Blocks = useMemo((): Array<Object> => {
		return BLOCKS.map((b: Object, i: number): Object => {
			const {
				screenName,
				label,
			} = b;
			return (
				<TouchableOpacity
					key={i}
					style={boxStyle}
					onPress={onPress}
					onPressData={{
						index: i,
						screenName,
					}}>
					<Text
						style={textStyle}>
						{label.toUpperCase()}
					</Text>
				</TouchableOpacity>
			);
		});
	}, [boxStyle, onPress, textStyle]);

	return (
		<ThemedScrollView
			level={2}
			style={{
				flex: 1,
			}}
			contentContainerStyle={{
				flexGrow: 1,
			}}>
			<View
				style={containerStyle}>
				{Blocks}
			</View>
		</ThemedScrollView>
	);
});

const getStyles = ({layout}: Object): Object => {

	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		brandSecondary,
		fontSizeFactorFour,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorFour);

	return {
		containerStyle: {
			flexDirection: 'row',
			justifyContent: 'center',
			marginRight: padding / 2,
			marginVertical: padding,
		},
		boxStyle: {
			marginLeft: padding / 2,
			width: (width - (padding * 2.5)) / 2,
			...shadow,
			backgroundColor: '#fff',
			padding: padding * 3,
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: 2,
			marginTop: padding / 2,
		},
		textStyle: {
			fontSize: fontSize * 1.2,
			color: brandSecondary,
			textAlign: 'center',
			fontWeight: '500',
		},
	};
};

export default SelectGroupEvent;
