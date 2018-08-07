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
import { TouchableOpacity } from 'react-native';
import Ripple from 'react-native-material-ripple';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { View, Text, IconTelldus } from '../../../../BaseComponents';
import Theme from '../../../Theme';

type Props = {
    legendData: Array<any>,
	appLayout: Object,
	onPressToggleView: () => void,
	fullscreen: boolean,
};

export default class ChartLegend extends View<Props, null> {
props: Props;
constructor(props: Props) {
	super(props);
}

render(): Object {
	const { legendData, appLayout, onPressToggleView, fullscreen } = this.props;
	const { rowTextColor, rippleColor, rippleDuration, rippleOpacity } = Theme.Core;
	const {
		containerStyle,
		labelContainerStyle,
		iconStyle,
		labelStyle,
		fontSizeFullscreenIcon,
		fullscreenIconStyle,
		legendsContainerStyle,
	} = this.getStyles(appLayout);

	return (
		<View style={containerStyle}>
			<View style={legendsContainerStyle}>
				{legendData.map((item: Object, index: number): Object => {
					const { icon, onPress, value, color } = item;
					if (!value) {
						return null;
					}
					return (
						<Ripple
							key={index}
							rippleColor={rippleColor}
							rippleOpacity={rippleOpacity}
							rippleDuration={rippleDuration}
							style={labelContainerStyle}
							onPress={onPress}>
							<IconTelldus icon={icon} style={{...iconStyle, color}}/>
							<Text style={[labelStyle, {color}]} numberOfLines={1}>
								{value}
							</Text>
						</Ripple>
					);
				})
				}
			</View>
			<TouchableOpacity onPress={onPressToggleView} style={fullscreenIconStyle}>
				<Icon name={fullscreen ? 'fullscreen-exit' : 'fullscreen'} size={fontSizeFullscreenIcon} color={rowTextColor}/>
			</TouchableOpacity>
		</View>
	);
}

getStyles(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const fontSizeLabel = deviceWidth * 0.038;
	const fontSizeIcon = deviceWidth * 0.06;
	const fontSizeFullscreenIcon = deviceWidth * 0.07;

	return {
		containerStyle: {
			flex: 0,
			flexDirection: 'row',
			marginTop: 20,
			marginLeft: 10,
		},
		legendsContainerStyle: {
			flex: 1,
			flexDirection: 'row',
			marginRight: fontSizeFullscreenIcon,
		},
		labelContainerStyle: {
			flex: 1,
			flexDirection: 'row',
			justifyContent: 'flex-start',
			alignItems: 'center',
			marginRight: 10,
		},
		iconStyle: {
			fontSize: fontSizeIcon,
			marginRight: 5,
		},
		labelStyle: {
			flex: 1,
			fontSize: fontSizeLabel,
		},
		fullscreenIconStyle: {
			flex: 0,
			padding: 5,
			position: 'absolute',
			right: 1,
			top: -8,
		},
		fontSizeFullscreenIcon,
	};
}
}
