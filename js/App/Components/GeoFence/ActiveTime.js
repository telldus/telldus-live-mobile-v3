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

import React, { useEffect, useState } from 'react';
import {
	ScrollView,
} from 'react-native';
import {
	useDispatch,
} from 'react-redux';

import {
	FloatingButton,
} from '../../../BaseComponents';

import {
	TimePicker,
} from './SubViews';

import Theme from '../../Theme';

import {
	setFenceActiveTime,
} from '../../Actions/Fences';

type Props = {
	navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
};

const ActiveTime = (props: Props): Object => {
	const {
		navigation,
		appLayout,
		onDidMount,
	} = props;

	const dispatch = useDispatch();

	useEffect(() => {
		onDidMount('4. Active time', 'Select time for fence to be active');
	}, []);

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

	function onPressNext() {
		dispatch(setFenceActiveTime(aA, fH, fM, tH, tM));
		navigation.navigate({
			routeName: 'SetAreaName',
			key: 'SetAreaName',
		});
	}

	const {
		container,
		contentContainerStyle,
	} = getStyles(appLayout);

	function onChangeTime(
		alwaysActive: boolean,
		fromHr: number,
		fromMin: number,
		toHr: number,
		toMin: number,
	) {
		setTimeInfo({
			alwaysActive,
			fromHr,
			fromMin,
			toHr,
			toMin,
		});
	}

	return (
		<ScrollView
			style={container}
			contentContainerStyle={contentContainerStyle}>
			<TimePicker
				onChange={onChangeTime}/>
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'right_arrow_key'}}/>
		</ScrollView>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		container: {
			flex: 1,
		},
		contentContainerStyle: {
			flexGrow: 1,
			paddingVertical: padding * 2,
		},
	};
};

export default ActiveTime;
