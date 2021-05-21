
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

import React, {
	memo,
} from 'react';
import { useSelector } from 'react-redux';
import {
	Platform,
} from 'react-native';
// import { useIntl } from 'react-intl';

import {
	View,
	Text,
	IconTelldus,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

// import i18n from '../../../Translations/common';


type Props = {
    leftIcon?: string,
    label?: string,
    isLast: boolean,
	seperatorText?: string,
	isFirst: boolean,
};

const BlockItem = memo<Object>((props: Props): Object => {
	const {
		leftIcon,
		label,
		isLast,
		seperatorText,
		isFirst,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		containerStyle,
		labelStyle,
		leftIconStyle,
		seperatorContainerStyle,
		seperatorTextStyle,
	} = getStyle({
		layout,
		isLast,
	});

	return (
		<View style={{flex: 1}}>
			{!isFirst && seperatorText && (
				<View
					style={seperatorContainerStyle}>
					<Text
						level={3}
						style={seperatorTextStyle}>
						{seperatorText}
					</Text>
				</View>
			)}
			<View
				level={2}
				style={containerStyle}>
				<IconTelldus
					style={leftIconStyle}
					icon={leftIcon}
					level={3}/>
				<Text
					level={3}
					style={labelStyle}>
					{label}
				</Text>
			</View>
		</View>
	);
});

const getStyle = ({
	layout,
	isLast,
}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const {
		paddingFactor,
		fontSizeFactorFour,
		shadow,
		fontSizeFactorThree,
	} = Theme.Core;
	const padding = deviceWidth * paddingFactor;

	const fontSize = deviceWidth * fontSizeFactorFour;
	const seperatorFontSize = deviceWidth * fontSizeFactorThree;

	return {
		containerStyle: {
			flex: 1,
			flexDirection: 'row',
			marginTop: padding / 2,
			alignItems: 'center',
			padding: fontSize,
			...shadow,
			borderRadius: 2,
			marginHorizontal: padding,
			marginBottom: isLast ? padding : 0,
			justifyContent: 'flex-start',
		},
		labelStyle: {
			fontSize,
			marginLeft: padding,
			paddingVertical: Platform.OS === 'ios' ? 8 : 6,
			flex: 1,
			flexWrap: 'wrap',
		},
		leftIconStyle: {
			fontSize: fontSize * 1.2,
		},
		seperatorContainerStyle: {
			flex: 0,
			paddingHorizontal: 15,
			paddingVertical: 5,
			borderRadius: (seperatorFontSize * 0.5) + 5,
			marginTop: padding,
			marginBottom: padding / 2,
			alignItems: 'center',
			justifyContent: 'center',
			alignSelf: 'center',
			backgroundColor: '#b5b5b5',
		},
		seperatorTextStyle: {
			fontSize: seperatorFontSize,
		},
	};
};

export default BlockItem;
