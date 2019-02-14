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
	View,
	Text,
	Image,
	IconTelldus,
} from '../../../../../BaseComponents';

import Theme from '../../../../Theme';

type Props = {
    image?: string,
    h1: string,
    h2: string,
    h3?: string,
    appLayout: Object,
    imageW?: number,
    imageH?: number,
};

class DeviceInfoBlock extends View<Props, null> {
	render(): Object {
		const {
			image,
			h1,
			h2,
			h3,
			appLayout,
		} = this.props;

		const {
			deviceInfoCoverStyle,
			deviceImageStyle,
			deviceIconStyle,
			h1Style,
			h2Style,
			h3Style,
		} = this.getStyles(appLayout);

		return (
			<View style={deviceInfoCoverStyle}>
				{image ? <Image
					source={{uri: image}}
					resizeMode={'contain'}
					style={deviceImageStyle}/>
					:
					<IconTelldus
						icon={'device-alt'}
						style={deviceIconStyle}/>
				}
				<View>
					<Text style={h1Style}>
						{h1}
					</Text>
					<Text style={h2Style}>
						{h2}
					</Text>
					{!!h3 && (
						<Text style={h3Style}>
							{h3}
						</Text>
					)}
				</View>
			</View>
		);
	}

	getImageDimensions(appLayout: Object): Object {
		const {
			imageW,
			imageH,
		} = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const imageHeight = deviceWidth * 0.25;
		const imageWidth = deviceWidth * 0.29;
		if (!imageW || !imageH) {
			return { imgWidth: imageWidth, imgHeight: imageHeight };
		}

		let ratioHW = imageH / imageW;
		return { imgWidth: imageHeight / ratioHW, imgHeight: imageHeight };
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { rowTextColor, paddingFactor, brandSecondary, eulaContentColor } = Theme.Core;

		const padding = deviceWidth * paddingFactor;
		const { imgWidth, imgHeight } = this.getImageDimensions(appLayout);

		return {
			deviceInfoCoverStyle: {
				flexDirection: 'row',
				marginBottom: 4,
				alignItems: 'center',
			},
			deviceImageStyle: {
				width: imgWidth,
				height: imgHeight,
				marginRight: padding,
			},
			deviceIconStyle: {
				fontSize: imgWidth,
				marginRight: padding,
				color: rowTextColor,
			},
			h1Style: {
				fontSize: deviceWidth * 0.05,
				color: brandSecondary,
			},
			h2Style: {
				fontSize: deviceWidth * 0.04,
				color: eulaContentColor,
			},
			h3Style: {
				fontSize: deviceWidth * 0.04,
				color: eulaContentColor,
			},
		};
	}
}

export default DeviceInfoBlock;
