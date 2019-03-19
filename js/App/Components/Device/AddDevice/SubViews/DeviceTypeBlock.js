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
import Device_433 from '../../../TabViews/img/device/device_433.svg';

import Theme from '../../../../Theme';

type Props = {
    module: string,
    action: string,
    h1: string,
	h2: string,
	icon?: string,
	appLayout: Object,
	onPress: (Object) => void,
	id: number,
	enabled: boolean,
	image?: string,
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
	const { onPress, module, action, id } = this.props;
	if (onPress) {
		onPress({
			module,
			action,
			secure: id === 2,
		});
	}
}

getImageSVG(image: string): any {
	switch (image) {
		case 'device_433':
			return Device_433;
		default:
			return null;
	}
}

render(): Object {
	const { h1, h2, icon, id, enabled, image } = this.props;
	let ImageComponent;
	if (image) {
		ImageComponent = this.getImageSVG(image);
	}
	const {
		arrowCover,
		arrow,
		container,
		imageType,
		itemsCover,
		h1Style,
		h2Style,
		iconSecurity,
		notAvailableIcon,
		imageComponentStyle,
		imageComponentHeight,
		imageComponentWidth,
	} = this.getStyles();
	const { rippleColor, rippleOpacity, rippleDuration } = Theme.Core;
	return (
		<Ripple
			rippleColor={rippleColor}
			rippleOpacity={rippleOpacity}
			rippleDuration={rippleDuration}
			onPress={this.onPress}
			disabled={!enabled}>
			<View style={container}>
				<View style={itemsCover}>
					{!!icon && <IconTelldus icon={icon} style={imageType}/>}
					{!!ImageComponent && <ImageComponent
						height={imageComponentHeight}
						width={imageComponentWidth}
						style={imageComponentStyle}/>}
					<View style={{
						flex: 1,
						flexDirection: 'column',
						flexWrap: 'wrap',
					}}>

						<Text>
							{(id === 2) && (
								<Text>
									<IconTelldus icon={'security'} style={iconSecurity}/>
									<Text style={Theme.Styles.hiddenText}>
										{' '}
									</Text>
								</Text>
							)}
							<Text style={h1Style}>
								{h1}
							</Text>
						</Text>
						<Text style={h2Style}>
							{h2}
						</Text>
					</View>
				</View>
				<View style={arrowCover} pointerEvents={'none'}>
					{enabled ?
						<Image source={{uri: 'right_arrow_key'}} style={arrow}/>
						:
						<IconTelldus icon={'notavailable'} style={notAvailableIcon}/>
					}
				</View>
			</View>
		</Ripple>
	);
}
getStyles(): Object {
	const { appLayout, enabled } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const { shadow, paddingFactor, brandSecondary, rowTextColor } = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const rowHeight = deviceWidth * 0.27;

	const h1FontSize = deviceWidth * 0.065;
	const h2FontSize = deviceWidth * 0.033;

	const colorBackground = enabled ? '#fff' : '#f5f5f5';
	const colorHeaderOneText = enabled ? brandSecondary : '#999999';
	const colorIcon = enabled ? '#1b365d' : '#bdbdbd';

	const imageComponentWidth = deviceWidth * 0.16;
	const imageComponentHeight = deviceWidth * 0.22;

	return {
		container: {
			...shadow,
			backgroundColor: colorBackground,
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
			paddingVertical: h1FontSize,
			alignItems: 'center',
			paddingRight: padding * 4,
		},
		h1Style: {
			fontSize: h1FontSize,
			color: colorHeaderOneText,
		},
		h2Style: {
			fontSize: h2FontSize,
			color: rowTextColor,
		},
		imageType: {
			fontSize: deviceWidth * 0.18,
			color: colorIcon,
			marginHorizontal: padding * 2,
		},
		iconSecurity: {
			fontSize: h1FontSize,
			color: brandSecondary,
		},
		notAvailableIcon: {
			fontSize: rowHeight * 0.25,
			color: '#bdbdbd',
		},
		imageComponentStyle: {
			marginHorizontal: padding * 2,
			color: colorIcon,
		},
		imageComponentHeight,
		imageComponentWidth,
	};
}
}

export default DeviceTypeBlock;
