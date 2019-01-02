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

import React from 'react';
import {
	Image,
} from 'react-native';
import Ripple from 'react-native-material-ripple';

import {
	View,
	Text,
	IconTelldus,
} from '../../../../../BaseComponents';

import Theme from '../../../../Theme';

type Props = {
    module: string,
    action: string,
    h1: string,
	h2: string,
	icon: string,
	appLayout: Object,
	onPress: (Object) => void,
};

type State = {
};

class DeviceTypeBlock extends View<Props, State> {
props: Props;
state: State;

onPress: (Object) => void;
constructor(props: Props) {
	super(props);

	this.onPress = this.onPress.bind(this);
}

onPress() {
	const { onPress, module, action, icon } = this.props;
	if (onPress) {
		onPress({
			module,
			action,
			icon,
		});
	}
}

render(): Object {
	const { h1, h2, icon } = this.props;
	const {
		arrowCover,
		arrow,
		container,
		imageType,
		itemsCover,
		h1Style,
		h2Style,
	} = this.getStyles();
	const { rippleColor, rippleOpacity, rippleDuration } = Theme.Core;
	return (
		<Ripple
			rippleColor={rippleColor}
			rippleOpacity={rippleOpacity}
			rippleDuration={rippleDuration}
			onPress={this.onPress}>
			<View style={container}>
				<View style={itemsCover}>
					<IconTelldus icon={icon} style={imageType}/>
					<View style={{
						flexDirection: 'column',
					}}>

						<Text style={h1Style}>
							{h1}
						</Text>
						<Text style={h2Style}>
							{h2}
						</Text>
					</View>
				</View>
				<View style={arrowCover} pointerEvents={'none'}>
					<Image source={{uri: 'right_arrow_key'}} style={arrow}/>
				</View>
			</View>
		</Ripple>
	);
}
getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const { shadow, paddingFactor, brandSecondary, rowTextColor } = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const rowHeight = deviceWidth * 0.27;

	const h1FontSize = deviceWidth * 0.065;
	const h2FontSize = deviceWidth * 0.033;

	return {
		container: {
			...shadow,
			backgroundColor: '#fff',
			marginBottom: padding / 2,
			justifyContent: 'center',
			borderRadius: 2,
			marginHorizontal: padding,
		},
		arrowCover: {
			flex: 0,
			position: 'absolute',
			zIndex: 1,
			right: padding * 2,
			top: '40%',
		},
		arrow: {
			tintColor: '#A59F9A90',
			height: rowHeight * 0.25,
			width: rowHeight * 0.2,
		},
		itemsCover: {
			flexDirection: 'row',
			paddingVertical: 5 + h1FontSize,
			alignItems: 'center',
			paddingRight: padding * 4,
		},
		h1Style: {
			fontSize: h1FontSize,
			color: brandSecondary,
		},
		h2Style: {
			fontSize: h2FontSize,
			color: rowTextColor,
		},
		imageType: {
			fontSize: deviceWidth * 0.18,
			color: '#1b365d',
			marginRight: 8,
		},
	};
}
}

export default DeviceTypeBlock;
