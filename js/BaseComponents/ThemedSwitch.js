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
} from 'react';
import { Switch } from 'react-native-switch';
import {
	useSelector,
} from 'react-redux';

import {
	useAppTheme,
} from '../App/Hooks/Theme';

const ThemedSwitch = (props: Object): Object => {

	const {
		onValueChange,
		value,
		disabled,
		activeText = 'ON',
		inActiveText = 'OFF',
		circleSize,
		barHeight,
		outerCircleStyle = {},
		backgroundActive,
		backgroundInactive,
		circleActiveColor,
		circleInActiveColor,
		circleBorderWidth = 0,
		innerCircleStyle = {},
		switchBorderRadius = 30,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		colors,
	} = useAppTheme();

	const {
		thumbColorActiveSwitch,
		thumbColorInActiveSwitch,
		trackColorInActiveSwitch,
		trackColorActiveSwitch,
	} = colors;

	const {
		outerCircleStyleDef,
		innerCircleStyleDef,
		circleSizeDef,
		barHeightDef,
	} = getStyles({
		layout,
	});

	return (
		<Switch
			value={value}
			onValueChange={onValueChange}
			disabled={disabled}
			activeText={activeText}
			inActiveText={inActiveText}
			circleSize={circleSizeDef || circleSize}
			barHeight={barHeightDef || barHeight}
			circleBorderWidth={circleBorderWidth}
			backgroundActive={backgroundActive || trackColorActiveSwitch}
			backgroundInactive={backgroundInactive || trackColorInActiveSwitch}
			circleActiveColor={circleActiveColor || thumbColorActiveSwitch}
			circleInActiveColor={circleInActiveColor || thumbColorInActiveSwitch}
			changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
			innerCircleStyle={{...innerCircleStyleDef, ...innerCircleStyle}} // style for inner animated circle for what you (may) be rendering inside the circle
			outerCircleStyle={{...outerCircleStyleDef, ...outerCircleStyle}} // style for outer animated circle
			renderActiveText={false}
			renderInActiveText={false}
			switchLeftPx={3} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
			switchRightPx={3} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
			switchWidthMultiplier={1.8} // multipled by the `circleSize` prop to calculate total width of the Switch
			switchBorderRadius={switchBorderRadius}
		/>
	);
};

const getStyles = ({layout}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const circleSizeDef = deviceWidth * 0.06;
	const barHeightDef = deviceWidth * 0.065;

	return {
		circleSizeDef,
		barHeightDef,
		innerCircleStyleDef: {
			alignItems: 'center',
			justifyContent: 'center',
		},
		outerCircleStyleDef: {
			borderWidth: 0,
		},
	};
};

export default (memo<Object>(ThemedSwitch): Object);
