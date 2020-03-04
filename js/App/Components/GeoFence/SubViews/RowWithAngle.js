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
	TouchableOpacity,
	StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';

import {
	View,
	Image,
	Text,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

type Props = {
    labelText?: string,
    showAngleRight?: boolean,
    rowCoverStyle?: Array<any> | number | Object,
    labelStyle?: Array<any> | number | Object,
    imgStyle?: Array<any> | number | Object,
    onPress?: Function,
};

const RowWithAngle: Object = React.memo<Object>((props: Props): Object => {
	const {
		labelText,
		showAngleRight,
		rowCoverStyle,
		labelStyle,
		imgStyle,
		onPress,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		rowCoverStyleDef,
		labelStyleDef,
		imgStyleDef,
	} = getStyles(layout);

	return (
		<TouchableOpacity onPress={onPress} disabled={!onPress}>
			<View style={[rowCoverStyleDef, rowCoverStyle]}>
				{!!labelText &&
                typeof labelText === 'string' ?
					<Text style={[labelStyleDef, labelStyle]}>
						{labelText}
					</Text>
					:
					labelText
				}
				{!!showAngleRight &&
                <Image source={{uri: 'right_arrow_key'}} style={[imgStyleDef, imgStyle]}/>
				}
			</View>
		</TouchableOpacity>
	);
});

RowWithAngle.defaultProps = {
	showAngleRight: true,
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		eulaContentColor,
		angleTintColor,
		angledRowBorderColor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const fontSize = deviceWidth * 0.04;

	return {
		rowCoverStyleDef: {
			padding: padding * 1.5,
			borderColor: angledRowBorderColor,
			borderBottomWidth: StyleSheet.hairlineWidth,
			backgroundColor: '#fff',
			flexDirection: 'row',
			justifyContent: 'space-between',
		},
		labelStyleDef: {
			color: eulaContentColor,
			fontSize,
		},
		imgStyleDef: {
			tintColor: angleTintColor,
			height: fontSize,
			width: fontSize,
		},
	};
};

export default RowWithAngle;
