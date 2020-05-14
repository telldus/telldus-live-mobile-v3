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
	memo,
	useMemo,
	useState,
	useCallback,
} from 'react';
import Slider from 'react-native-slider';

import {
	View,
	Text,
} from '../../../../BaseComponents';

import {
	getWidgetConstants,
	getWidgetTextFontSizeFactor,
	setWidgetTextFontSizeFactor,
} from '../../../Actions/Widget';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
    appLayout: Object,
    intl: Object,
};

const WidgetFontSizeSetting = memo<Object>((props: Props): Object => {

	const {
		appLayout,
		intl,
	} = props;

	const [ currentValue, setCurrentValue ] = useState(getWidgetTextFontSizeFactor());

	const {
		BASE_FONT_SIZE_FACTOR_MAX,
		BASE_FONT_SIZE_FACTOR_MIN,
	} = useMemo((): Object => {
		return getWidgetConstants();
	}, []);

	const {
		containerStyle,
		textStyle,
		minimumTrackTintColor,
		slider,
	} = getStyles(appLayout);

	const onValueChange = useCallback((value: number) => {
		setCurrentValue(value);
	}, []);

	const onSlidingComplete = useCallback((value: number) => {
		setWidgetTextFontSizeFactor(value);
	}, []);

	return (
		<>
			<Text style={textStyle}>
				{intl.formatMessage(i18n.widgetTextSize)}
			</Text>
			<View style={containerStyle}>
				<Slider
					minimumValue= {BASE_FONT_SIZE_FACTOR_MIN}
					maximumValue={BASE_FONT_SIZE_FACTOR_MAX}
					value={currentValue}
					onValueChange={onValueChange}
					onSlidingComplete={onSlidingComplete}
					minimumTrackTintColor={minimumTrackTintColor}
					trackStyle={slider.track}
					thumbStyle={slider.thumb}/>
			</View>
		</>
	);
});

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		shadow,
		subHeader,
		brandSecondary,
	} = Theme.Core;

	const fontSize = Math.floor(deviceWidth * 0.045);
	const fontSize2 = deviceWidth * 0.04;

	const thumbSize = fontSize2;

	return {
		containerStyle: {
			justifyContent: 'space-between',
			paddingHorizontal: fontSize2,
			paddingVertical: fontSize2 / 2,
			backgroundColor: '#fff',
			...shadow,
			borderRadius: 2,
		},
		textStyle: {
			marginBottom: 5,
			color: subHeader,
			fontSize,
		},
		minimumTrackTintColor: brandSecondary,
		maximumTrackTintColor: 'rgba(219, 219, 219, 255)',
		thumbTintColor: brandSecondary,
		slider: {
			track: {
				borderRadius: 0,
				height: deviceWidth * 0.010666667,
			},
			thumb: {
				backgroundColor: brandSecondary,
				borderRadius: thumbSize / 2,
				height: thumbSize,
				width: thumbSize,
			},
		},
	};
};

export default WidgetFontSizeSetting;
