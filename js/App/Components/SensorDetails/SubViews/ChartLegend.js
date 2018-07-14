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
 * along with Telldus Live! app.  If not, see <http://www.gnu.
 * org/licenses/>.
 */

// @flow

'use strict';
import React from 'react';
import Ripple from 'react-native-material-ripple';

import { View, Text, IconTelldus } from '../../../../BaseComponents';
import Theme from '../../../Theme';

type Props = {
    legendData: Array<any>,
    appLayout: Object,
};

export default class ChartLegend extends View<Props, null> {
props: Props;
constructor(props: Props) {
	super(props);
}

render(): Object {
	const { legendData, appLayout } = this.props;
	const {
		containerStyle,
		labelContainerStyle,
		iconStyle,
		labelStyle,
	} = this.getStyles(appLayout);

	return (
		<View style={containerStyle}>
			{legendData.map((item: Object, index: number): Object => {
				const { icon, onPress, value, color } = item;
				return (
					<Ripple
						key={index}
						rippleColor={Theme.rippleColor}
						rippleOpacity={Theme.rippleOpacity}
						rippleDuration={Theme.rippleDuration}
						style={labelContainerStyle}
						onPress={onPress}>
						<IconTelldus icon={icon} style={{...iconStyle, color}}/>
						<Text style={[labelStyle, {color}]}>
							{value}
						</Text>
					</Ripple>
				);
			})

			}
		</View>
	);
}

getStyles(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const fontSizeLabel = deviceWidth * 0.044;
	const fontSizeIcon = deviceWidth * 0.06;

	return {
		containerStyle: {
			flex: 0,
			flexDirection: 'row',
			marginTop: 20,
			marginLeft: 10,
		},
		labelContainerStyle: {
			flex: 0,
			flexDirection: 'row',
			justifyContent: 'space-between',
			marginRight: 10,
		},
		iconStyle: {
			fontSize: fontSizeIcon,
			marginRight: 5,
		},
		labelStyle: {
			fontSize: fontSizeLabel,
		},
	};
}
}
