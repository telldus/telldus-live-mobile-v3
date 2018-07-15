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
 */

// @flow

'use strict';

import React from 'react';
import Ripple from 'react-native-material-ripple';
import moment from 'moment';

import {
	View,
	Icon,
	FormattedDate,
	Text,
} from '../../../../BaseComponents';
import Theme from '../../../Theme';

type Props = {
    appLayout: Object,
    align: 'left' | 'right',
    label: string,
    date: any,
    onPress: (number) => void,
    propToUpdateIndex: number,
};

type Align = 'left' | 'right';

type DefaultProps = {
    align: Align,
};

export default class DateBlock extends View<Props, null> {
props: Props;
static defaultProps: DefaultProps = {
	align: 'left',
};

onPress: () => void;

constructor(props: Props) {
	super(props);

	this.onPress = this.onPress.bind(this);
}

onPress() {
	const { onPress, propToUpdateIndex } = this.props;
	if (onPress) {
		onPress(propToUpdateIndex);
	}
}

render(): Object {
	const {
		appLayout,
		align,
		label,
		date,
	} = this.props;

	const {
		blockContainerStyle,
		iconContainerStyle,
		iconSize,
		dateContainerStyle,
		labelStyle,
		dateStyle,
	} = this.getStyle(appLayout, align);

	return (
		<Ripple
			rippleColor={Theme.rippleColor}
			rippleOpacity={Theme.rippleOpacity}
			rippleDuration={Theme.rippleDuration}
			style={blockContainerStyle}
			onPress={this.onPress}>
			{align === 'left' && (<View style={iconContainerStyle}>
				<Icon name={'calendar'} size={iconSize} color={'#fff'}/>
			</View>)}
			<View style={dateContainerStyle}>
				<Text style={labelStyle}>
					{label}
				</Text>
				<FormattedDate value={moment.unix(date)} style={dateStyle}/>
			</View>
			{align === 'right' && (<View style={iconContainerStyle}>
				<Icon name={'calendar'} size={iconSize} color={'#fff'}/>
			</View>)}
		</Ripple>
	);
}

getStyle(appLayout: Object, align: Align): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const { paddingFactor, brandSecondary, shadow } = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const outerPadding = padding * 2;

	const iconContainerSize = deviceWidth * 0.18;
	const iconSize = deviceWidth * 0.08;
	const fontSizeLabel = deviceWidth * 0.035;
	const fontSizeDate = deviceWidth * 0.049;

	return {
		blockContainerStyle: {
			flexDirection: 'row',
			justifyContent: align === 'left' ? 'flex-start' : 'flex-end',
			alignItems: 'center',
			marginLeft: padding / 2,
			marginBottom: padding,
			width: (deviceWidth - (outerPadding + padding)) / 2,
		},
		iconContainerStyle: {
			height: iconContainerSize,
			width: iconContainerSize,
			borderRadius: iconContainerSize / 2,
			backgroundColor: brandSecondary,
			justifyContent: 'center',
			alignItems: 'center',
			margin: padding,
			...shadow,
		},
		iconSize,
		dateContainerStyle: {
			alignItems: align === 'left' ? 'flex-start' : 'flex-end',
		},
		labelStyle: {
			fontSize: fontSizeLabel,
		},
		dateStyle: {
			fontSize: fontSizeDate,
		},
	};
}
}
