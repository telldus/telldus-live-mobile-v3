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
import { useIntl } from 'react-intl';

import {
	FloatingButton,
	View,
} from '../../../BaseComponents';

import {
	TimePicker,
} from './SubViews';

import Theme from '../../Theme';

import {
	setFenceActiveTime,
} from '../../Actions/Fences';

import i18n from '../../Translations/common';

type Props = {
	navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
};

const ActiveTime = React.memo<Object>((props: Props): Object => {
	const {
		navigation,
		appLayout,
		onDidMount,
	} = props;

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const dispatch = useDispatch();

	useEffect(() => {
		onDidMount(`4. ${formatMessage(i18n.activeTime)}`, formatMessage(i18n.selectTimeForFence));
	// eslint-disable-next-line react-hooks/exhaustive-deps
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
		navigation.navigate('SetAreaName');
	}

	const {
		container,
		contentContainerStyle,
		rowStyle,
		leftItemStyle,
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
		<View style={{flex: 1}}>
			<ScrollView
				style={container}
				contentContainerStyle={contentContainerStyle}>
				<TimePicker
					onChange={onChangeTime}
					appLayout={appLayout}
					labelStyle={leftItemStyle}
					rowStyle={rowStyle}
					intl={intl}/>
			</ScrollView>
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'right_arrow_key'}}/>
		</View>

	);
});

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		eulaContentColor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = deviceWidth * 0.04;

	return {
		container: {
			flex: 1,
		},
		contentContainerStyle: {
			flexGrow: 1,
			paddingVertical: padding * 2,
		},
		rowStyle: {
			padding: padding * 1.5,
			backgroundColor: '#fff',
			flexDirection: 'row',
			justifyContent: 'space-between',
			height: undefined,
		},
		leftItemStyle: {
			color: eulaContentColor,
			fontSize,
		},
	};
};

export default ActiveTime;
