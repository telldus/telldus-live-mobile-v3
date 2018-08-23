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
	BlockIcon,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';


type Props = {
	appLayout: Object,
    onDidMount: (string, string, ?Object) => void,
};

class IncludeDevice extends View<Props, null> {
props: Props;
constructor(props: Props) {
	super(props);
}

componentDidMount() {
	const { onDidMount } = this.props;
	onDidMount('2. Device Type', 'Select the type of your device');
}

render(): Object {
	const {
		container,
		progressContainer,
		infoContainer,
		imageType,
		textStyle,
		infoIconStyle,
		blockIcontainerStyle,
		markerTextCover,
		markerText,
	} = this.getStyles();

	return (
		<View style={container}>
			<View style={progressContainer}>
				<View style={{
					flexDirection: 'column',
				}}>
					<View style={markerTextCover}>
						<Text style={markerText}>
                            1.
						</Text>
					</View>
					<Image source={{uri: 'icon_location_otio_box'}} resizeMode={'cover'} style={imageType}/>
				</View>
				<View style={{
					flex: 1,
					flexDirection: 'column',
					flexWrap: 'wrap',
				}}>
					<Text style={textStyle}>
Include device by enabling inclusion mode on the device within 60 seconds.
					</Text>
					<Text style={textStyle}>
When in inclusion mode the device will automatically be included.
					</Text>
				</View>
			</View>
			<View style={infoContainer}>
				<BlockIcon icon={'info'} style={infoIconStyle} containerStyle={blockIcontainerStyle}/>
				<View style={{
					flex: 1,
					flexDirection: 'column',
					flexWrap: 'wrap',
				}}>
					<Text style={textStyle}>
This is usually done by clicking three times on the button on the device. Refer to the manual of your device on how to enter inclusion mode.
					</Text>
				</View>
			</View>
		</View>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const { paddingFactor, shadow, rowTextColor, brandSecondary, brandPrimary } = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = deviceWidth * 0.035;
	const blockIconContainerSize = deviceWidth * 0.26;

	return {
		container: {
			flex: 1,
			paddingTop: padding,
			paddingBottom: padding / 2,
		},
		progressContainer: {
			flexDirection: 'row',
			marginBottom: padding / 2,
			backgroundColor: '#fff',
			borderRadius: 2,
			padding: 5 + (fontSizeText * 0.5),
			...shadow,
		},
		infoContainer: {
			flexDirection: 'row',
			marginBottom: padding / 2,
			backgroundColor: '#fff',
			borderRadius: 2,
			padding: 5 + (fontSizeText * 0.5),
			...shadow,
		},
		markerTextCover: {
			position: 'absolute',
			left: -(5 + (fontSizeText * 0.5)),
			top: -(5 + (fontSizeText * 0.5)),
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: brandPrimary,
			borderBottomRightRadius: deviceWidth * 0.075,
			height: deviceWidth * 0.075,
			width: deviceWidth * 0.17,
		},
		markerText: {
			fontSize: deviceWidth * 0.045,
			color: '#fff',
		},
		imageType: {
			height: deviceWidth * 0.18,
			width: deviceWidth * 0.26,
		},
		textStyle: {
			fontSize: fontSizeText,
			color: rowTextColor,
		},
		infoIconStyle: {
			fontSize: blockIconContainerSize / 2,
			color: brandSecondary,
		},
		blockIcontainerStyle: {
			width: blockIconContainerSize,
			height: undefined,
			borderRadius: 0,
			backgroundColor: '#fff',
		},
	};
}
}

export default IncludeDevice;
