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

import React from 'react';
import { Animated } from 'react-native';
import Ripple from 'react-native-material-ripple';

import {
	View,
} from '../../../../../BaseComponents';
const AnimatedTouchable = Animated.createAnimatedComponent(Ripple);
import Theme from '../../../../Theme';

type Props = {
    style: Array<any> | number | Object,
	valueCoverStyle: Array<any> | number | Object,
	dotStyle: Object,
	dotCoverStyle: Array<any> | number | Object,
    sensors?: Object,
    defaultType?: string | null,
    onLayout?: Function,
    changeDisplayType: Function,
    totalTypes: Array<string>,
    defaultSensor?: Object | null,
};

const TypeBlock = ({ style, valueCoverStyle, dotStyle, dotCoverStyle, onLayout, changeDisplayType, totalTypes, defaultSensor, defaultType }: Props): Object => {
	const { rippleColor, rippleOpacity, rippleDuration } = Theme.Core;
	return (
		<AnimatedTouchable
			onPress={changeDisplayType}
			accessible={false}
			disabled={totalTypes.length <= 1}
			onLayout={onLayout}
			style={style}
			importantForAccessibility="no-hide-descendants"
			accessibilityElementsHidden={true}
			rippleColor={rippleColor}
			rippleOpacity={rippleOpacity}
			rippleDuration={rippleDuration}>
			<View
				style={valueCoverStyle}
				importantForAccessibility="no-hide-descendants"
				accessibilityElementsHidden={true}>
				{defaultSensor}
				{totalTypes.length > 1 && (
					<View style={dotCoverStyle}>
						{
							totalTypes.map((key: string, index: number): Object => {
								const { backgroundColor: BG = '#fff', marginLeft: PL = 0, ...otherStyles } = dotStyle;
								let backgroundColor = BG, marginLeft = PL;
								if (key === defaultType) {
									backgroundColor = Theme.Core.brandSecondary;
								}
								if (index === 0) {
									marginLeft = 0;
								}
								return <View style={[{
									...otherStyles,
									backgroundColor,
									marginLeft,
								}]} key={key}/>;
							})
						}
					</View>
				)}
			</View>
		</AnimatedTouchable>
	);
};

export default TypeBlock;
