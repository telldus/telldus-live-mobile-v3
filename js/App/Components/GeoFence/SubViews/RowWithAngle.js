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

import {
	useAppTheme,
} from '../../../Hooks/Theme';

import Theme from '../../../Theme';

type Props = {
    labelText?: string,
    showAngleRight?: boolean,
    rowCoverStyle?: Array<any> | Object,
    labelStyle?: Array<any> | Object,
    imgStyle?: Array<any> | Object,
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
		colors,
	} = useAppTheme();

	const {
		rowCoverStyleDef,
		labelStyleDef,
		imgStyleDef,
	} = getStyles({
		layout,
		colors,
	});

	return (
		<TouchableOpacity onPress={onPress} disabled={!onPress}>
			<View
				level={2}
				style={[rowCoverStyleDef, rowCoverStyle]}>
				{!!labelText &&
                typeof labelText === 'string' ?
					<Text
						level={3}
						style={[labelStyleDef, labelStyle]}>
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

const getStyles = ({
	layout,
	colors,
}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		angleTintColor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const fontSize = deviceWidth * 0.04;

	return {
		rowCoverStyleDef: {
			padding: padding * 1.5,
			borderColor: colors.headerOneColorBlockDisabled,
			borderBottomWidth: StyleSheet.hairlineWidth,
			flexDirection: 'row',
			justifyContent: 'space-between',
			marginHorizontal: padding,
			borderRadius: 2,
		},
		labelStyleDef: {
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
