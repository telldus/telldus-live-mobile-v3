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
	withTheme,
	PropsThemedComponent,
} from '../../HOC/withTheme';

import {
	getWidgetConstants,
	getWidgetTextFontSizeFactor,
	setWidgetTextFontSizeFactor,
} from '../../../Actions/Widget';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = PropsThemedComponent & {
    appLayout: Object,
    intl: Object,
};

const WidgetFontSizeSetting = memo<Object>((props: Props): Object => {

	const {
		appLayout,
		intl,
		colors,
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
	} = getStyles({
		appLayout,
		colors,
	});

	const onValueChange = useCallback((value: number) => {
		setCurrentValue(value);
	}, []);

	const onSlidingComplete = useCallback((value: number) => {
		setWidgetTextFontSizeFactor(value);
	}, []);

	return (
		<>
			<Text
				level={2}
				style={textStyle}>
				{intl.formatMessage(i18n.widgetTextSize)}
			</Text>
			<View level={2} style={containerStyle}>
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

const getStyles = ({
	appLayout,
	colors,
}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		shadow,
		fontSizeFactorFour,
		fontSizeFactorEight,
	} = Theme.Core;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);
	const fontSize2 = deviceWidth * fontSizeFactorFour;

	const thumbSize = fontSize2;

	const {
		inAppBrandSecondary,
	} = colors;

	return {
		containerStyle: {
			justifyContent: 'space-between',
			paddingHorizontal: fontSize2,
			paddingVertical: fontSize2 / 2,
			...shadow,
			borderRadius: 2,
		},
		textStyle: {
			marginBottom: 5,
			fontSize,
		},
		minimumTrackTintColor: inAppBrandSecondary,
		maximumTrackTintColor: 'rgba(219, 219, 219, 255)',
		thumbTintColor: inAppBrandSecondary,
		slider: {
			track: {
				borderRadius: 0,
				height: deviceWidth * 0.010666667,
			},
			thumb: {
				backgroundColor: inAppBrandSecondary,
				borderRadius: thumbSize / 2,
				height: thumbSize,
				width: thumbSize,
			},
		},
	};
};

export default (withTheme(WidgetFontSizeSetting): Object);
