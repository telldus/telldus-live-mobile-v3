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
const isEqual = require('react-fast-compare');
import DeviceInfo from 'react-native-device-info';

import {
	View,
	Text,
} from '../../../../BaseComponents';
import Theme from '../../../Theme';

type Props = {
    date: Object,
    state: string,
    onDayPress: (Object) => void,
    marking: Object,
    appLayout: Object,
};

export default class CalendarDay extends View<Props, null> {
props: Props;

onDayPress: () => void;
isTablet: boolean;

constructor(props: Props) {
	super(props);

	this.isTablet = DeviceInfo.isTablet();

	this.onDayPress = this.onDayPress.bind(this);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return !isEqual(this.props, nextProps);
}

onDayPress() {
	const { date, state, onDayPress } = this.props;
	if (state !== 'disabled' && onDayPress) {
		onDayPress(date);
	}
}

render(): Object {
	const { rippleColor, rippleDuration, rippleOpacity } = Theme.Core;
	const { date, appLayout } = this.props;
	const { day } = date;

	const {
		container,
		circularContainer,
		periodCover,
		dayText,
	} = this.getStyle(appLayout);
	return (
		<Ripple
			rippleColor={rippleColor}
			rippleOpacity={rippleOpacity}
			rippleDuration={rippleDuration}
			style={container}
			onPress={this.onDayPress}>
			<View style={periodCover}>
				<View style={circularContainer}>
					<Text style={dayText}>
						{day}
					</Text>
				</View>
			</View>
		</Ripple>
	);
}

getStyle(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;

	const { state, marking } = this.props;
	const { selected, marked, startingDay, endingDay } = marking;
	const { brandInfo, inactiveGray, brandSecondary } = Theme.Core;

	const adjustDay = !this.isTablet && !isPortrait;

	const circularContainerSize = adjustDay ? 18 : 24;

	const textColor = selected || marked ? '#fff'
		:
		(state === 'disabled' ? inactiveGray
			:
			(state === 'today' ? brandInfo
				:
				'#2d4150')
		);

	const backgroundColor = selected || marked ? brandSecondary : 'transparent';
	const borderColor = selected ? '#fff' : 'transparent';

	return {
		container: {
			flex: 1,
			alignItems: 'stretch',
			justifyContent: 'center',
			alignSelf: 'center',
		},
		circularContainer: {
			height: circularContainerSize,
			width: circularContainerSize,
			borderRadius: circularContainerSize / 2,
			backgroundColor,
			alignItems: 'center',
			justifyContent: 'center',
			overflow: 'hidden',
			borderWidth: 1,
			borderColor,
		},
		periodCover: {
			height: circularContainerSize,
			width: '100%',
			backgroundColor,
			alignItems: 'center',
			justifyContent: 'center',
			overflow: 'hidden',
			padding: adjustDay ? 3 : 12,
			borderTopLeftRadius: startingDay ? circularContainerSize / 2 : 0,
			borderBottomLeftRadius: startingDay ? circularContainerSize / 2 : 0,
			borderTopRightRadius: endingDay ? circularContainerSize / 2 : 0,
			borderBottomRightRadius: endingDay ? circularContainerSize / 2 : 0,
		},
		dayText: {
			fontSize: adjustDay ? 11 : 14,
			color: textColor,
		},
	};
}
}
