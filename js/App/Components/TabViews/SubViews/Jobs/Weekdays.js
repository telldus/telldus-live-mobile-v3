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
import { Animated } from 'react-native';

import { View } from '../../../../../BaseComponents';
import { capitalize } from '../../../../Lib';

type Props = {
    day: Object,
    i: number,
    animation: any,
    simulateClick: any,
    onLayout: (number, number) => void;
};

export default class Weekdays extends View<Props, null> {
props: Props;
onLayout: (Object) => void;

constructor(props: Props) {
	super(props);
	this.onLayout = this.onLayout.bind(this);
}

onLayout(ev: Object) {
	const { onLayout, i } = this.props;
	onLayout(ev.nativeEvent.layout.width, i);
}

render(): Object {
	let { day, i, animation, simulateClick } = this.props;
	return (
		<Animated.View
			style={[animation.container, simulateClick]}
			key={`${day.day}${i}`}
			onLayout={this.onLayout}
		>
			<Animated.Text style={animation.text}>
				{capitalize(day.day)}
			</Animated.Text>
		</Animated.View>
	);
}
}
