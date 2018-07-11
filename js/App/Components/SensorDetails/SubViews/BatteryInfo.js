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

import { View, Text } from '../../../../BaseComponents';
import Battery from './Battery';

import Theme from '../../../Theme';

export default class BatteryInfo extends View {
	render(): Object {
		const { battery, style, appLayout } = this.props;
		const isLowWarning = battery === 254;
		const {
			containerStyle,
			labelStyle,
			valueStyle,
		} = this.getStyle(appLayout);

		return (
			<View style={[containerStyle, style]}>
				<Text style={labelStyle}>
            Battery
				</Text>
				<View style={{
					flexDirection: 'row',
				}}>
					<Battery value={isLowWarning ? 0 : battery} appLayout={appLayout}/>
					{!isLowWarning && (<Text style={valueStyle}>
						{battery}%
					</Text>)
					}
				</View>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { paddingFactor, shadow, rowTextColor } = Theme.Core;
		const padding = deviceWidth * paddingFactor;
		const outerPadding = padding * 2;

		const textFontSize = deviceWidth * 0.05;

		return {
			containerStyle: {
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				width: deviceWidth - outerPadding,
				padding: 5 + (textFontSize * 0.5),
				...shadow,
				backgroundColor: '#fff',
				borderRadius: 2,
			},
			labelStyle: {
				fontSize: textFontSize,
				color: '#000',
			},
			valueStyle: {
				fontSize: textFontSize,
				color: rowTextColor,
				marginLeft: 5,
			},
		};
	}
}
