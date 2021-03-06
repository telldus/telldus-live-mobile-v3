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

import { View, Text, FormattedMessage } from '../../../../BaseComponents';
import Battery from './Battery';

import {
	getBatteryPercentage,
} from '../../../Lib/DeviceUtils';
import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

export default class BatteryInfo extends View {

	render(): Object {
		const { battery, style, appLayout } = this.props;
		const percentage = getBatteryPercentage(battery);
		const {
			containerStyle,
			labelStyle,
			valueStyle,
		} = this.getStyle(appLayout);

		return (
			<View
				level={2}
				style={[containerStyle, style]}>
				<FormattedMessage
					level={3}
					{...i18n.labelBattery} style={labelStyle}/>
				<View style={{
					flexDirection: 'row',
				}}>
					<Battery value={percentage} appLayout={appLayout}/>
					<Text
						level={4}
						style={valueStyle}>
						{percentage}%
					</Text>
				</View>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			paddingFactor,
			shadow,
			fontSizeFactorFive,
		} = Theme.Core;
		const padding = deviceWidth * paddingFactor;
		const outerPadding = padding * 2;

		const textFontSize = deviceWidth * fontSizeFactorFive;
		const labelFontSize = deviceWidth * 0.031;

		return {
			containerStyle: {
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				width: width - outerPadding,
				padding: 15 + (labelFontSize * 0.4),
				...shadow,
				borderRadius: 2,
			},
			labelStyle: {
				fontSize: textFontSize,
			},
			valueStyle: {
				fontSize: textFontSize,
				marginLeft: 5,
			},
		};
	}
}
