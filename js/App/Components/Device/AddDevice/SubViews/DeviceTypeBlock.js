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

import {
	View,
	Text,
	IconTelldus,
	RippleButton,
} from '../../../../../BaseComponents';
import {
	withTheme,
	PropsThemedComponent,
} from '../../../HOC/withTheme';

import Theme from '../../../../Theme';

type Props = PropsThemedComponent & {
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
	secure?: boolean,
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
	const { onPress, module, action, secure } = this.props;
	if (onPress) {
		onPress({
			module,
			action,
			secure,
		});
	}
}

render(): Object {
	const { h1, h2, icon, enabled, image: ImageSVG, secure } = this.props;
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
		boxOneStyle,
	} = this.getStyles();
	return (
		<RippleButton
			style={{flex: 0}}
			onPress={this.onPress}
			disabled={!enabled}>
			<View style={container}>
				<View style={itemsCover}>
					<View style={boxOneStyle}>
						{!!icon && <IconTelldus icon={icon} style={imageType}/>}
						{!!ImageSVG && <ImageSVG
							height={imageComponentHeight}
							width={imageComponentWidth}
							style={imageComponentStyle}/>}
					</View>
					<View style={{
						flex: 1,
						flexDirection: 'column',
						justifyContent: 'center',
					}}>
						<Text>
							{!!secure && (
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
						<View style={{
							flexDirection: 'row',
							flexWrap: 'wrap',
						}}>
							<Text style={h2Style}>
								{h2}
							</Text>
						</View>
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
		</RippleButton>
	);
}
getStyles(): Object {
	const {
		appLayout,
		enabled,
		colors,
	} = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const { shadow, paddingFactor } = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const rowHeight = deviceWidth * 0.27;

	const h1FontSize = deviceWidth * 0.065;
	const h2FontSize = deviceWidth * 0.033;

	const {
		card,
		colorBlockDisabled,
		headerOneColorBlockDisabled,
		iconOneColorBlockEnabled,
		iconOneColorBlockDisabled,
		iconTwoColorBlock,
		iconTwoColorBlockDisabled,
		infoOneColorBlockEnabled,
		infoOneColorBlockDisabled,
		inAppBrandSecondary,
	} = colors;

	const colorBackground = enabled ? card : colorBlockDisabled;
	const colorHeaderOneText = enabled ? inAppBrandSecondary : headerOneColorBlockDisabled;
	const colorIcon = enabled ? iconOneColorBlockEnabled : iconOneColorBlockDisabled;
	const colorIconTwo = enabled ? iconTwoColorBlock : iconTwoColorBlockDisabled;

	const imageComponentWidth = deviceWidth * 0.16;
	const imageComponentHeight = deviceWidth * 0.22;

	const boxOneWidth = deviceWidth * 0.26;

	return {
		container: {
			...shadow,
			backgroundColor: colorBackground,
			marginBottom: padding / 2,
			justifyContent: 'center',
			borderRadius: 2,
			marginHorizontal: padding,
			height: imageComponentHeight + (padding * 3),
		},
		boxOneStyle: {
			width: boxOneWidth,
			justifyContent: 'center',
			alignItems: 'center',
		},
		arrowCover: {
			flex: 0,
			position: 'absolute',
			zIndex: 1,
			right: padding * 2,
			top: '40%',
		},
		arrow: {
			tintColor: colorIconTwo,
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
			color: enabled ? infoOneColorBlockEnabled : infoOneColorBlockDisabled,
		},
		imageType: {
			fontSize: deviceWidth * 0.18,
			color: colorIcon,
		},
		iconSecurity: {
			fontSize: h1FontSize,
			color: colorHeaderOneText,
		},
		notAvailableIcon: {
			fontSize: rowHeight * 0.25,
			color: colorIconTwo,
		},
		imageComponentStyle: {
			color: colorIcon,
		},
		imageComponentHeight,
		imageComponentWidth,
	};
}
}

export default (withTheme(DeviceTypeBlock): Object);
