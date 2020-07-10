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
	useEffect,
} from 'react';
import {
	useSelector,
} from 'react-redux';

import {
	View,
	Text,
	ThemedScrollView,
	TouchableOpacity,
} from '../../../BaseComponents';

import Theme from '../../Theme';

const SelectTypeScreen = memo<Object>((props: Object): Object => {
	const {
		onDidMount,
		navigation,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	useEffect(() => {// TODO: translate
		onDidMount('Select Type', 'Select either device or sensor');
	}, [onDidMount]);

	const {
		containerStyle,
		boxStyle,
		textStyle,
	} = getStyles({layout});

	const navigate = useCallback((params: Object) => {
		navigation.navigate('SelectItemsScreen', params);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onPressD = useCallback(() => {
		navigate({selectedType: 'device'});
	}, [navigate]);

	const onPressS = useCallback(() => {
		navigate({selectedType: 'sensor'});
	}, [navigate]);

	// TODO: translate
	return (
		<ThemedScrollView
			level={3}>
			<View
				style={containerStyle}>
				<TouchableOpacity
					level={3}
					style={boxStyle}
					onPress={onPressD}>
					<Text
						style={textStyle}>
                        DEVICE
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					level={3}
					style={boxStyle}
					onPress={onPressS}>
					<Text
						style={textStyle}>
                        SENSOR
					</Text>
				</TouchableOpacity>
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
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * 0.04);

	return {
		containerStyle: {
			flex: 1,
			flexDirection: 'row',
			paddingTop: padding,
		},
		boxStyle: {
			marginLeft: padding,
			width: (width - (padding * 3)) / 2,
			...shadow,
			backgroundColor: '#fff',
			padding: padding * 3,
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: 2,
		},
		textStyle: {
			fontSize: fontSize * 1.2,
			color: brandSecondary,
			textAlign: 'center',
			fontWeight: '500',
		},
	};
};

export default SelectTypeScreen;
